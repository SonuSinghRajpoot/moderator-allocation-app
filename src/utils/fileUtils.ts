import * as XLSX from 'xlsx'

// Tauri APIs - only available in Tauri context
let tauriApis: any = null

// Initialize Tauri APIs if available
const initTauriApis = async () => {
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        try {
            // Use dynamic import with a function to avoid static analysis
            const importModule = (path: string) => import(path)
            const fs = await importModule('@tauri-apps/api/fs').catch(() => null)
            const dialog = await importModule('@tauri-apps/api/dialog').catch(() => null)
            const path = await importModule('@tauri-apps/api/path').catch(() => null)
            
            if (fs && dialog && path) {
                tauriApis = { fs, dialog, path }
            }
        } catch (error) {
            console.warn('Tauri APIs not available:', error)
        }
    }
}

// Required columns for validation
export const REQUIRED_COLUMNS = [
    "Evaluated By",
    "Evaluator Id", 
    "Script Id",
    "Cycle"
]

// Columns to be imported from each file
export const IMPORT_COLUMNS = [
    "Register Number",
    "Name of the student", 
    "Schedule Id",
    "Schedule Name",
    "Email of the student",
    "Total Marks",
    "Exam Appearance Status",
    "Evaluated By",
    "Evaluator Id",
    "Script Id",
    "Cycle"
]

// Global function to format timestamp
export const formatTimestamp = (): string => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const seconds = now.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
}

// Function to format timestamp for filename (without spaces and colons)
export const formatTimestampForFilename = (): string => {
    const now = new Date()
    const day = now.getDate().toString().padStart(2, '0')
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const year = now.getFullYear()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const seconds = now.getSeconds().toString().padStart(2, '0')
    return `${day}-${month}-${year}_${hours}-${minutes}-${seconds}`
}

// File validation function
export const validateInputFile = async (file: File): Promise<{ valid: boolean; missingColumns: string[] }> => {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const readerTarget = e.target as FileReader | null
                const result = readerTarget && readerTarget.result ? readerTarget.result : null
                if (!result) throw new Error('No file data')
                const data = new Uint8Array(result as ArrayBuffer)
                const workbook = XLSX.read(data, { type: 'array' })
                const firstSheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[firstSheetName]
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
                const headerRow = json[0] as string[]
                const missingColumns = REQUIRED_COLUMNS.filter(col => !headerRow.includes(col))
                resolve({
                    valid: missingColumns.length === 0,
                    missingColumns
                })
            } catch (err) {
                resolve({ valid: false, missingColumns: REQUIRED_COLUMNS })
            }
        }
        reader.readAsArrayBuffer(file)
    })
}

// Function to save Excel file with multiple sheets
export const saveExcelFileWithSheets = async (
    processedData: any[], 
    rawData: any[], 
    filename: string
): Promise<string> => {
    const workbook = XLSX.utils.book_new()
    
    // Add filtered and renamed data as Sheet 1
    const processedWorksheet = XLSX.utils.json_to_sheet(processedData)
    XLSX.utils.book_append_sheet(workbook, processedWorksheet, 'Allocation Data')
    
    // Add raw data as Sheet 2 (all processing up to Phase 4)
    const rawWorksheet = XLSX.utils.json_to_sheet(rawData)
    XLSX.utils.book_append_sheet(workbook, rawWorksheet, 'Master Data')
    
    // Generate Excel file as buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    
    // Create download link
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    return filename
}

// Function to save Excel file (single sheet - for backward compatibility)
export const saveExcelFile = async (data: any[], filename: string): Promise<string> => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    
    // Generate Excel file as buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    
    // Create download link
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    return filename
}

// Function to save Excel file with multiple sheets using Tauri native APIs
export const saveExcelFileWithSheetsNative = async (
    processedData: any[], 
    rawData: any[], 
    filename: string, 
    outputPath?: string
): Promise<string> => {
    const workbook = XLSX.utils.book_new()
    
    // Add filtered and renamed data as Sheet 1
    const processedWorksheet = XLSX.utils.json_to_sheet(processedData)
    XLSX.utils.book_append_sheet(workbook, processedWorksheet, 'Allocation Data')
    
    // Add raw data as Sheet 2 (all processing up to Phase 4)
    const rawWorksheet = XLSX.utils.json_to_sheet(rawData)
    XLSX.utils.book_append_sheet(workbook, rawWorksheet, 'Master Data')
    
    // Generate Excel file as buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    
    try {
        // Initialize Tauri APIs if not already done
        if (!tauriApis) {
            await initTauriApis()
        }
        
        if (tauriApis && outputPath) {
            // Save to specific path using Tauri
            await tauriApis.fs.writeBinaryFile(outputPath, excelBuffer)
            return outputPath
        } else if (tauriApis) {
            // Use save dialog
            const filePath = await tauriApis.dialog.save({
                title: 'Save Excel File',
                filters: [{
                    name: 'Excel Files',
                    extensions: ['xlsx']
                }],
                defaultPath: filename
            })
            
            if (filePath) {
                await tauriApis.fs.writeBinaryFile(filePath, excelBuffer)
                return filePath
            } else {
                throw new Error('No file path selected')
            }
        } else {
            // Fallback to browser download
            return await saveExcelFileWithSheets(processedData, rawData, filename)
        }
    } catch (error) {
        console.error('Error saving file with Tauri:', error)
        // Fallback to browser download
        return await saveExcelFileWithSheets(processedData, rawData, filename)
    }
}

// Function to save Excel file using Tauri native APIs (single sheet - for backward compatibility)
export const saveExcelFileNative = async (data: any[], filename: string, outputPath?: string): Promise<string> => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    
    // Generate Excel file as buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    
    try {
        // Initialize Tauri APIs if not already done
        if (!tauriApis) {
            await initTauriApis()
        }
        
        if (tauriApis && outputPath) {
            // Save to specific path using Tauri
            await tauriApis.fs.writeBinaryFile(outputPath, excelBuffer)
            return outputPath
        } else if (tauriApis) {
            // Use save dialog
            const filePath = await tauriApis.dialog.save({
                title: 'Save Excel File',
                filters: [{
                    name: 'Excel Files',
                    extensions: ['xlsx']
                }],
                defaultPath: filename
            })
            
            if (filePath) {
                await tauriApis.fs.writeBinaryFile(filePath, excelBuffer)
                return filePath
            } else {
                throw new Error('No file path selected')
            }
        } else {
            // Fallback to browser download
            return await saveExcelFile(data, filename)
        }
    } catch (error) {
        console.error('Error saving file with Tauri:', error)
        // Fallback to browser download
        return await saveExcelFile(data, filename)
    }
}

// Function to save Excel file with multiple sheets to the same directory as input file
export const saveExcelFileWithSheetsToSameLocation = async (
    processedData: any[], 
    rawData: any[], 
    filename: string, 
    inputFilePath: string
): Promise<string> => {
    try {
        // Initialize Tauri APIs if not already done
        if (!tauriApis) {
            await initTauriApis()
        }
        
        if (tauriApis) {
            // Get the directory of the input file
            const inputDir = await tauriApis.path.dirname(inputFilePath)
            // Create the full output path
            const outputPath = await tauriApis.path.join(inputDir, filename)
            
            // Save using native Tauri API with multiple sheets
            return await saveExcelFileWithSheetsNative(processedData, rawData, filename, outputPath)
        } else {
            // Fallback to regular save
            return await saveExcelFileWithSheets(processedData, rawData, filename)
        }
    } catch (error) {
        console.error('Error saving to same location:', error)
        // Fallback to regular save
        return await saveExcelFileWithSheets(processedData, rawData, filename)
    }
}

// Function to save Excel file to the same directory as input file (single sheet - for backward compatibility)
export const saveExcelFileToSameLocation = async (data: any[], filename: string, inputFilePath: string): Promise<string> => {
    try {
        // Initialize Tauri APIs if not already done
        if (!tauriApis) {
            await initTauriApis()
        }
        
        if (tauriApis) {
            // Get the directory of the input file
            const inputDir = await tauriApis.path.dirname(inputFilePath)
            // Create the full output path
            const outputPath = await tauriApis.path.join(inputDir, filename)
            
            // Save using native Tauri API
            return await saveExcelFileNative(data, filename, outputPath)
        } else {
            // Fallback to regular save
            return await saveExcelFile(data, filename)
        }
    } catch (error) {
        console.error('Error saving to same location:', error)
        // Fallback to regular save
        return await saveExcelFile(data, filename)
    }
}

// Function to read Excel file data
export const readExcelFile = async (file: File, filePath?: string): Promise<any[]> => {
    try {
        let data: Uint8Array
        
        if (filePath) {
            // Initialize Tauri APIs if not already done
            if (!tauriApis) {
                await initTauriApis()
            }
            
            if (tauriApis) {
                // Use Tauri's native file reading
                data = await tauriApis.fs.readBinaryFile(filePath)
            } else {
                // Fallback to browser FileReader
                data = await new Promise<Uint8Array>((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        try {
                            const result = e.target?.result
                            if (result instanceof ArrayBuffer) {
                                resolve(new Uint8Array(result))
                            } else {
                                reject(new Error('Failed to read file'))
                            }
                        } catch (error) {
                            reject(error)
                        }
                    }
                    reader.onerror = () => reject(new Error('File read error'))
                    reader.readAsArrayBuffer(file)
                })
            }
        } else {
            // Fallback to browser FileReader
            data = await new Promise<Uint8Array>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = (e) => {
                    try {
                        const result = e.target?.result
                        if (result instanceof ArrayBuffer) {
                            resolve(new Uint8Array(result))
                        } else {
                            reject(new Error('Failed to read file'))
                        }
                    } catch (error) {
                        reject(error)
                    }
                }
                reader.onerror = () => reject(new Error('File read error'))
                reader.readAsArrayBuffer(file)
            })
        }
        
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]
        return jsonData
    } catch (error) {
        console.error('Error reading Excel file:', error)
        throw error
    }
} 