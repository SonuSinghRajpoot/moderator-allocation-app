import { 
    saveExcelFileWithSheets, 
    saveExcelFileWithSheetsToSameLocation, 
    formatTimestampForFilename 
} from './fileUtils'
import { createRecordKey } from './processingUtils'
import { FILE_PATTERNS } from '../constants'

// File patterns centralized in constants

// Create first sheet data from raw data
const createFirstSheetData = (rawData: any[]): any[] => {
    return rawData
        .filter(record => record['Selected for Moderation'] === 'Selected')
        .map(record => ({
            'Test Id': record['Schedule Id'],
            'User Id': record['Email of the student'],
            'Evaluator Ids': record['Moderated By'],
            'Category': record['Category'],
            'Selected for Moderation': record['Selected for Moderation']
        }))
}

// Generate individual processed files
export const generateIndividualFiles = async (
    processedDataByFileMap: Map<string, any[]>,
    rawDataByFileMap: Map<string, any[]>,
    filePathsMap: Map<string, string>,
    saveToSameLocation: boolean = true
): Promise<{ count: number; files: string[] }> => {
    const savePromises: Array<Promise<string>> = []

    processedDataByFileMap.forEach((processedData, fileName) => {
        if (processedData.length > 0) {
            // Get raw data for this file
            const rawData = rawDataByFileMap.get(fileName) || []

            // Create first sheet data (filtered and renamed)
            const firstSheetData = createFirstSheetData(rawData)

            const baseName = fileName.replace(/\.xlsx$/i, '')
            const processedFileName = `${FILE_PATTERNS.PROCESSED_PREFIX}${baseName}${FILE_PATTERNS.FILE_EXTENSION}`

            // Save file to same location if requested and path is available
            if (saveToSameLocation && filePathsMap.has(fileName)) {
                const inputFilePath = filePathsMap.get(fileName)!
                const p = saveExcelFileWithSheetsToSameLocation(firstSheetData, rawData, processedFileName, inputFilePath)
                    .catch(error => {
                        console.error('Error saving file to same location:', error)
                        // Fallback to regular save
                        return saveExcelFileWithSheets(firstSheetData, rawData, processedFileName)
                    })
                savePromises.push(p)
            } else {
                // Regular save
                savePromises.push(
                    saveExcelFileWithSheets(firstSheetData, rawData, processedFileName)
                )
            }
        }
    })

    const savedPaths = await Promise.all(savePromises)
    return { count: savedPaths.length, files: savedPaths }
}

// Generate bulk allocation file
export const generateBulkFile = async (
    allSelectedForModeration: any[],
    rawDataByFileMap: Map<string, any[]>,
    filePathsMap: Map<string, string>,
    saveToSameLocation: boolean = true
): Promise<string> => {
    const timestamp = formatTimestampForFilename()
    const bulkFileName = `${FILE_PATTERNS.BULK_PREFIX}${timestamp}${FILE_PATTERNS.FILE_EXTENSION}`
    
    // For bulk file, combine all raw data from all files (which already contains filtered columns)
    const allRawData: any[] = []
    
    // Create a map of all selected records with their moderator assignments
    const bulkSelectedRecordsMap = new Map()
    allSelectedForModeration.forEach(record => {
        const recordKey = createRecordKey(record)
        bulkSelectedRecordsMap.set(recordKey, record['Moderated By'] || '')
    })
    
    // Combine all raw data from all files (this already contains the filtered columns)
    rawDataByFileMap.forEach((fileData) => {
        allRawData.push(...fileData)
    })
    
    // Create first sheet data (filtered and renamed)
    const firstSheetData = createFirstSheetData(allRawData)
    
    // For bulk file, try to save to the location of the first input file
    if (saveToSameLocation && filePathsMap.size > 0) {
        const firstInputFilePath = Array.from(filePathsMap.values())[0]
        try {
            await saveExcelFileWithSheetsToSameLocation(firstSheetData, allRawData, bulkFileName, firstInputFilePath)
        } catch (error) {
            console.error('Error saving bulk file to same location:', error)
            // Fallback to regular save
            await saveExcelFileWithSheets(firstSheetData, allRawData, bulkFileName)
        }
    } else {
        // Regular save
        await saveExcelFileWithSheets(firstSheetData, allRawData, bulkFileName)
    }
    
    return bulkFileName
}

// Generate output files based on user preferences
export const generateOutputFiles = async (
    generateSchedule: boolean,
    generateBulk: boolean,
    processedDataByFileMap: Map<string, any[]>,
    rawDataByFileMap: Map<string, any[]>,
    allSelectedForModeration: any[],
    _fileObjectsMap: Map<string, File>,
    filePathsMap: Map<string, string>,
    saveToSameLocation: boolean = true
): Promise<{
    individualFiles: { count: number; files: string[] }
    bulkFile?: string
    totalFiles: number
}> => {
    let individualFiles: { count: number; files: string[] } = { count: 0, files: [] }
    let bulkFile: string | undefined
    
    if (generateSchedule) {
        individualFiles = await generateIndividualFiles(processedDataByFileMap, rawDataByFileMap, filePathsMap, saveToSameLocation)
    }
    
    if (generateBulk) {
        bulkFile = await generateBulkFile(allSelectedForModeration, rawDataByFileMap, filePathsMap, saveToSameLocation)
    }
    
    const totalFiles = individualFiles.count + (bulkFile ? 1 : 0)
    
    return {
        individualFiles,
        bulkFile,
        totalFiles
    }
} 