package connector

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	// _ "github.com/mattn/go-odbc" // ODBC driver
)

// DBResource represents a discovered database connection
type DBResource struct {
	ID             string `json:"id"`
	Type           string `json:"type"` // "postgres", "odbc", "mysql", etc.
	Name           string `json:"name"`
	ConnectionDSN  string `json:"connection_dsn"`
	Capabilities   []string `json:"capabilities"`
}

// DatabaseConnector manages all database connections
type DatabaseConnector struct {
	pools map[string]*pgxpool.Pool     // PostgreSQL pools
	odbc  map[string]*sql.DB           // ODBC connections
}

func NewDatabaseConnector() *DatabaseConnector {
	return &DatabaseConnector{
		pools: make(map[string]*pgxpool.Pool),
		odbc:  make(map[string]*sql.DB),
	}
}

// Connect establishes connection to a database resource
func (dc *DatabaseConnector) Connect(ctx context.Context, resource DBResource) error {
	switch resource.Type {
	case "postgres":
		return dc.connectPostgres(ctx, resource)
	case "odbc":
		return dc.connectODBC(resource)
	default:
		return fmt.Errorf("unsupported database type: %s", resource.Type)
	}
}

func (dc *DatabaseConnector) connectPostgres(ctx context.Context, res DBResource) error {
	config, err := pgxpool.ParseConfig(res.ConnectionDSN)
	if err != nil {
		return err
	}

	config.MaxConns = 10
	config.MinConns = 2
	config.MaxConnLifetime = 30 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return err
	}

	// Test connection
	if err := pool.Ping(ctx); err != nil {
		return err
	}

	dc.pools[res.ID] = pool
	log.Printf("✅ Connected to PostgreSQL: %s", res.Name)
	return nil
}

func (dc *DatabaseConnector) connectODBC(res DBResource) error {
	// Commenting out explicit OBDC dialer for standard Go dev ease but leaving structure.
	log.Printf("✅ Simulated Connection to ODBC source: %s", res.Name)
	return nil
}

// ExecuteQuery runs a query on a database resource
func (dc *DatabaseConnector) ExecuteQuery(ctx context.Context, resourceID string, query string, params []interface{}) (interface{}, error) {
	if pool, ok := dc.pools[resourceID]; ok {
		return dc.executePostgres(ctx, pool, query, params)
	}
	if db, ok := dc.odbc[resourceID]; ok {
		return dc.executeODBC(ctx, db, query, params)
	}
	return nil, fmt.Errorf("no active connection for resource %s", resourceID)
}

func (dc *DatabaseConnector) executePostgres(ctx context.Context, pool *pgxpool.Pool, query string, params []interface{}) (interface{}, error) {
	rows, err := pool.Query(ctx, query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	columns := rows.FieldDescriptions()
	result := make([]map[string]interface{}, 0)

	for rows.Next() {
		values, err := rows.Values()
		if err != nil {
			return nil, err
		}

		row := make(map[string]interface{})
		for i, col := range columns {
			row[string(col.Name)] = values[i]
		}
		result = append(result, row)
	}

	return map[string]interface{}{
		"rows":    result,
		"count":   len(result),
	}, nil
}

func (dc *DatabaseConnector) executeODBC(ctx context.Context, db *sql.DB, query string, params []interface{}) (interface{}, error) {
    // Stub implementation
	return map[string]interface{}{
		"rows":  []interface{}{},
		"count": 0,
	}, nil
}

// Close closes all connections
func (dc *DatabaseConnector) Close() {
	for _, pool := range dc.pools {
		pool.Close()
	}
	for _, db := range dc.odbc {
		db.Close()
	}
}
