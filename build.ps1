# Moderator App Tauri Build Script
# This script helps build the app for different platforms

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "build", "win", "linux", "mac", "all")]
    [string]$Target = "build"
)

Write-Host "🚀 Moderator App Tauri Build Script" -ForegroundColor Green
Write-Host "Target: $Target" -ForegroundColor Yellow

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Cyan

if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Host "❌ npm is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "cargo")) {
    Write-Host "❌ Rust/Cargo is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Rust from https://rustup.rs/" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Command "tauri")) {
    Write-Host "❌ Tauri CLI is not installed" -ForegroundColor Red
    Write-Host "Installing Tauri CLI..." -ForegroundColor Yellow
    npm install -g @tauri-apps/cli
}

Write-Host "✅ All prerequisites are satisfied" -ForegroundColor Green

# Function to build for specific platform
function Build-Platform {
    param([string]$Platform)
    
    Write-Host "`n🔨 Building for $Platform..." -ForegroundColor Cyan
    
    switch ($Platform) {
        "win" {
            Write-Host "Building Windows executable..." -ForegroundColor Yellow
            npm run tauri:build:win
        }
        "linux" {
            Write-Host "Building Linux AppImage..." -ForegroundColor Yellow
            npm run tauri:build:linux
        }
        "mac" {
            Write-Host "Building macOS DMG..." -ForegroundColor Yellow
            npm run tauri:build:mac
        }
    }
}

# Main build logic
switch ($Target) {
    "dev" {
        Write-Host "`n🛠️  Starting development server..." -ForegroundColor Cyan
        npm run tauri:dev
    }
    "build" {
        Write-Host "`n🔨 Building for current platform..." -ForegroundColor Cyan
        npm run tauri:build
    }
    "win" {
        Build-Platform "win"
    }
    "linux" {
        Build-Platform "linux"
    }
    "mac" {
        Build-Platform "mac"
    }
    "all" {
        Write-Host "`n🌍 Building for all platforms..." -ForegroundColor Cyan
        Write-Host "Note: Cross-platform building requires appropriate toolchains" -ForegroundColor Yellow
        
        # Add cross-platform targets if not already added
        Write-Host "Adding cross-platform targets..." -ForegroundColor Yellow
        rustup target add x86_64-pc-windows-msvc
        rustup target add x86_64-unknown-linux-gnu
        rustup target add x86_64-apple-darwin
        
        Build-Platform "win"
        Build-Platform "linux"
        Build-Platform "mac"
    }
}

Write-Host "`n✅ Build process completed!" -ForegroundColor Green

# Show output locations
if ($Target -ne "dev") {
    Write-Host "`n📁 Build outputs:" -ForegroundColor Cyan
    Write-Host "Windows: src-tauri/target/release/bundle/msi/" -ForegroundColor White
    Write-Host "Linux:   src-tauri/target/release/bundle/appimage/" -ForegroundColor White
    Write-Host "macOS:   src-tauri/target/release/bundle/dmg/" -ForegroundColor White
} 