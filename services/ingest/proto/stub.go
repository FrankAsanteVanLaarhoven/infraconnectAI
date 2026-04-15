package proto

import (
	"context"

	"google.golang.org/grpc"
	"google.golang.org/protobuf/types/known/structpb"
)

type TelemetryFrame struct {
	AgentId    string
	Tick       int64
	TsMs       int64
	DeployTier string
	Modality   string
	Payload    *structpb.Struct
	LatencyMs  float64
}

type TelemetryBatch struct {
	Frames []*TelemetryFrame
}

type IngestAck struct {
	Received int32
}

type HeartbeatRequest struct {
	AgentId string
	TsMs    int64
}

type HeartbeatAck struct {
	Ok bool
}

type IncidentRequest struct {
	AgentId     string
	Severity    string
	Category    string
	Description string
}

type IngestServiceServer interface {
	SendTelemetry(context.Context, *TelemetryBatch) (*IngestAck, error)
	SendHeartbeat(context.Context, *HeartbeatRequest) (*HeartbeatAck, error)
	ReportIncident(context.Context, *IncidentRequest) (*IngestAck, error)
}

type UnimplementedIngestServiceServer struct{}

func (UnimplementedIngestServiceServer) SendTelemetry(context.Context, *TelemetryBatch) (*IngestAck, error) {
	return nil, nil
}
func (UnimplementedIngestServiceServer) SendHeartbeat(context.Context, *HeartbeatRequest) (*HeartbeatAck, error) {
	return nil, nil
}
func (UnimplementedIngestServiceServer) ReportIncident(context.Context, *IncidentRequest) (*IngestAck, error) {
	return nil, nil
}

func RegisterIngestServiceServer(s grpc.ServiceRegistrar, srv IngestServiceServer) {
	// Stub implementation for compilation
}
