

// Shuffle array function for random selection
export const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
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

// Assign moderators to selected records
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
    
    const evaluatorBooklets = new Map<string, any[]>()
    
    // Group selected booklets by original evaluator
    selectedRecords.forEach(record => {
        const evaluator = record['Evaluated By'] || 'Unknown'
        if (!evaluatorBooklets.has(evaluator)) {
            evaluatorBooklets.set(evaluator, [])
        }
        evaluatorBooklets.get(evaluator)!.push(record)
    })
    
    const assignedBooklets: any[] = []
    const usedModerators = new Set<string>()
    
    // Process each evaluator's selected booklets
    evaluatorBooklets.forEach((booklets, originalEvaluator) => {
        // Create pool excluding the original evaluator and already used moderators
        const availableModerators = evaluatorList.filter(e => 
            e !== originalEvaluator && !usedModerators.has(e)
        )
        
        if (availableModerators.length === 0) {
            // If no available moderators, skip assignment
            console.warn(`No available moderators for evaluator: ${originalEvaluator}`)
            return
        }
        
        // Select ONE moderator for ALL booklets of this evaluator
        const randomIndex = Math.floor(Math.random() * availableModerators.length)
        const assignedModerator = availableModerators[randomIndex]
        
        // Mark this moderator as used
        usedModerators.add(assignedModerator)
        
        // Assign the same moderator to all booklets of this evaluator
        booklets.forEach(booklet => {
            const assignedBooklet = {
                ...booklet,
                'Moderated By': assignedModerator
            }
            assignedBooklets.push(assignedBooklet)
        })
    })
    
    return assignedBooklets
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