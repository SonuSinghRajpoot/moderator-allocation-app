# Moderator Allocation App

A desktop application built with React, TypeScript, and Tauri for processing evaluation data and allocating moderators.

## Features

- Process Excel files with evaluation data
- Configure distribution and picking parameters
- Generate individual processed files and bulk allocation files
- Modern UI with Material-UI components
- Cross-platform support (Windows, Linux, macOS)

## Output format & naming

- File naming patterns
  - Individual files: `Processed_<OriginalFileName>.xlsx`
  - Bulk file: `Bulk_Allocation_<DD-MM-YYYY_HH-MM-SS>.xlsx`
  - When "Save output files in same location as input files" is enabled (recommended), files are saved next to the input; otherwise, a browser download is triggered.

- Sheets and contents
  - Sheet 1: `Allocation Data`
    - Includes only rows where `Selected for Moderation = 'Selected'`
    - Columns are renamed and ordered as:
      - `Test Id` (from `Schedule Id`)
      - `User Id` (from `Email of the student`)
      - `Evaluator Ids` (from `Moderated By`)
      - `Category`
      - `Selected for Moderation`
  - Sheet 2: `Master Data`
    - Full processed dataset (imported columns only), plus processing columns:
      - `Category`
      - `Selected for Moderation`
      - `Moderated By`

- Imported columns (strict)
  - Only the following 11 columns are imported from input files and used throughout processing and outputs:
    1. Register Number
    2. Name of the student
    3. Schedule Id
    4. Schedule Name
    5. Email of the student
    6. Total Marks
    7. Exam Appearance Status
    8. Evaluated By
    9. Evaluator Id
    10. Script Id
    11. Cycle

Notes
- The primary cycle used for processing is configurable in User Preferences (default: `primary`).
- Percentage-based categorization and selection are rounded up using `Math.ceil()`.

## Prerequisites

### For Development
- Node.js (v18 or higher)
- npm or yarn
- Rust (latest stable version)
- Platform-specific build tools:
  - **Windows**: Microsoft Visual Studio C++ Build Tools
  - **Linux**: `build-essential`, `libwebkit2gtk-4.0-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`
  - **macOS**: Xcode Command Line Tools

### For Building
- All development prerequisites
- Platform-specific requirements for target platforms

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd new-moderator-app
```

2. Install dependencies:
```bash
npm install
```

3. Install Tauri CLI globally (if not already installed):
```bash
npm install -g @tauri-apps/cli
```

## Development

### Start Development Server
```bash
npm run tauri:dev
```

This will start both the Vite development server and the Tauri application in development mode.

### Build for Production

#### Build for Current Platform
```bash
npm run tauri:build
```

#### Build for Specific Platforms

**Windows:**
```bash
npm run tauri:build:win
```

**Linux:**
```bash
npm run tauri:build:linux
```

**macOS:**
```bash
npm run tauri:build:mac
```

### Cross-Platform Building

To build for multiple platforms, you'll need to set up the appropriate toolchains:

#### Building Windows App on Linux/macOS
```bash
rustup target add x86_64-pc-windows-msvc
npm run tauri:build:win
```

#### Building Linux App on Windows/macOS
```bash
rustup target add x86_64-unknown-linux-gnu
npm run tauri:build:linux
```

## Project Structure

```
new-moderator-app/
├── src/                    # React frontend source code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   └── constants/         # Application constants
├── src-tauri/             # Tauri backend (Rust)
│   ├── src/               # Rust source code
│   ├── capabilities/      # Tauri permissions and capabilities
│   ├── icons/             # Application icons
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── dist/                  # Built frontend assets
├── package.json           # Node.js dependencies and scripts
└── vite.config.ts         # Vite configuration
```

## Configuration

### Tauri Configuration
The main Tauri configuration is in `src-tauri/tauri.conf.json`. Key settings include:
- Window size and properties
- App metadata
- Build settings
- Security permissions

### Frontend Configuration
- Vite configuration: `vite.config.ts`
- TypeScript configuration: `tsconfig.json`
- ESLint configuration: `.eslintrc.cjs`

## Building for Distribution

### Windows
The app builds to an MSI installer by default. The output will be in `src-tauri/target/release/bundle/msi/`.

### Linux
The app builds to an AppImage by default. The output will be in `src-tauri/target/release/bundle/appimage/`.

### macOS
The app builds to a DMG installer by default. The output will be in `src-tauri/target/release/bundle/dmg/`.

## Troubleshooting

### Common Issues

1. **Rust toolchain not found**: Run `rustup update` to ensure you have the latest Rust toolchain.

2. **Build tools missing**: Install the appropriate build tools for your target platform.

3. **Permission denied errors**: Ensure the capabilities in `src-tauri/capabilities/default.json` include the necessary permissions.

4. **Port already in use**: Change the port in `vite.config.ts` if port 3000 is already in use.

### Platform-Specific Issues

#### Windows
- Ensure Microsoft Visual Studio C++ Build Tools are installed
- Run as Administrator if you encounter permission issues

#### Linux
- Install required system dependencies:
  ```bash
  sudo apt update
  sudo apt install build-essential libwebkit2gtk-4.0-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
  ```

#### macOS
- Install Xcode Command Line Tools: `xcode-select --install`
- Ensure you have the latest macOS SDK

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 