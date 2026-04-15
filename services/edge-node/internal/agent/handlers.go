package agent

import (
	"context"
	"encoding/json"
	"fmt"
    "time"

	"infraconnectai/edge-node/internal/connector"
)

var dbConnector = connector.NewDatabaseConnector()

func handleDiscover(payload json.RawMessage) (interface{}, error) {
	// Auto-discovery logic 
	return map[string]interface{}{
		"resources": []connector.DBResource{
			{
				ID:            "db-prod-1",
				Type:          "postgres",
				Name:          "Production PostgreSQL",
				ConnectionDSN: "postgres://user:pass@localhost:5432/mydb?sslmode=prefer",
				Capabilities:  []string{"query", "cdc", "schema"},
			},
			{
				ID:            "legacy-erp",
				Type:          "odbc",
				Name:          "Legacy ERP System",
				ConnectionDSN: "DSN=LegacyERP;UID=admin;PWD=secret;",
				Capabilities:  []string{"query", "read_only"},
			},
		},
	}, nil
}

func handleExecute(payload json.RawMessage) (interface{}, error) {
	var req struct {
		ResourceID string                 `json:"resource_id"`
		Operation  string                 `json:"operation"`
		Query      string                 `json:"query"`
		Params     []interface{}          `json:"params,omitempty"`
	}
	if err := json.Unmarshal(payload, &req); err != nil {
		return nil, err
	}

	if req.Operation == "query" || req.Operation == "execute" {
		ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
		defer cancel()

		result, err := dbConnector.ExecuteQuery(ctx, req.ResourceID, req.Query, req.Params)
		if err != nil {
			return nil, err
		}
		return result, nil
	}

	return nil, fmt.Errorf("unsupported operation: %s", req.Operation)
}

func handleCDCStart(payload json.RawMessage) (interface{}, error) {
	var req struct {
		ResourceID string `json:"resource_id"`
		Table      string `json:"table"`
	}
	json.Unmarshal(payload, &req)

	streamID, err := connector.StartCDC(context.Background(), req.ResourceID, req.Table)
	if err != nil {
		return nil, err
	}
	return map[string]string{"stream_id": streamID, "status": "started"}, nil
}

func handleCDCStop(payload json.RawMessage) (interface{}, error) {
	var req struct {
		ResourceID string `json:"resource_id"`
		Table      string `json:"table"`
	}
	json.Unmarshal(payload, &req)
	connector.StopCDC(req.ResourceID, req.Table)
	return map[string]string{"status": "stopped"}, nil
}

func handlePing(payload json.RawMessage) (interface{}, error) {
	return map[string]string{"message": "pong"}, nil
}

func handleRevoke(payload json.RawMessage) (interface{}, error) {
	fmt.Println("❌ Agent revoked by platform. Shutting down...")
	return map[string]string{"status": "revoked"}, nil
}
