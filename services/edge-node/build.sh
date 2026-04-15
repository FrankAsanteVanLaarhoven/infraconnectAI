#!/bin/bash
set -e

VERSION="1.0.0-beta"

echo "Building Grok Direct Server Connector v${VERSION}..."

mkdir -p bin

# Linux
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w -X main.Version=${VERSION}" \
  -o bin/gdsc-linux-amd64 ./cmd/agent

# Windows
GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w -X main.Version=${VERSION}" \
  -o bin/gdsc-windows-amd64.exe ./cmd/agent

# Create archives
tar -czf bin/gdsc-linux-amd64.v${VERSION}.tar.gz -C bin gdsc-linux-amd64
zip -j bin/gdsc-windows-amd64.v${VERSION}.zip bin/gdsc-windows-amd64.exe

echo "✅ Build complete!"
ls -lh bin/
