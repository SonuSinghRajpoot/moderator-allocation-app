#!/bin/bash

# Moderator App Tauri Build Script for Linux
# This script helps build the app for different platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Default target
TARGET=${1:-"build"}

echo -e "${GREEN}🚀 Moderator App Tauri Build Script${NC}"
echo -e "${YELLOW}Target: $TARGET${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${CYAN}📋 Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed or not in PATH${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed or not in PATH${NC}"
    exit 1
fi

if ! command_exists cargo; then
    echo -e "${RED}❌ Rust/Cargo is not installed or not in PATH${NC}"
    echo -e "${YELLOW}Please install Rust from https://rustup.rs/${NC}"
    exit 1
fi

if ! command_exists tauri; then
    echo -e "${RED}❌ Tauri CLI is not installed${NC}"
    echo -e "${YELLOW}Installing Tauri CLI...${NC}"
    npm install -g @tauri-apps/cli
fi

echo -e "${GREEN}✅ All prerequisites are satisfied${NC}"

# Function to build for specific platform
build_platform() {
    local platform=$1
    
    echo -e "\n${CYAN}🔨 Building for $platform...${NC}"
    
    case $platform in
        "win")
            echo -e "${YELLOW}Building Windows executable...${NC}"
            npm run tauri:build:win
            ;;
        "linux")
            echo -e "${YELLOW}Building Linux AppImage...${NC}"
            npm run tauri:build:linux
            ;;
        "mac")
            echo -e "${YELLOW}Building macOS DMG...${NC}"
            npm run tauri:build:mac
            ;;
    esac
}

# Main build logic
case $TARGET in
    "dev")
        echo -e "\n${CYAN}🛠️  Starting development server...${NC}"
        npm run tauri:dev
        ;;
    "build")
        echo -e "\n${CYAN}🔨 Building for current platform...${NC}"
        npm run tauri:build
        ;;
    "win")
        build_platform "win"
        ;;
    "linux")
        build_platform "linux"
        ;;
    "mac")
        build_platform "mac"
        ;;
    "all")
        echo -e "\n${CYAN}🌍 Building for all platforms...${NC}"
        echo -e "${YELLOW}Note: Cross-platform building requires appropriate toolchains${NC}"
        
        # Add cross-platform targets if not already added
        echo -e "${YELLOW}Adding cross-platform targets...${NC}"
        rustup target add x86_64-pc-windows-msvc
        rustup target add x86_64-unknown-linux-gnu
        rustup target add x86_64-apple-darwin
        
        build_platform "win"
        build_platform "linux"
        build_platform "mac"
        ;;
    *)
        echo -e "${RED}❌ Invalid target: $TARGET${NC}"
        echo -e "${WHITE}Valid targets: dev, build, win, linux, mac, all${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}✅ Build process completed!${NC}"

# Show output locations
if [ "$TARGET" != "dev" ]; then
    echo -e "\n${CYAN}📁 Build outputs:${NC}"
    echo -e "${WHITE}Windows: src-tauri/target/release/bundle/msi/${NC}"
    echo -e "${WHITE}Linux:   src-tauri/target/release/bundle/appimage/${NC}"
    echo -e "${WHITE}macOS:   src-tauri/target/release/bundle/dmg/${NC}"
fi 