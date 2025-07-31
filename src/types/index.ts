// User preferences interface
export interface UserPreferences {
    theme: 'light' | 'dark' | 'auto'
    autoSave: boolean
    saveToSameLocation: boolean
    firstCycleName: string
    topCategory: number
    middleCategory: number
    bottomCategory: number
    pickTop: number
    pickMiddle: number
    pickBottom: number
    maxBookletsPerEvaluator: number
    generateSchedule: boolean
    generateBulk: boolean
}

// Snackbar state interface
export interface SnackbarState {
    open: boolean
    message: string
    severity: 'error' | 'warning' | 'info' | 'success'
}

// Single evaluator dialog state interface
export interface SingleEvaluatorDialogState {
    open: boolean
    evaluator: string
    booklets: any[]
    onResolve: (action: 'same' | 'different' | 'cancel' | 'different_cancelled', alternateModerator?: string) => void
}

// Alternate moderator dialog state interface
export interface AlternateModeratorDialogState {
    open: boolean
    onResolve: (moderatorId: string) => void
}

// File validation result interface
export interface FileValidationResult {
    valid: boolean
    missingColumns: string[]
}

// Invalid file interface
export interface InvalidFile {
    name: string
    missingColumns: string[]
}

// Record interface for processed data
export interface ProcessedRecord {
    'Register Number': string
    'Name of the student': string
    'Schedule Id': string
    'Schedule Name': string
    'Email of the student': string
    'Total Marks': string | number
    'Exam Appearance Status': string
    'Evaluated By': string
    'Evaluator Id': string
    'Script Id': string
    'Cycle': string
    Category?: string
    'Selected for Moderation'?: string
    'Moderated By'?: string
    [key: string]: any // Allow additional properties
}

// Dialog decision interface
export interface DialogDecision {
    action: 'same' | 'different' | 'cancel' | 'different_cancelled'
    alternateModerator?: string
} 