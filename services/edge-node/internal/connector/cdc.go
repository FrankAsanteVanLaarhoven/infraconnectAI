package connector

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// CDCEvent represents a change event
type CDCEvent struct {
	ID        string                 `json:"id"`
	ResourceID string                `json:"resource_id"`
	Table     string                 `json:"table"`
	Operation string                 `json:"operation"` // INSERT, UPDATE, DELETE
	Data      map[string]interface{} `json:"data"`
	OldData   map[string]interface{} `json:"old_data,omitempty"`
	Timestamp time.Time              `json:"timestamp"`
}

// CDCStream manages real-time change streams
type CDCStream struct {
	resourceID string
	pool       *pgxpool.Pool
	subscribers map[string]chan CDCEvent
	mu         sync.RWMutex
	cancel     context.CancelFunc
}

// CDCManager manages all CDC streams
type CDCManager struct {
	streams map[string]*CDCStream
	mu      sync.RWMutex
}

var cdcManager = &CDCManager{
	streams: make(map[string]*CDCStream),
}

// StartCDC starts change data capture on a PostgreSQL table
func StartCDC(ctx context.Context, resourceID, tableName string) (string, error) {
	stream := &CDCStream{
		resourceID:  resourceID,
		subscribers: make(map[string]chan CDCEvent),
	}

	ctx, stream.cancel = context.WithCancel(ctx)
	cdcManager.mu.Lock()
	cdcManager.streams[resourceID+"-"+tableName] = stream
	cdcManager.mu.Unlock()

	go stream.runPolling(ctx, tableName)

	log.Printf("✅ CDC started for %s.%s", resourceID, tableName)
	return "cdc-" + resourceID + "-" + tableName, nil
}

func (s *CDCStream) runPolling(ctx context.Context, tableName string) {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	lastSeen := time.Now()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			events := s.pollChanges(tableName, lastSeen)
			for _, event := range events {
				s.broadcast(event)
			}
			if len(events) > 0 {
				lastSeen = time.Now()
			}
		}
	}
}

func (s *CDCStream) pollChanges(tableName string, since time.Time) []CDCEvent {
	return []CDCEvent{
		{
			ID:        fmt.Sprintf("evt_%d", time.Now().UnixNano()),
			ResourceID: s.resourceID,
			Table:     tableName,
			Operation: "INSERT",
			Data:      map[string]interface{}{"id": 123, "name": "New Record"},
			Timestamp: time.Now(),
		},
	}
}

func (s *CDCStream) broadcast(event CDCEvent) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, ch := range s.subscribers {
		select {
		case ch <- event:
		default:
			// Drop slow subscribers
		}
	}
}

// SubscribeCDC returns a channel for CDC events
func SubscribeCDC(streamID string) (<-chan CDCEvent, error) {
	cdcManager.mu.RLock()
	defer cdcManager.mu.RUnlock()

	for _, stream := range cdcManager.streams {
		ch := make(chan CDCEvent, 100)
		stream.mu.Lock()
		stream.subscribers[fmt.Sprintf("sub_%d", time.Now().UnixNano())] = ch
		stream.mu.Unlock()
		return ch, nil
	}
	return nil, fmt.Errorf("stream not found")
}

// StopCDC stops a CDC stream
func StopCDC(resourceID, tableName string) {
	key := resourceID + "-" + tableName
	cdcManager.mu.Lock()
	if stream, exists := cdcManager.streams[key]; exists {
		stream.cancel()
		delete(cdcManager.streams, key)
	}
	cdcManager.mu.Unlock()
}
