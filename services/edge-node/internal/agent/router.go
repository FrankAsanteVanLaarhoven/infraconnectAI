package agent

import (
	"encoding/json"
	"fmt"
	"log"
)

// Command represents incoming messages from the Grok platform
type Command struct {
	ID        string          `json:"id"`
	Type      string          `json:"type"`
	Payload   json.RawMessage `json:"payload"`
	Timestamp string          `json:"timestamp"`
}

type Response struct {
	ID      string      `json:"id"`
	Type    string      `json:"type"`
	Status  string      `json:"status"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

type HandlerFunc func(payload json.RawMessage) (interface{}, error)

// Router handles all incoming commands from the platform
type Router struct {
	handlers map[string]HandlerFunc
}

func NewRouter() *Router {
	r := &Router{
		handlers: make(map[string]HandlerFunc),
	}
	r.registerHandlers()
	return r
}

func (r *Router) registerHandlers() {
	r.handlers["discover"] = handleDiscover
	r.handlers["execute"] = handleExecute
	r.handlers["cdc_start"] = handleCDCStart
	r.handlers["cdc_stop"] = handleCDCStop
	r.handlers["ping"] = handlePing
	r.handlers["revoke"] = handleRevoke
}

func (r *Router) Handle(msg []byte) []byte {
	var cmd Command
	if err := json.Unmarshal(msg, &cmd); err != nil {
		log.Printf("Failed to parse command: %v", err)
		return errorResponse("", "invalid_command", "Failed to parse JSON")
	}

	handler, exists := r.handlers[cmd.Type]
	if !exists {
		log.Printf("Unknown command type: %s", cmd.Type)
		return errorResponse(cmd.ID, "unknown_command", "Command not supported")
	}

	result, err := handler(cmd.Payload)
	if err != nil {
		log.Printf("Handler error for %s: %v", cmd.Type, err)
		return errorResponse(cmd.ID, cmd.Type, err.Error())
	}

	resp := Response{
		ID:     cmd.ID,
		Type:   cmd.Type,
		Status: "success",
		Data:   result,
	}

	data, _ := json.Marshal(resp)
	return data
}

func errorResponse(id, cmdType, errMsg string) []byte {
	resp := Response{
		ID:     id,
		Type:   cmdType,
		Status: "error",
		Error:  errMsg,
	}
	data, _ := json.Marshal(resp)
	return data
}
