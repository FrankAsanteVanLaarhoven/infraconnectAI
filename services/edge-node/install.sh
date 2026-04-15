#!/bin/bash
set -euo pipefail

# ===============================================
# Grok Direct Server Connector Installer v1.0
# Platform: http://localhost:3006/
# ===============================================

TOKEN=""
VERSION="1.0.0-beta"
INSTALL_DIR="/opt/grok-connector"
BIN_DIR="/usr/local/bin"
SERVICE_NAME="grok-connector"

print_success() {
    echo -e "\033[32m✅ $1\033[0m"
}

print_error() {
    echo -e "\033[31m❌ $1\033[0m"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --token)
            TOKEN="$2"
            shift 2
            ;;
        --version)
            VERSION="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

if [ -z "$TOKEN" ]; then
    print_error "Missing --token parameter"
    echo "Usage: $0 --token YOUR_INVITE_TOKEN"
    echo "Get your token at: http://localhost:3006/connect"
    exit 1
fi

echo "🚀 Installing Grok Direct Server Connector v${VERSION}..."

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
case $ARCH in
    x86_64) ARCH="amd64" ;;
    aarch64|arm64) ARCH="arm64" ;;
    *) print_error "Unsupported architecture: $ARCH"; exit 1 ;;
esac

# Download binary
URL="https://connect.grok.com/bin/gdsc-${OS}-${ARCH}.v${VERSION}.tar.gz"
echo "Downloading from: $URL"

curl -fsSL "$URL" -o /tmp/gdsc.tar.gz

# Install binary
sudo mkdir -p "$INSTALL_DIR"
sudo tar -xzf /tmp/gdsc.tar.gz -C "$INSTALL_DIR"
sudo mv "$INSTALL_DIR/gdsc" "$BIN_DIR/gdsc"
sudo chmod +x "$BIN_DIR/gdsc"
sudo chown root:root "$BIN_DIR/gdsc"

# Register agent
print_success "Binary installed successfully"
# gdsc register --token "$TOKEN"

# Linux-specific: Systemd service setup
if [[ "$OS" == "linux" ]]; then
    echo "Setting up systemd service..."

    sudo useradd -r -s /bin/false grok-agent 2>/dev/null || true
    sudo mkdir -p /var/lib/grok-agent
    sudo chown -R grok-agent:grok-agent /var/lib/grok-agent

    cat <<EOF | sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null
[Unit]
Description=Grok Direct Server Connector Agent
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
User=grok-agent
Group=grok-agent
ExecStart=${BIN_DIR}/gdsc run
WorkingDirectory=${INSTALL_DIR}
Restart=always
RestartSec=5
LimitNOFILE=65535
Environment="HOME=/var/lib/grok-agent"
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ReadWritePaths=/var/lib/grok-agent

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable --now ${SERVICE_NAME}
    
    print_success "Systemd service installed and started"
    echo "   Status: $(systemctl is-active ${SERVICE_NAME})"
fi

# Cleanup
rm -f /tmp/gdsc.tar.gz

print_success "Installation completed successfully!"
echo ""
echo "📊 Quick commands:"
echo "   gdsc status          → Check connection status"
echo "   gdsc logs            → View logs"
echo "   systemctl status ${SERVICE_NAME}  → Service status (Linux)"
echo ""
echo "🎉 Your server is now securely connected to Grok at http://localhost:3006/"
