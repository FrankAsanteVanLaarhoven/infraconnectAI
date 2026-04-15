# Grok Direct Server Connector Windows Installer
param(
    [string]$Token = ""
)

if (-not $Token) {
    Write-Host "❌ Missing --token parameter" -ForegroundColor Red
    Write-Host "Usage: .\install.ps1 -Token YOUR_INVITE_TOKEN" -ForegroundColor Yellow
    exit 1
}

$Version = "1.0.0-beta"
$InstallDir = "$env:ProgramFiles\GrokConnector"
$BinaryPath = "$InstallDir\gdsc.exe"

Write-Host "🚀 Installing Grok Direct Server Connector v$Version..." -ForegroundColor Green

# Create directory
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

# Download binary (replace with real URL in production)
$Url = "https://connect.grok.com/bin/gdsc-windows-amd64.v$Version.zip"
Invoke-WebRequest -Uri $Url -OutFile "$env:TEMP\gdsc.zip"
Expand-Archive -Path "$env:TEMP\gdsc.zip" -DestinationPath $InstallDir -Force

# Register agent
& $BinaryPath register --token $Token

# Install as Windows Service using NSSM (recommended) or sc.exe
$ServiceName = "GrokConnector"

# Check if NSSM is available, otherwise give instructions
if (Get-Command nssm -ErrorAction SilentlyContinue) {
    nssm install $ServiceName $BinaryPath "run"
    nssm set $ServiceName DisplayName "Grok Direct Server Connector"
    nssm set $ServiceName Description "Secure outbound connector to Grok AI Platform"
    nssm set $ServiceName Start SERVICE_AUTO_START
    nssm start $ServiceName
    Write-Host "✅ Windows service installed and started!" -ForegroundColor Green
} else {
    Write-Host "⚠️  NSSM not found. Installing service manually..." -ForegroundColor Yellow
    Write-Host "Run as Administrator:"
    Write-Host "sc.exe create $ServiceName binPath= `"$BinaryPath run`" start= auto"
    Write-Host "sc.exe start $ServiceName"
}

Write-Host "`n🎉 Installation complete! Connect at http://localhost:3006/" -ForegroundColor Green
