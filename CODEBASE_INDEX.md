# Moderator App - Codebase Index

## 📁 Project Structure

```
new-moderator-app/
├── src/
│   ├── components/           # React components
│   │   ├── Dialogs/         # Dialog components
│   │   ├── FileUpload/      # File upload component
│   │   ├── OutputConfig/    # Output configuration
│   │   ├── ProcessingConfig/ # Processing configuration
│   │   ├── ProcessingLogs/  # Processing logs display
│   │   ├── UserPreferences/ # User preferences dialog
│   │   └── index.ts         # Component exports
│   ├── constants/           # Application constants
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

## 🧩 Components

### Main Components
- **`FileUpload`** - Excel file upload with drag & drop support
- **`ProcessingConfig`** - Distribution and picking configuration
- **`OutputConfig`** - Output file type selection
- **`ProcessingLogs`** - Real-time processing logs display

### Dialog Components
- **`SingleEvaluatorDialog`** - Handles single evaluator scenarios
- **`AlternateModeratorDialog`** - Moderator assignment dialog
- **`UserPreferencesDialog`** - User settings and preferences

## 🔧 Utilities (`src/utils/`)

### File Utilities (`fileUtils.ts`)
- **`REQUIRED_COLUMNS`** - Required Excel columns for validation
- **`validateInputFile()`** - Validates Excel file structure
- **`readExcelFile()`** - Reads Excel file data
- **`saveExcelFile()`** - Saves data as Excel file
- **`formatTimestamp()`** - Formats timestamp for logs
- **`formatTimestampForFilename()`** - Formats timestamp for filenames

### Processing Utilities (`processingUtils.ts`)
- **`shuffleArray()`** - Randomly shuffles array elements
- **`filterToRequiredColumns()`** - Filters data to required columns
- **`filterPrimaryCycleRecords()`** - Filters primary cycle records
- **`groupByEvaluator()`** - Groups records by evaluator
- **`sortByTotalMarks()`** - Sorts records by total marks
- **`categorizeRecords()`** - Categorizes records into Top/Middle/Bottom
- **`selectRecordsFromCategories()`** - Selects records from categories
- **`assignModerators()`** - Assigns moderators to selected records
- **`processEvaluatorBooklets()`** - Processes evaluator booklets

### Output Utilities (`outputUtils.ts`)
- **`generateOutputFiles()`** - Generates output files
- **`generateIndividualFiles()`** - Generates individual processed files
- **`generateBulkFile()`** - Generates bulk allocation file

### Validation Utilities (`validationUtils.ts`)
- **`validateFileProcessing()`** - Validates file processing parameters
- **`validateUserPreferences()`** - Validates user preferences
- **`validateDistribution()`** - Validates category distribution
- **`validatePicking()`** - Validates picking parameters

## 🎣 Custom Hooks (`src/hooks/`)

### `useUserPreferences`
- Manages user preferences state
- Handles theme switching (light/dark/auto)
- Persists preferences to localStorage
- Provides auto-save functionality

### `useProcessingLogs`
- Manages processing logs state
- Handles log containers and summary logs
- Provides log manipulation functions
- Supports file-specific log containers

### `useSnackbar`
- Manages snackbar notifications
- Supports different severity levels (error, warning, info, success)
- Provides auto-hide functionality
- Handles HTML content in messages

## 📝 Type Definitions (`src/types/`)

### Core Interfaces
- **`UserPreferences`** - User settings and preferences
- **`SnackbarState`** - Snackbar notification state
- **`ProcessedRecord`** - Processed data record structure
- **`FileValidationResult`** - File validation result
- **`InvalidFile`** - Invalid file information

### Dialog Interfaces
- **`SingleEvaluatorDialogState`** - Single evaluator dialog state
- **`AlternateModeratorDialogState`** - Alternate moderator dialog state
- **`DialogDecision`** - Dialog decision result

## 🏗️ Constants (`src/constants/`)

### Default Values
- **`DEFAULT_USER_PREFERENCES`** - Default user preference values
- **`STORAGE_KEYS`** - LocalStorage key names
- **`FILE_PATTERNS`** - File naming patterns

### Messages
- **`VALIDATION_MESSAGES`** - Validation error messages
- **`PROCESSING_MESSAGES`** - Processing status messages
- **`UI_TEXT`** - UI text constants

## 🎨 Main Application (`App.tsx`)

### Key Features
- **Theme Management** - Light/dark theme switching
- **File Processing** - Excel file processing pipeline
- **State Management** - Centralized application state
- **Error Handling** - Comprehensive error handling
- **Responsive Design** - Mobile-friendly layout

### Processing Pipeline
1. **File Validation** - Validates Excel file structure
2. **Data Loading** - Reads and processes Excel data
3. **Categorization** - Categorizes records by performance
4. **Selection** - Randomly selects records from categories
5. **Moderator Assignment** - Assigns moderators to selected records
6. **Output Generation** - Generates processed files

## 🔄 Data Flow

```
File Upload → Validation → Processing → Categorization → Selection → Moderator Assignment → Output Generation
```

## 🎯 Key Features

### File Processing
- Excel file validation with required columns
- Support for multiple file uploads
- Primary cycle record filtering
- Evaluator-based grouping

### Data Processing
- Performance-based categorization (Top/Middle/Bottom)
- Random selection from categories
- Moderator assignment logic
- Single evaluator handling

### User Interface
- Responsive Material-UI design
- Dark/light theme support
- Real-time processing logs
- Interactive dialogs for user decisions

### Output Generation
- Individual processed files
- Bulk allocation file
- Excel format output
- Automatic file naming

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material-UI (MUI)
- **Build Tool**: Vite
- **Excel Processing**: SheetJS (XLSX)
- **State Management**: React Hooks
- **Styling**: CSS-in-JS (MUI sx prop)

## 📋 Development Guidelines

### Code Organization
- Modular component structure
- Separation of concerns
- TypeScript for type safety
- Consistent naming conventions

### State Management
- Custom hooks for complex state
- Local state for component-specific data
- Props for component communication
- Context for global state (if needed)

### Error Handling
- Comprehensive validation
- User-friendly error messages
- Graceful degradation
- Logging for debugging

### Performance
- Efficient data processing
- Optimized re-renders
- Lazy loading where appropriate
- Memory management for large files 