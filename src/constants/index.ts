// Default user preferences
export const DEFAULT_USER_PREFERENCES = {
    theme: 'dark' as const,
    autoSave: true,
    saveToSameLocation: true,
    firstCycleName: 'primary',
    topCategory: 20,
    middleCategory: 40,
    bottomCategory: 40,
    pickTop: 5,
    pickMiddle: 10,
    pickBottom: 5,
    maxBookletsPerEvaluator: 20,
    generateSchedule: true,
    generateBulk: true,
}

// Local storage keys
export const STORAGE_KEYS = {
    USER_PREFERENCES: 'userPreferences',
} as const

// Validation messages
export const VALIDATION_MESSAGES = {
    NO_FILES_SELECTED: 'Please select at least one Excel file to process.',
    NO_VALID_FILES: 'No valid files to process. Please check your file format.',
    CATEGORY_SUM_EXCEEDS: 'Category sum exceeds 100%. Please adjust the values.',
    ALL_CATEGORIES_REQUIRED: 'All category percentages must be greater than 0.',
    PICKING_SUM_MISMATCH: 'Picking sum must equal maximum booklets per evaluator.',
    NO_OUTPUT_SELECTED: 'Please select at least one output file type.',
} as const

// Processing messages
export const PROCESSING_MESSAGES = {
    PROCESSING_STARTED: 'Processing started',
    ALL_FILES_PROCESSED: 'All files processed',
    PROCESSING_COMPLETED: 'Processing completed successfully!',
    GENERATING_INDIVIDUAL: 'Generating individual processed files...',
    GENERATING_BULK: 'Generating bulk allocation file...',
    GENERATED_FILES: 'Generated individual processed files',
} as const

// File naming patterns
export const FILE_PATTERNS = {
    PROCESSED_PREFIX: 'Processed_',
    BULK_PREFIX: 'Bulk_Allocation_',
    FILE_EXTENSION: '.xlsx',
} as const

// UI text constants
export const UI_TEXT = {
    APP_TITLE: 'Moderator Allocation App',
    CONFIGURE_DISTRIBUTION: 'Configure Distribution and Picking',
    OUTPUT_FILE: 'Output File',
    INDIVIDUAL_FILES: 'Individual file(s)',
    BULK_FILE: 'Bulk file',
    PROCESS_FILES: 'Process Files',
    RESET: 'Reset',
    PROCESSING_LOGS: 'Processing Logs',
    NO_LOGS: 'No logs yet. Processing output will appear here.',
    USER_PREFERENCES: 'User Preferences',
    CLOSE: 'Close',
    AUTO_SAVE: 'Auto Save',
    SAVE_TO_SAME_LOCATION: 'Save to Same Location',
} as const 