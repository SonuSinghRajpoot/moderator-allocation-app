

// Shuffle array function for random selection
export const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Sattolo's algorithm - produces a random derangement (single cycle, no fixed points)
export const randomDerangement = <T>(arr: T[]): T[] => {
    const result = [...arr]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i) // 0 to i-1, NOT i
        ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

// Pre-compute evaluator -> moderator mapping. Returns null if n < 2 (no valid alternate).
export const computeEvaluatorModeratorMapping = (
    evaluatorIds: string[]
): Map<string, string> | null => {
    if (evaluatorIds.length < 2) return null
    const derangement = randomDerangement([...evaluatorIds])
    const mapping = new Map<string, string>()
    evaluatorIds.forEach((e, i) => mapping.set(e, derangement[i]))
    return mapping
}

// Filter data to only include required columns
export const filterToRequiredColumns = (data: any[], requiredColumns: string[]): any[] => {
    return data.map(record => {
        const filteredRecord: any = {}
        requiredColumns.forEach(column => {
            filteredRecord[column] = record[column] || ''
        })
        return filteredRecord
    })
}

// Filter data to only include primary cycle records
export const filterPrimaryCycleRecords = (data: any[], cycleName: string = 'primary'): any[] => {
    return data.filter(record => record['Cycle'] === cycleName)
}

// Group records by evaluator
export const groupByEvaluator = (records: any[]): Map<string, any[]> => {
    const evaluatorGroups = new Map<string, any[]>()
    records.forEach(record => {
        const evaluator = record['Evaluated By'] || 'Unknown'
        if (!evaluatorGroups.has(evaluator)) {
            evaluatorGroups.set(evaluator, [])
        }
        evaluatorGroups.get(evaluator)!.push(record)
    })
    return evaluatorGroups
}

// Sort records by total marks (descending)
export const sortByTotalMarks = (records: any[]): any[] => {
    return records.sort((a, b) => {
        const marksA = parseFloat(a['Total Marks']) || 0
        const marksB = parseFloat(b['Total Marks']) || 0
        return marksB - marksA
    })
}

// Categorize records into Top, Middle, Bottom
export const categorizeRecords = (
    records: any[],
    topCategory: number,
    middleCategory: number
): any[] => {
    const totalBooklets = records.length
    const topCount = Math.ceil((topCategory / 100) * totalBooklets)
    const middleCount = Math.ceil((middleCategory / 100) * totalBooklets)
    
    return records.map((record, index) => {
        let category = ''
        if (index < topCount) {
            category = 'Top'
        } else if (index < topCount + middleCount) {
            category = 'Middle'
        } else {
            category = 'Bottom'
        }
        return { ...record, Category: category }
    })
}

// Select records from each category
export const selectRecordsFromCategories = (
    categorizedRecords: any[],
    pickTop: number,
    pickMiddle: number,
    pickBottom: number,
    totalBooklets: number
): any[] => {
    const pickTopCount = Math.ceil((pickTop / 100) * totalBooklets)
    const pickMiddleCount = Math.ceil((pickMiddle / 100) * totalBooklets)
    const pickBottomCount = Math.ceil((pickBottom / 100) * totalBooklets)
    
    const topCategoryRecords = categorizedRecords.filter(r => r.Category === 'Top')
    const middleCategoryRecords = categorizedRecords.filter(r => r.Category === 'Middle')
    const bottomCategoryRecords = categorizedRecords.filter(r => r.Category === 'Bottom')
    
    const selectedTop = shuffleArray(topCategoryRecords).slice(0, pickTopCount)
    const selectedMiddle = shuffleArray(middleCategoryRecords).slice(0, pickMiddleCount)
    const selectedBottom = shuffleArray(bottomCategoryRecords).slice(0, pickBottomCount)
    
    return [...selectedTop, ...selectedMiddle, ...selectedBottom]
}

// Assign moderators to selected records using pre-computed derangement mapping
export const assignModerators = (
    selectedRecords: any[],
    evaluatorList: string[]
): any[] => {
    // Validate that we have enough moderators
    const uniqueEvaluators = new Set(selectedRecords.map(record => record['Evaluated By'] || 'Unknown'))
    const evaluatorCount = uniqueEvaluators.size

    if (evaluatorCount > evaluatorList.length) {
        console.error(`Not enough moderators: ${evaluatorCount} evaluators need moderation but only ${evaluatorList.length} moderators available`)
        return selectedRecords.map(record => ({
            ...record,
            'Moderated By': 'INSUFFICIENT_MODERATORS'
        }))
    }

    // Pre-compute mapping: guarantees valid assignment for n >= 2 (derangement)
    const mapping = computeEvaluatorModeratorMapping(evaluatorList)
    if (!mapping) {
        console.error('Cannot compute moderator mapping: need at least 2 evaluators')
        return selectedRecords.map(record => ({
            ...record,
            'Moderated By': 'INSUFFICIENT_MODERATORS'
        }))
    }

    // Apply mapping to each record
    return selectedRecords.map(record => {
        const evaluator = record['Evaluated By'] || 'Unknown'
        const moderator = mapping.get(evaluator) ?? 'Unknown'
        return {
            ...record,
            'Moderated By': moderator
        }
    })
}

// Create unique record key for identification
export const createRecordKey = (record: any): string => {
    return `${record['Evaluated By']}_${record['Script Id']}_${record['Evaluator Id']}`
}

// Process evaluator's booklets (categorization and selection)
export const processEvaluatorBooklets = (
    evaluatorBooklets: any[],
    topCategory: number,
    middleCategory: number,
    pickTop: number,
    pickMiddle: number,
    pickBottom: number
): { categorized: any[], selected: any[] } => {
    const totalBooklets = evaluatorBooklets.length
    const sortedBooklets = sortByTotalMarks(evaluatorBooklets)
    const categorizedBooklets = categorizeRecords(sortedBooklets, topCategory, middleCategory)
    const selectedBooklets = selectRecordsFromCategories(
        categorizedBooklets,
        pickTop,
        pickMiddle,
        pickBottom,
        totalBooklets
    )
    
    return {
        categorized: categorizedBooklets,
        selected: selectedBooklets
    }
} 