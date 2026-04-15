package sdk

// Resource defines a discovered target (DB, API, Filesystem)
type Resource struct {
	ID               string   `json:"id"`
	Type             string   `json:"type"`             // postgres, api, filesystem
	Name             string   `json:"name"`
	ConnectionString string   `json:"connection_string"`
	Capabilities     []string `json:"capabilities"`     // e.g. ["cdc", "batch", "realtime"]
}

// Event represents a normalized payload from the Universal Protocol Engine
type Event struct {
	ResourceID string
	Payload    map[string]interface{}
	Timestamp  int64
}

// Connector defines the plugin SDK interface for all edge intelligence nodes
// This is the Universal Protocol Engine abstraction that wraps legacy systems.
type Connector interface {
	// Discover scans the local VPC/environment for resources of this type
	Discover() ([]Resource, error)

	// Connect establishes a connection using the specific underlying protocol
	Connect(res Resource) error

	// Sync starts streaming CDC or logical events out from the source 
	Sync(res Resource, out chan<- Event) error
}
