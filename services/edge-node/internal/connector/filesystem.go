package connector

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// FSResource represents a filesystem resource
type FSResource struct {
	ID            string   `json:"id"`
	Type          string   `json:"type"` // "filesystem", "nfs", "smb"
	Name          string   `json:"name"`
	BasePath      string   `json:"base_path"`
	Capabilities  []string `json:"capabilities"` // ["read", "write", "watch"]
	AllowedPaths  []string `json:"allowed_paths"` // security: restricted to these paths
}

// FileInfo for responses
type FileInfo struct {
	Path      string    `json:"path"`
	Name      string    `json:"name"`
	Size      int64     `json:"size"`
	ModTime   time.Time `json:"mod_time"`
	IsDir     bool      `json:"is_dir"`
	Permissions string  `json:"permissions"`
}

// FilesystemConnector handles secure local filesystem access
type FilesystemConnector struct {
	resources map[string]FSResource
}

func NewFilesystemConnector() *FilesystemConnector {
	return &FilesystemConnector{
		resources: make(map[string]FSResource),
	}
}

// RegisterResource registers a new filesystem resource with path restrictions
func (fsc *FilesystemConnector) RegisterResource(res FSResource) {
	// Normalize paths for security
	res.BasePath = filepath.Clean(res.BasePath)
	fsc.resources[res.ID] = res
}

// ListFiles returns directory listing with security checks
func (fsc *FilesystemConnector) ListFiles(resourceID, dirPath string) ([]FileInfo, error) {
	res, exists := fsc.resources[resourceID]
	if !exists {
		return nil, fmt.Errorf("filesystem resource not found")
	}

	fullPath := fsc.resolveSafePath(res, dirPath)
	if fullPath == "" {
		return nil, fmt.Errorf("access denied: path outside allowed boundaries")
	}

	entries, err := os.ReadDir(fullPath)
	if err != nil {
		return nil, err
	}

	var files []FileInfo
	for _, entry := range entries {
		info, _ := entry.Info()
		files = append(files, FileInfo{
			Path:        filepath.Join(dirPath, entry.Name()),
			Name:        entry.Name(),
			Size:        info.Size(),
			ModTime:     info.ModTime(),
			IsDir:       entry.IsDir(),
			Permissions: info.Mode().String(),
		})
	}
	return files, nil
}

// ReadFile reads file content safely
func (fsc *FilesystemConnector) ReadFile(resourceID, filePath string, limitBytes int64) ([]byte, error) {
	res, exists := fsc.resources[resourceID]
	if !exists {
		return nil, fmt.Errorf("resource not found")
	}

	fullPath := fsc.resolveSafePath(res, filePath)
	if fullPath == "" {
		return nil, fmt.Errorf("access denied")
	}

	if limitBytes > 0 {
		f, err := os.Open(fullPath)
		if err != nil {
			return nil, err
		}
		defer f.Close()
		return io.ReadAll(io.LimitReader(f, limitBytes))
	}

	return os.ReadFile(fullPath)
}

// WriteFile writes file with safety checks
func (fsc *FilesystemConnector) WriteFile(resourceID, filePath string, data []byte) error {
	res, exists := fsc.resources[resourceID]
	if !exists {
		return fmt.Errorf("resource not found")
	}

	fullPath := fsc.resolveSafePath(res, filePath)
	if fullPath == "" {
		return fmt.Errorf("access denied")
	}

	// Ensure directory exists
	dir := filepath.Dir(fullPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	return os.WriteFile(fullPath, data, 0644)
}

// resolveSafePath prevents path traversal attacks
func (fsc *FilesystemConnector) resolveSafePath(res FSResource, requestedPath string) string {
	cleanPath := filepath.Clean(requestedPath)
	fullPath := filepath.Join(res.BasePath, cleanPath)

	// Prevent directory traversal
	if !strings.HasPrefix(fullPath, res.BasePath) {
		return ""
	}

	// Check against allowed paths if specified
	if len(res.AllowedPaths) > 0 {
		allowed := false
		for _, allowedPath := range res.AllowedPaths {
			if strings.HasPrefix(fullPath, filepath.Join(res.BasePath, allowedPath)) {
				allowed = true
				break
			}
		}
		if !allowed {
			return ""
		}
	}

	return fullPath
}
