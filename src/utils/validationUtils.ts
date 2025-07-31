import { VALIDATION_MESSAGES } from '../constants'

// Validation function for distribution percentages
export const validateDistribution = (
    topCategory: number,
    middleCategory: number,
    bottomCategory: number
): string | null => {
    if (topCategory === 0 || middleCategory === 0 || bottomCategory === 0) {
        return 'None of the fields can be zero.'
    }
    
    if (topCategory + middleCategory + bottomCategory > 100) {
        return VALIDATION_MESSAGES.CATEGORY_SUM_EXCEEDS
    }
    
    return null
}

// Validation function for picking percentages
export const validatePicking = (
    pickTop: number,
    pickMiddle: number,
    pickBottom: number,
    maxBookletsPerEvaluator: number
): string | null => {
    const pickSum = pickTop + pickMiddle + pickBottom
    
    if (pickSum !== maxBookletsPerEvaluator) {
        return `Sum of top pick, middle pick, and bottom pick must be exactly equal to ${maxBookletsPerEvaluator}%.`
    }
    
    return null
}

// Validation function for file processing
export const validateFileProcessing = (
    selectedFiles: string[],
    validFiles: string[],
    topCategory: number,
    middleCategory: number,
    bottomCategory: number,
    pickTop: number,
    pickMiddle: number,
    pickBottom: number,
    maxBookletsPerEvaluator: number,
    generateSchedule: boolean,
    generateBulk: boolean
): string | null => {
    // Check if files are selected
    if (selectedFiles.length === 0) {
        return VALIDATION_MESSAGES.NO_FILES_SELECTED
    }

    // Check if valid files exist
    if (validFiles.length === 0) {
        return VALIDATION_MESSAGES.NO_VALID_FILES
    }

    // Check category sum validation
    const categorySum = topCategory + middleCategory + bottomCategory
    if (categorySum > 100) {
        return VALIDATION_MESSAGES.CATEGORY_SUM_EXCEEDS
    }

    if (topCategory === 0 || middleCategory === 0 || bottomCategory === 0) {
        return VALIDATION_MESSAGES.ALL_CATEGORIES_REQUIRED
    }

    // Check picking sum validation
    const pickingSum = pickTop + pickMiddle + pickBottom
    if (pickingSum !== maxBookletsPerEvaluator) {
        return VALIDATION_MESSAGES.PICKING_SUM_MISMATCH
    }

    // Check output file selection
    if (!generateSchedule && !generateBulk) {
        return VALIDATION_MESSAGES.NO_OUTPUT_SELECTED
    }

    return null
}

// Validation function for cycle values
export const validateCycleValues = (cycleValues: string[]): string[] => {
    return cycleValues.filter(cycle => cycle !== 'primary' && cycle !== '-')
}

// Validation function for user preferences
export const validateUserPreferences = (
    preferences: {
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
): { distributionError: string | null; pickingError: string | null } => {
    const distributionError = validateDistribution(
        preferences.topCategory,
        preferences.middleCategory,
        preferences.bottomCategory
    )
    
    const pickingError = validatePicking(
        preferences.pickTop,
        preferences.pickMiddle,
        preferences.pickBottom,
        preferences.maxBookletsPerEvaluator
    )
    
    return { distributionError, pickingError }
} 