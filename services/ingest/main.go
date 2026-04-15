// services/ingest/main.go
// INFRACONNECTAI Go Ingestion Firehose
// Receives telemetry from edge nodes + Tauri, writes to Postgres + NATS

package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "net"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/jackc/pgx/v5/pgxpool"
    "github.com/joho/godotenv"
    "github.com/nats-io/nats.go"
    "google.golang.org/grpc"
    "google.golang.org/grpc/reflection"

    pb "infraconnectai/ingest/proto"
)

var (
    db   *pgxpool.Pool
    nc   *nats.Conn
)

func main() {
    // Load .env (same file as Next.js / Prisma)
    if err := godotenv.Load("../../.env"); err != nil {
        log.Println("No .env file — reading from environment")
    }

    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()

    // ── Postgres connection pool ──────────────────────────────────────────
    dbURL := os.Getenv("DATABASE_URL")
    if dbURL == "" {
        log.Fatal("DATABASE_URL not set")
    }
    var err error
    db, err = pgxpool.New(ctx, dbURL)
    if err != nil {
        log.Fatalf("Postgres connect failed: %v", err)
    }
    defer db.Close()
    log.Println("✅ Postgres connected")

    // ── NATS connection ───────────────────────────────────────────────────
    natsURL := os.Getenv("NATS_URL")
    if natsURL == "" {
        natsURL = nats.DefaultURL // nats://localhost:4222
    }
    nc, err = nats.Connect(natsURL)
    if err != nil {
        log.Printf("⚠️  NATS unavailable (%v) — running without fan-out", err)
        nc = nil
    } else {
        defer nc.Close()
        log.Println("✅ NATS connected")
    }

    // ── gRPC server ───────────────────────────────────────────────────────
    lis, err := net.Listen("tcp", ":50051")
    if err != nil {
        log.Fatalf("gRPC listen failed: %v", err)
    }
    grpcServer := grpc.NewServer()
    pb.RegisterIngestServiceServer(grpcServer, &IngestServer{})
    reflection.Register(grpcServer)

    go func() {
        log.Println("✅ gRPC firehose listening on :50051")
        if err := grpcServer.Serve(lis); err != nil {
            log.Printf("gRPC server error: %v", err)
        }
    }()

    // ── Unix socket for Tauri relay ───────────────────────────────────────
    sockPath := "/tmp/infraconnectai-ingest.sock"
    os.Remove(sockPath)
    unixLis, err := net.Listen("unix", sockPath)
    if err != nil {
        log.Printf("Unix socket failed: %v — Tauri relay unavailable", err)
    } else {
        go serveUnixSocket(ctx, unixLis)
        log.Printf("✅ Unix socket: %s", sockPath)
    }

    // ── Heartbeat monitor ─────────────────────────────────────────────────
    go heartbeatMonitor(ctx)

    // ── Graceful shutdown ─────────────────────────────────────────────────
    sig := make(chan os.Signal, 1)
    signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
    <-sig
    log.Println("Shutting down firehose...")
    grpcServer.GracefulStop()
}

// ── gRPC handler ──────────────────────────────────────────────────────────────

type IngestServer struct {
    pb.UnimplementedIngestServiceServer
}

func (s *IngestServer) SendTelemetry(
    ctx context.Context,
    req *pb.TelemetryBatch,
) (*pb.IngestAck, error) {

    tx, err := db.Begin(ctx)
    if err != nil {
        return nil, fmt.Errorf("tx begin: %w", err)
    }
    defer tx.Rollback(ctx)

    for _, frame := range req.Frames {
        payloadJSON, _ := json.Marshal(frame.Payload.AsMap())

        _, err = tx.Exec(ctx, `
            INSERT INTO "AgentTelemetry"
              ("id","agentId","tick","ts","deployTier","modality","payload","latencyMs")
            VALUES
              (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
        `,
            frame.AgentId,
            frame.Tick,
            time.UnixMilli(frame.TsMs),
            frame.DeployTier,
            frame.Modality,
            payloadJSON,
            frame.LatencyMs,
        )
        if err != nil {
            return nil, fmt.Errorf("telemetry insert: %w", err)
        }

        // Run constraint checks inline for flagged modalities
        if frame.Modality == "imu" || frame.Modality == "force" ||
           frame.Modality == "depth" || frame.Modality == "lidar" {
            go checkConstraints(context.Background(), frame)
        }

        // NATS fan-out (non-blocking)
        if nc != nil {
            topic := fmt.Sprintf("agent.%s.telemetry", frame.AgentId)
            nc.Publish(topic, payloadJSON)
        }
    }

    if err := tx.Commit(ctx); err != nil {
        return nil, fmt.Errorf("tx commit: %w", err)
    }

    return &pb.IngestAck{Received: int32(len(req.Frames))}, nil
}

func (s *IngestServer) SendHeartbeat(
    ctx context.Context,
    req *pb.HeartbeatRequest,
) (*pb.HeartbeatAck, error) {

    _, err := db.Exec(ctx, `
        UPDATE "AgentRegistration"
        SET "lastHeartbeat" = NOW(), "status" = 'live'
        WHERE "id" = $1
    `, req.AgentId)
    if err != nil {
        log.Printf("Heartbeat update failed for %s: %v", req.AgentId, err)
    }

    if nc != nil {
        nc.Publish(fmt.Sprintf("agent.%s.heartbeat", req.AgentId),
            []byte(fmt.Sprintf(`{"agentId":"%s","ts":%d}`, req.AgentId, req.TsMs)))
    }

    return &pb.HeartbeatAck{Ok: true}, nil
}

func (s *IngestServer) ReportIncident(
    ctx context.Context,
    req *pb.IncidentRequest,
) (*pb.IngestAck, error) {

    _, err := db.Exec(ctx, `
        INSERT INTO "AgentIncident"
          ("id","agentId","severity","category","description","ts")
        VALUES
          (gen_random_uuid(), $1, $2, $3, $4, NOW())
    `, req.AgentId, req.Severity, req.Category, req.Description)
    if err != nil {
        return nil, fmt.Errorf("incident insert: %w", err)
    }

    if nc != nil {
        payload, _ := json.Marshal(req)
        nc.Publish(fmt.Sprintf("agent.%s.incident", req.AgentId), payload)
    }

    log.Printf("🚨 Incident [%s] agent=%s: %s", req.Severity, req.AgentId, req.Description)
    return &pb.IngestAck{Received: 1}, nil
}

// ── Dummy stubs for compilation ────────────────────────────────────────────────
func heartbeatMonitor(ctx context.Context) {}
func serveUnixSocket(ctx context.Context, l net.Listener) {}
func checkConstraints(ctx context.Context, frame *pb.TelemetryFrame) {}
