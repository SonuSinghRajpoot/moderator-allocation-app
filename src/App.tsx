import React, { useState, useEffect } from 'react'
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    IconButton,
    AppBar,
    Toolbar,
    Snackbar,
    Slide,
} from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { 
    DarkMode, 
    LightMode, 
    Settings,
    ErrorOutline,
    CheckCircleOutline,
    WarningAmber,
    Info,
} from '@mui/icons-material'
import { CssBaseline } from '@mui/material'

// Brand logo paths
const brandLogoPath = '/brandLogo.png'
const brandLogoWhitePath = '/brandLogoWhite.png'

// Import components
import {
    ProcessingLogs,
    OutputConfig,
    ProcessingConfig,
    FileUpload,
    SingleEvaluatorDialog,
    AlternateModeratorDialog,
    UserPreferencesDialog,
} from './components'

// Import hooks
import {
    useUserPreferences,
    useProcessingLogs,
    useSnackbar,
} from './hooks'

// Import utilities
import {
    validateInputFile,
    validateFileProcessing,
    validateUserPreferences,
    filterToRequiredColumns,
    filterPrimaryCycleRecords,
    groupByEvaluator,
    processEvaluatorBooklets,
    assignModerators,
    generateOutputFiles,
    formatTimestamp,
    readExcelFile,
    IMPORT_COLUMNS,
} from './utils'

import {
    sortByTotalMarks,
    createRecordKey,
} from './utils/processingUtils'

// Import types and constants
import { DialogDecision } from './types'
import { UI_TEXT } from './constants'

// Helper function to create raw data with processing columns
const createRawDataWithProcessingColumns = (filteredData: any[], assignedBooklets: any[], topCategory: number, middleCategory: number, firstCycleName: string) => {
    const rawDataWithAllColumns: any[] = []
    
    // Create a map of assigned booklets for quick lookup using the same key generation logic
    const assignedBookletsMap = new Map<string, any>()
    assignedBooklets.forEach(booklet => {
        const key = createRecordKey(booklet)
        assignedBookletsMap.set(key, booklet)
    })
    
            // Filter to only include primary cycle records for processing
        const primaryCycleData = filteredData.filter(record => record['Cycle'] === firstCycleName)
    
    // Group primary cycle data by evaluator for categorization
    const evaluatorGroups = new Map<string, any[]>()
    primaryCycleData.forEach(record => {
        const evaluator = record['Evaluated By']
        if (!evaluatorGroups.has(evaluator)) {
            evaluatorGroups.set(evaluator, [])
        }
        evaluatorGroups.get(evaluator)!.push(record)
    })
    
    // Process each evaluator's records (only primary cycle records)
    evaluatorGroups.forEach((evaluatorRecords) => {
        const sortedRecords = sortByTotalMarks(evaluatorRecords)
        const totalBooklets = sortedRecords.length
        const topCount = Math.ceil((topCategory / 100) * totalBooklets)
        const middleCount = Math.ceil((middleCategory / 100) * totalBooklets)
        
        sortedRecords.forEach((record: any, index: number) => {
            let category = ''
            if (index < topCount) {
                category = 'Top'
            } else if (index < topCount + middleCount) {
                category = 'Middle'
            } else {
                category = 'Bottom'
            }
            
            // Check if this record was selected for moderation using the same key generation logic
            const assignedBooklet = assignedBookletsMap.get(createRecordKey(record))
            
            const rawRecord = {
                ...record,
                Category: category,
                'Selected for Moderation': assignedBooklet ? 'Selected' : 'Not Selected',
                'Moderated By': assignedBooklet ? assignedBooklet['Moderated By'] : ''
            }
            
            rawDataWithAllColumns.push(rawRecord)
        })
    })
    
    // Add non-primary cycle records (Cycle = '-') without categorization
    filteredData.forEach(record => {
        if (record['Cycle'] !== firstCycleName) {
            const rawRecord = {
                ...record,
                Category: 'N/A',
                'Selected for Moderation': 'Not Selected',
                'Moderated By': ''
            }
            rawDataWithAllColumns.push(rawRecord)
        }
    })
    
    return rawDataWithAllColumns
}

function App() {
    // Use custom hooks
    const { userPreferences, savePreferences } = useUserPreferences()
    const { 
        logContainers,
        summaryLogs,
        addLogLineToContainer,
        addSummaryLog,
        addFileContainerWithLogs,
        addCycleValidation,
        clearLogs,
        startNewRun,
        toggleFileContainer
    } = useProcessingLogs()
    const { snackbar, showError, showSuccess, closeSnackbar } = useSnackbar()
    
    // Local state
    const [mode, setMode] = useState<'light' | 'dark'>('dark')
    const [preferencesOpen, setPreferencesOpen] = useState(false)

    // Form state
    const [enableDistribution, setEnableDistribution] = useState(false)
    const [topCategory, setTopCategory] = useState(20)
    const [middleCategory, setMiddleCategory] = useState(40)
    const [bottomCategory, setBottomCategory] = useState(40)
    const [pickTop, setPickTop] = useState(5)
    const [pickMiddle, setPickMiddle] = useState(10)
    const [pickBottom, setPickBottom] = useState(5)
    const [generateSchedule, setGenerateSchedule] = useState(true)
    const [generateBulk, setGenerateBulk] = useState(true)
    const [selectedFiles, setSelectedFiles] = useState<string[]>([])

    // Add error state
    const [distributionError, setDistributionError] = useState<string | null>(null)
    const [pickingError, setPickingError] = useState<string | null>(null)

    // State for process button error
    const [processError, setProcessError] = useState<string | null>(null)

    // File validation state
    const [validFiles, setValidFiles] = useState<string[]>([])
    
    // Store actual file objects for processing
    const [fileObjects, setFileObjects] = useState<File[]>([])
    
    // Store file paths for saving to same location
    const [filePathsMap, setFilePathsMap] = useState<Map<string, string>>(new Map())

    // Single evaluator dialog state
    const [singleEvaluatorDialog, setSingleEvaluatorDialog] = useState<{
        open: boolean
        evaluator: string
        booklets: any[]
        fileName: string
        onResolve: (action: 'same' | 'different' | 'cancel' | 'different_cancelled', alternateModerator?: string) => void
    }>({
        open: false,
        evaluator: '',
        booklets: [],
        fileName: '',
        onResolve: () => {}
    })

    // Alternate moderator dialog state
    const [alternateModeratorDialog, setAlternateModeratorDialog] = useState<{
        open: boolean
        fileName: string
        onResolve: (moderatorId: string) => void
    }>({
        open: false,
        fileName: '',
        onResolve: () => {}
    })

    // Theme setup
    const theme = React.useMemo(
        () => createTheme({
            palette: {
                mode,
            },
        }),
        [mode]
    )

    // Sync theme with user preferences
    useEffect(() => {
        if (userPreferences.theme === 'light' || userPreferences.theme === 'dark') {
            setMode(userPreferences.theme)
        }
    }, [userPreferences.theme])

    // Sync main UI values with user preferences when they change
    useEffect(() => {
        setTopCategory(userPreferences.topCategory)
        setMiddleCategory(userPreferences.middleCategory)
        setBottomCategory(userPreferences.bottomCategory)
        setPickTop(userPreferences.pickTop)
        setPickMiddle(userPreferences.pickMiddle)
        setPickBottom(userPreferences.pickBottom)
        setGenerateSchedule(userPreferences.generateSchedule)
        setGenerateBulk(userPreferences.generateBulk)
    }, [userPreferences])

    // Handle focus management for dialogs
    useEffect(() => {
        if (singleEvaluatorDialog.open || alternateModeratorDialog.open) {
            // Remove focus from any focused element when dialogs open
            const activeElement = document.activeElement as HTMLElement
            if (activeElement && activeElement !== document.body) {
                activeElement.blur()
            }
        }
    }, [singleEvaluatorDialog.open, alternateModeratorDialog.open])

    const toggleColorMode = () => {
        const newMode = mode === 'light' ? 'dark' : 'light'
        setMode(newMode)
        if (userPreferences.theme !== 'auto') {
            const newPreferences = { ...userPreferences, theme: newMode as 'light' | 'dark' | 'auto' }
            savePreferences(newPreferences)
        }
    }

        const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            // Check if we're in Tauri context
            if (typeof window !== 'undefined' && (window as any).__TAURI__) {
                // Use Tauri file dialog to select files
                let selected: any = null
                try {
                    // Use dynamic import with a function to avoid static analysis
                    const importModule = (path: string) => import(path)
                    const tauriDialog = await importModule('@tauri-apps/api/dialog')
                    selected = await tauriDialog.open({
                        multiple: true,
                        filters: [{
                            name: 'Excel Files',
                            extensions: ['xlsx', 'xls']
                        }],
                        title: 'Select Excel Files'
                    })
                } catch (importError) {
                    console.warn('Tauri dialog not available, falling back to browser input:', importError)
                    // Fall through to browser file input
                }
                
                if (selected && Array.isArray(selected)) {
                    const filePaths = selected as string[]
                    const newValidFiles: string[] = []
                    const newValidFileObjects: File[] = []
                    const newFilePathsMap = new Map<string, string>()
                    const invalidFiles: Array<{ name: string; missingColumns: string[] }> = []
                    
                    for (const filePath of filePaths) {
                        try {
                            const fileName = filePath.split(/[/\\]/).pop() || 'unknown'
                            
                            // For now, we'll store the file path and create a placeholder file object
                            // The actual file reading will be done during processing
                            const placeholderFile = new File([], fileName, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                            
                            // We'll validate during processing, for now just add the file
                            newValidFiles.push(fileName)
                            newValidFileObjects.push(placeholderFile)
                            newFilePathsMap.set(fileName, filePath)
                            
                        } catch (error) {
                            console.error('Error processing file:', filePath, error)
                            const fileName = filePath.split(/[/\\]/).pop() || 'unknown'
                            invalidFiles.push({
                                name: fileName,
                                missingColumns: ['File read error']
                            })
                        }
                    }
                    
                    // Only add valid files to the selection
                    setSelectedFiles(newValidFiles)
                    setValidFiles(newValidFiles)
                    setFileObjects(newValidFileObjects)
                    setFilePathsMap(newFilePathsMap)
                    
                    if (invalidFiles.length > 0) {
                        showError(`<b>${invalidFiles.length} files with invalid columns were rejected.</b><br/><br/>Ensure the selected files are downloaded from the result page using<br/> 'Download Evaluation Stats' button and not modified manually.`)
                    }
                }
            } else {
                // Fallback to browser file input
                const files = event.target.files
                if (files && files.length > 0) {
                    const validations = await Promise.all(Array.from(files).map(file => validateInputFile(file)))
                    const newValidFiles: string[] = []
                    const newValidFileObjects: File[] = []
                    const newFilePathsMap = new Map<string, string>()
                    const invalidFiles: Array<{ name: string; missingColumns: string[] }> = []
                    
                    validations.forEach((validation, idx) => {
                        const file = files[idx]
                        if (validation.valid) {
                            newValidFiles.push(file.name)
                            newValidFileObjects.push(file)
                        } else {
                            invalidFiles.push({
                                name: file.name,
                                missingColumns: validation.missingColumns
                            })
                        }
                    })
                    
                    setSelectedFiles(newValidFiles)
                    setValidFiles(newValidFiles)
                    setFileObjects(newValidFileObjects)
                    setFilePathsMap(newFilePathsMap)
                    
                    if (invalidFiles.length > 0) {
                        showError(`<b>${invalidFiles.length} files with invalid columns were rejected.</b><br/><br/>Ensure the selected files are downloaded from the result page using<br/> 'Download Evaluation Stats' button and not modified manually.`)
                    }
                }
            }
        } catch (error) {
            console.error('Error opening file dialog:', error)
            showError('Error opening file dialog. Please try again.')
        }
        
        // Reset the input value so the same file can be selected again
        event.target.value = ''
    }

    const handleFileRemove = (fileName: string) => {
        setSelectedFiles(prev => prev.filter(f => f !== fileName))
        setValidFiles(prev => prev.filter(f => f !== fileName))
        setFileObjects(prev => prev.filter(f => f.name !== fileName))
        setFilePathsMap(prev => {
            const newMap = new Map(prev)
            newMap.delete(fileName)
            return newMap
        })
    }

    const handleGenerateScheduleChange = (checked: boolean) => {
        if (!checked && !generateBulk) {
            setGenerateBulk(true)
            setGenerateSchedule(false)
            return
        }
        setGenerateSchedule(checked)
    }

    const handleGenerateBulkChange = (checked: boolean) => {
        if (!checked && !generateSchedule) {
            setGenerateSchedule(true)
            setGenerateBulk(false)
            return
        }
        setGenerateBulk(checked)
    }

    // Validation effect for main form
    useEffect(() => {
        const validationResult = validateUserPreferences({
            topCategory,
            middleCategory,
            bottomCategory,
            pickTop,
            pickMiddle,
            pickBottom,
            maxBookletsPerEvaluator: userPreferences.maxBookletsPerEvaluator,
            generateSchedule,
            generateBulk,
        })

        setDistributionError(validationResult.distributionError)
        setPickingError(validationResult.pickingError)
    }, [topCategory, middleCategory, bottomCategory, pickTop, pickMiddle, pickBottom, userPreferences.maxBookletsPerEvaluator])

    // Handler for Process Files button
    const handleProcessFiles = async () => {
        // Blur the button to prevent focus retention issues
        const activeElement = document.activeElement as HTMLElement
        if (activeElement) {
            activeElement.blur()
        }

        const validationError = validateFileProcessing(
            selectedFiles,
            validFiles,
            topCategory,
            middleCategory,
            bottomCategory,
            pickTop,
            pickMiddle,
            pickBottom,
            userPreferences.maxBookletsPerEvaluator,
            generateSchedule,
            generateBulk
        )

        if (validationError) {
            showError(validationError)
            return
        }

        // Start a new log container for this processing run
        startNewRun()
        
        // Add summary logs at the beginning
        const timestamp = formatTimestamp()
        addSummaryLog(`${timestamp}\t🚀 Processing started for ${validFiles.length} valid files`)
        
        // Step 1: Data Loading & Validation
        const processFiles = async () => {
            const allSelectedForModeration: any[] = []
            let skippedFilesDueToCycles = 0
            const processedDataByFileMap = new Map<string, any[]>()
            const fileDataByFileMap = new Map<string, any[]>()
            const categorizedDataByFileMap = new Map<string, any[]>()
            const rawDataByFileMap = new Map<string, any[]>()
            
            for (const fileName of validFiles) {
                let fileContainerId: string | undefined
                try {
                    // Add file container for this file
                    fileContainerId = addFileContainerWithLogs(fileName, [])
                    
                    const file = fileObjects.find(f => f.name === fileName)
                    if (!file) {
                                            addLogLineToContainer(`❌ Error: File object not found for ${fileName}`, fileContainerId)
                        continue
                    }
                    
                    const filePath = filePathsMap.get(fileName)
                    const jsonData = await readExcelFile(file, filePath)
                    
                    // Filter to only include the specified columns immediately after reading
                    const filteredData = filterToRequiredColumns(jsonData, IMPORT_COLUMNS)
                    
                    // Store filtered data for output generation (will be updated after categorization)
                    rawDataByFileMap.set(fileName, filteredData)
                    
                    // Validate cycle column values
                    const cycleValues = [...new Set(filteredData.map(row => row['Cycle']).filter(Boolean))]
                    const invalidCycles = cycleValues.filter(cycle => cycle !== userPreferences.firstCycleName && cycle !== '-')
                    
                    if (invalidCycles.length > 0) {
                        addCycleValidation(false, invalidCycles)
                        addLogLineToContainer(`Skipped processing this file because of unusual cycles found: ${invalidCycles.join(', ')}`, fileContainerId)
                        skippedFilesDueToCycles += 1
                        continue
                    }
                    
                    addCycleValidation(true)
                    addLogLineToContainer(`Validation passed: Only required cycles found`, fileContainerId)
                    
                                    // Filter data to only include Cycle = 'primary'
                const primaryData = filterPrimaryCycleRecords(filteredData, userPreferences.firstCycleName)
                    const absentRecords = filteredData.length - primaryData.length
                    
                    // Store primary data for this file (already filtered to required columns)
                    fileDataByFileMap.set(fileName, primaryData)
                    
                    // Group booklets by evaluator first (use primary data which is already filtered)
                    const evaluatorGroups = groupByEvaluator(primaryData)
                    
                    // Combined data loading and evaluator log
                    const dataLog = `Data Loaded: ${filteredData.length} Rows  |  ${primaryData.length} Present  |  ${absentRecords} Absent  |  ${evaluatorGroups.size} Evaluators`
                    addLogLineToContainer(dataLog, fileContainerId)
                    
                    const fileSelectedForModeration: any[] = []
                    const fileCategorizedData: any[] = []
                    
                    // Store evaluator information for later moderator assignment
                    const evaluatorInfo = new Map<string, { evaluatorName: string, selected: any[], evaluatorBooklets: any[], categorized: any[] }>()
                    
                    // Process each evaluator's booklets (use primaryData structure)
                    evaluatorGroups.forEach((evaluatorBooklets, evaluatorName) => {
                        const { categorized, selected } = processEvaluatorBooklets(
                            evaluatorBooklets,
                            topCategory,
                            middleCategory,
                            pickTop,
                            pickMiddle,
                            pickBottom
                        )
                        
                        // Store evaluator info for later
                        evaluatorInfo.set(evaluatorName, { evaluatorName, selected, evaluatorBooklets, categorized })
                        
                        fileSelectedForModeration.push(...selected)
                        fileCategorizedData.push(...categorized)
                    })
                    
                    // Extract all unique evaluators from this file to create a pool
                    const evaluatorPool = new Set<string>()
                    fileSelectedForModeration.forEach(record => {
                        const evaluator = record['Evaluated By'] || 'Unknown'
                        evaluatorPool.add(evaluator)
                    })
                    
                    const evaluatorList = Array.from(evaluatorPool)
                    
                    // Handle single evaluator scenario for this file
                    let dialogHandledAssignment = false
                    let fileCancelled = false
                    if (evaluatorList.length === 1) {
                        addLogLineToContainer(`Single evaluator detected: ${evaluatorList[0]}`, fileContainerId)
                        
                        // Create a promise to handle the dialog decision
                        const dialogDecision = new Promise<DialogDecision>((resolve) => {
                            setSingleEvaluatorDialog({
                                open: true,
                                evaluator: evaluatorList[0],
                                booklets: fileSelectedForModeration,
                                fileName: fileName,
                                onResolve: (action: 'same' | 'different' | 'cancel' | 'different_cancelled', alternateModerator) => {
                                    resolve({ action, alternateModerator })
                                }
                            })
                        })
                        
                        // Wait for user decision
                        const decision = await dialogDecision
                        
                        if (decision.action === 'same') {
                            addLogLineToContainer(`User chose: Same evaluator as moderator (${evaluatorList[0]})`, fileContainerId)
                            const assignedBooklets = fileSelectedForModeration.map(booklet => ({
                                ...booklet,
                                'Moderated By': evaluatorList[0]
                            }))
                            
                            // Add evaluator logs with moderator assignment information for single evaluator
                            evaluatorInfo.forEach((info, evaluatorName) => {
                                const { selected, evaluatorBooklets, categorized } = info
                                const topRecords = categorized.filter(r => r.Category === 'Top').length
                                const middleRecords = categorized.filter(r => r.Category === 'Middle').length
                                const bottomRecords = categorized.filter(r => r.Category === 'Bottom').length
                                const selectedTop = selected.filter(r => r.Category === 'Top').length
                                const selectedMiddle = selected.filter(r => r.Category === 'Middle').length
                                const selectedBottom = selected.filter(r => r.Category === 'Bottom').length
                                
                                                            // Create evaluator log with same evaluator as moderator
                            const evaluatorLog = `Evaluator: ${evaluatorName}\n  • Picked ${selectedTop} from ${topRecords} booklets from top\n  • Picked ${selectedMiddle} from ${middleRecords} booklets in the middle\n  • Picked ${selectedBottom} from ${bottomRecords} booklets at the bottom\n  • Total: ${selected.length} picked from ${evaluatorBooklets.length} booklets\n  • Assigned Moderator: ${evaluatorList[0]}`
                            
                            addLogLineToContainer(evaluatorLog, fileContainerId)
                        })
                        

                        allSelectedForModeration.push(...assignedBooklets)
                        processedDataByFileMap.set(fileName, assignedBooklets)
                        categorizedDataByFileMap.set(fileName, fileCategorizedData)
                        
                        // Create raw data with filtered columns plus processing columns
                        const fileRawDataWithAllColumns = createRawDataWithProcessingColumns(filteredData, assignedBooklets, topCategory, middleCategory, userPreferences.firstCycleName)
                        rawDataByFileMap.set(fileName, fileRawDataWithAllColumns)
                        
                        dialogHandledAssignment = true
                        } else if (decision.action === 'different' && decision.alternateModerator) {
                            addLogLineToContainer(`User chose: Assign different moderator`, fileContainerId)
                            addLogLineToContainer(`Alternate moderator entered: ${decision.alternateModerator}`, fileContainerId)
                            const assignedBooklets = fileSelectedForModeration.map(booklet => ({
                                ...booklet,
                                'Moderated By': decision.alternateModerator
                            }))
                            
                            // Add evaluator logs with moderator assignment information for alternate moderator
                            evaluatorInfo.forEach((info, evaluatorName) => {
                                const { selected, evaluatorBooklets, categorized } = info
                                const topRecords = categorized.filter(r => r.Category === 'Top').length
                                const middleRecords = categorized.filter(r => r.Category === 'Middle').length
                                const bottomRecords = categorized.filter(r => r.Category === 'Bottom').length
                                const selectedTop = selected.filter(r => r.Category === 'Top').length
                                const selectedMiddle = selected.filter(r => r.Category === 'Middle').length
                                const selectedBottom = selected.filter(r => r.Category === 'Bottom').length
                                
                                                            // Create evaluator log with alternate moderator
                            const evaluatorLog = `Evaluator: ${evaluatorName}\n  • Picked ${selectedTop} from ${topRecords} booklets from top\n  • Picked ${selectedMiddle} from ${middleRecords} booklets in the middle\n  • Picked ${selectedBottom} from ${bottomRecords} booklets at the bottom\n  • Total Picked: ${selected.length} from ${evaluatorBooklets.length} booklets\n  • Moderator Selected: ${decision.alternateModerator}`
                            
                            addLogLineToContainer(evaluatorLog, fileContainerId)
                        })
                        

                        allSelectedForModeration.push(...assignedBooklets)
                        processedDataByFileMap.set(fileName, assignedBooklets)
                        categorizedDataByFileMap.set(fileName, fileCategorizedData)
                        
                        // Create raw data with filtered columns plus processing columns
                        const fileRawDataWithAllColumns = createRawDataWithProcessingColumns(filteredData, assignedBooklets, topCategory, middleCategory, userPreferences.firstCycleName)
                        rawDataByFileMap.set(fileName, fileRawDataWithAllColumns)
                        
                        dialogHandledAssignment = true
                        } else if (decision.action === 'cancel') {
                            addLogLineToContainer(`❌ User chose: Cancel processing`, fileContainerId)
                            fileCancelled = true
                            continue
                        } else if (decision.action === 'different_cancelled') {
                            addLogLineToContainer(`User chose: Assign different moderator`, fileContainerId)
                            addLogLineToContainer(`❌ User chose: Cancel processing`, fileContainerId)
                            fileCancelled = true
                            continue
                        }
                    }
                    
                    // Only proceed if file was not cancelled
                    if (!fileCancelled) {
                        // Add allocation successful message only if not cancelled
                        addLogLineToContainer(`Allocation Successful: ${fileSelectedForModeration.length} out of ${filteredData.length} booklets`, fileContainerId)
                        
                        // Skip automatic assignment if dialog already handled it
                        if (!dialogHandledAssignment) {
                        const assignedBooklets = assignModerators(fileSelectedForModeration, evaluatorList)
                        
                        // Create detailed assignment log
                        const assignmentGroups = new Map<string, string>()
                        assignedBooklets.forEach(booklet => {
                            const evaluator = booklet['Evaluated By']
                            const moderator = booklet['Moderated By']
                            assignmentGroups.set(evaluator, moderator)
                        })
                        

                        
                        // Add evaluator logs with moderator assignment information
                        evaluatorInfo.forEach((info, evaluatorName) => {
                            const { selected, evaluatorBooklets, categorized } = info
                            const topRecords = categorized.filter(r => r.Category === 'Top').length
                            const middleRecords = categorized.filter(r => r.Category === 'Middle').length
                            const bottomRecords = categorized.filter(r => r.Category === 'Bottom').length
                            const selectedTop = selected.filter(r => r.Category === 'Top').length
                            const selectedMiddle = selected.filter(r => r.Category === 'Middle').length
                            const selectedBottom = selected.filter(r => r.Category === 'Bottom').length
                            
                            // Get the assigned moderator for this evaluator
                            const assignedModerator = assignmentGroups.get(evaluatorName) || 'Unknown'
                            
                            // Create evaluator log with actual moderator assignment
                            const evaluatorLog = `Evaluator: ${evaluatorName}\n  • Picked ${selectedTop} from ${topRecords} booklets from top\n  • Picked ${selectedMiddle} from ${middleRecords} booklets in the middle\n  • Picked ${selectedBottom} from ${bottomRecords} booklets at the bottom\n  • Total: ${selected.length} picked from ${evaluatorBooklets.length} booklets\n  • Assigned Moderator: ${assignedModerator}`
                            
                            addLogLineToContainer(evaluatorLog, fileContainerId)
                        })
                        
                        allSelectedForModeration.push(...assignedBooklets)
                        processedDataByFileMap.set(fileName, assignedBooklets)
                        categorizedDataByFileMap.set(fileName, fileCategorizedData)
                        
                        // Create raw data with filtered columns plus processing columns
                        const fileRawDataWithAllColumns = createRawDataWithProcessingColumns(filteredData, assignedBooklets, topCategory, middleCategory, userPreferences.firstCycleName)
                        rawDataByFileMap.set(fileName, fileRawDataWithAllColumns)
                    }
                }
                    
                } catch (error) {
                    addLogLineToContainer(`❌ Processing error: ${fileName} - ${error instanceof Error ? error.message : 'Unknown error'}`, fileContainerId)
                    continue
                }
            }
            
            // Step 5: Output Generation
            // Create a map of file objects for same-location saving
            const fileObjectsMap = new Map<string, File>()
            fileObjects.forEach(file => {
                fileObjectsMap.set(file.name, file)
            })
            
            const outputResult = await generateOutputFiles(
                generateSchedule,
                generateBulk,
                processedDataByFileMap,
                rawDataByFileMap,
                allSelectedForModeration,
                fileObjectsMap,
                filePathsMap,
                userPreferences.saveToSameLocation
            )
            
            // Add summary to the last processed file container
            if (logContainers.length > 0) {
                // We need to add these logs to the last file container
                // For now, let's add them as logs to the current file container
                addLogLineToContainer(`${formatTimestamp()}\t📊 Processing Summary: All files processed - Total selected for moderation: ${allSelectedForModeration.length} booklets`)
                addLogLineToContainer(`${formatTimestamp()}\t💾 Step 5: Output Generation`)
                
                if (generateSchedule) {
                    addLogLineToContainer(`📁 Individual files: Generating processed files...`)
                                            addLogLineToContainer(`Generated: ${outputResult.individualFiles.count} individual processed files`)
                }
                
                if (generateBulk) {
                    addLogLineToContainer(`📁 Bulk file: Generating consolidated allocation file...`)
                                            addLogLineToContainer(`Saved: ${outputResult.bulkFile} (${allSelectedForModeration.length} selected records)`)
                }
                
                addLogLineToContainer(`${formatTimestamp()}\t🎉 Processing completed successfully! All operations finished`)
            }
            
            // Show success message
            const skippedSuffix = skippedFilesDueToCycles > 0 
                ? ` Skipped ${skippedFilesDueToCycles} file(s) due to unusual cycles.` 
                : ''
            const message = generateSchedule && generateBulk 
                ? `Processing completed! Generated ${outputResult.individualFiles.count} individual file(s) and 1 bulk file.` + skippedSuffix
                : generateSchedule 
                ? `Processing completed! Generated ${outputResult.individualFiles.count} individual file(s).` + skippedSuffix
                : generateBulk 
                ? `Processing completed! Generated 1 bulk file.` + skippedSuffix
                : `Processing completed!` + skippedSuffix
            showSuccess(message)
        }
        
        // Start the processing
        processFiles()
    }

    // Get button text based on validation status
    const getProcessButtonText = () => {
        if (selectedFiles.length === 0) return UI_TEXT.PROCESS_FILES
        if (validFiles.length === 0) return "No valid files to process"
        if (validFiles.length === selectedFiles.length) return UI_TEXT.PROCESS_FILES
        return `Process ${validFiles.length} valid files only`
    }

    // Handler for Reset button
    const handleReset = () => {
        setTopCategory(userPreferences.topCategory)
        setMiddleCategory(userPreferences.middleCategory)
        setBottomCategory(userPreferences.bottomCategory)
        setPickTop(userPreferences.pickTop)
        setPickMiddle(userPreferences.pickMiddle)
        setPickBottom(userPreferences.pickBottom)
        setGenerateSchedule(userPreferences.generateSchedule)
        setGenerateBulk(userPreferences.generateBulk)
        setEnableDistribution(false)
        setSelectedFiles([])
        setFileObjects([])
        setFilePathsMap(new Map())
        setProcessError(null)
        clearLogs()
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ 
                minHeight: '100vh',
                background: theme.palette.mode === 'dark' 
                    ? 'rgba(18, 18, 30, 0.98)'
                    : 'rgba(220, 225, 235, 0.98)',
                backgroundAttachment: 'fixed',
                // Prevent focus retention issues
                '&:focus-within': {
                    outline: 'none'
                }
            }}>
                {/* Enhanced Header */}
                <AppBar 
                    position="static" 
                    elevation={0}
                    sx={{
                        background: theme.palette.mode === 'dark'
                            ? 'rgba(26, 26, 46, 0.95)'
                            : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderBottom: `1px solid ${theme.palette.divider}`
                    }}
                >
                    <Toolbar sx={{ minHeight: 60 }}>
                        <Typography 
                            variant="h5" 
                            component="div" 
                            sx={{ 
                                flexGrow: 1,
                                fontWeight: 700,
                                color: theme.palette.mode === 'dark'
                                    ? 'rgba(102, 126, 234, 0.9)'
                                    : 'rgba(33, 150, 243, 0.9)',
                                letterSpacing: '0.5px'
                            }}
                        >
                            {UI_TEXT.APP_TITLE}
                        </Typography>
                        <IconButton
                            onClick={toggleColorMode}
                            sx={{
                                mr: 2,
                                color: theme.palette.text.secondary,
                                '&:hover': {
                                    color: theme.palette.primary.main,
                                    transform: 'scale(1.1)',
                                    transition: 'all 0.2s ease-in-out'
                                }
                            }}
                        >
                            {mode === 'dark' ? <LightMode /> : <DarkMode />}
                        </IconButton>
                        <IconButton
                            onClick={() => setPreferencesOpen(true)}
                            sx={{ 
                                mr: 2,
                                color: theme.palette.text.secondary,
                                '&:hover': {
                                    color: theme.palette.primary.main,
                                    transform: 'scale(1.1)',
                                    transition: 'all 0.2s ease-in-out'
                                }
                            }}
                        >
                            <Settings />
                        </IconButton>
                        <Box
                            component="img"
                            src={theme.palette.mode === 'dark' ? brandLogoWhitePath : brandLogoPath}
                            alt="Brand Logo"
                            sx={{
                                height: 40,
                                width: 'auto',
                                objectFit: 'contain'
                            }}
                        />
                    </Toolbar>
                </AppBar>

                {/* Enhanced Main Content */}
                <Container maxWidth={false} sx={{ 
                    py: 2, 
                    px: { xs: 1, md: 2 },
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <Grid container spacing={2} justifyContent="center">
                        {/* Left Panel - Controls */}
                        <Grid item xs={12}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2
                            }}>
                                {/* Top sections - fixed height */}
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                    flexShrink: 0
                                }}>
                                    {/* Configure Distribution and Picking */}
                                    <ProcessingConfig
                                        enableDistribution={enableDistribution}
                                        topCategory={topCategory}
                                        middleCategory={middleCategory}
                                        bottomCategory={bottomCategory}
                                        pickTop={pickTop}
                                        pickMiddle={pickMiddle}
                                        pickBottom={pickBottom}
                                        distributionError={distributionError}
                                        pickingError={pickingError}
                                        onEnableDistributionChange={setEnableDistribution}
                                        onTopCategoryChange={setTopCategory}
                                        onMiddleCategoryChange={setMiddleCategory}
                                        onBottomCategoryChange={setBottomCategory}
                                        onPickTopChange={setPickTop}
                                        onPickMiddleChange={setPickMiddle}
                                        onPickBottomChange={setPickBottom}
                                    />

                                    {/* Output File Section */}
                                    <OutputConfig
                                        generateSchedule={generateSchedule}
                                        generateBulk={generateBulk}
                                        onGenerateScheduleChange={handleGenerateScheduleChange}
                                        onGenerateBulkChange={handleGenerateBulkChange}
                                    />
                                </Box>

                                {/* File Upload Section */}
                                <Box sx={{
                                    flexShrink: 0,
                                    flexGrow: 0
                                }}>
                                    <FileUpload
                                        selectedFiles={selectedFiles}
                                        onFileUpload={handleFileUpload}
                                        onFileRemove={handleFileRemove}
                                    />
                                </Box>

                                {/* Reset and Process Files Section */}
                                <Box sx={{
                                    flexShrink: 0
                                }}>
                                    {/* Enhanced Process Files Button Section */}
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        gap: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        background: theme.palette.mode === 'dark'
                                            ? 'rgba(30, 30, 50, 0.95)'
                                            : 'rgba(255, 255, 255, 0.98)',
                                        border: theme.palette.mode === 'dark'
                                            ? '1px solid rgba(255, 255, 255, 0.1)'
                                            : '1px solid rgba(255, 255, 255, 0.2)',
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: theme.palette.mode === 'dark'
                                            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                                            : '0 8px 32px rgba(0, 0, 0, 0.1)'
                                    }}>
                                        <Button
                                            variant="outlined"
                                            size="large"
                                            onClick={handleReset}
                                            sx={{
                                                px: 4,
                                                py: 1.5,
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                borderWidth: 2,
                                                '&:hover': {
                                                    borderWidth: 2,
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: theme.shadows[8],
                                                    transition: 'all 0.3s ease-in-out'
                                                }
                                            }}
                                        >
                                            {UI_TEXT.RESET}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            onClick={handleProcessFiles}
                                            disabled={validFiles.length === 0}
                                            sx={{
                                                px: 6,
                                                py: 1.5,
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontSize: '1.1rem',
                                                fontWeight: 700,
                                                background: theme.palette.mode === 'dark'
                                                    ? 'rgba(102, 126, 234, 0.9)'
                                                    : 'rgba(33, 150, 243, 0.9)',
                                                '&:hover': {
                                                    background: theme.palette.mode === 'dark'
                                                        ? 'rgba(118, 75, 162, 0.9)'
                                                        : 'rgba(33, 203, 243, 0.9)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: theme.shadows[12],
                                                    transition: 'all 0.3s ease-in-out'
                                                },
                                                '&:disabled': {
                                                    background: theme.palette.action.disabledBackground,
                                                    transform: 'none',
                                                    boxShadow: 'none'
                                                }
                                            }}
                                        >
                                            {getProcessButtonText()}
                                        </Button>
                                    </Box>
                            
                                    {processError && (
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'center',
                                            mt: 1
                                        }}>
                                            <Typography
                                                color="error" 
                                                variant="body2"
                                                sx={{
                                                    textAlign: 'center', 
                                                    maxWidth: 500,
                                                    p: 2,
                                                    borderRadius: 2,
                                                    bgcolor: theme.palette.mode === 'dark' 
                                                        ? 'rgba(244, 67, 54, 0.1)' 
                                                        : 'rgba(244, 67, 54, 0.05)',
                                                    border: `1px solid ${theme.palette.error.main}`
                                                }}
                                            >
                                                {processError}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                        
                        {/* Right Panel - Logs */}
                        <Grid item xs={12}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <ProcessingLogs 
                                    logContainers={logContainers}
                                    summaryLogs={summaryLogs}
                                    onToggleFileContainer={toggleFileContainer}
                                />
                            </Box>
                </Grid>
                    </Grid>
                </Container>

                {/* User Preferences Dialog */}
                <UserPreferencesDialog
                    open={preferencesOpen}
                    userPreferences={userPreferences}
                    onClose={() => setPreferencesOpen(false)}
                    onSavePreferences={savePreferences}
                    distributionError={distributionError}
                    pickingError={pickingError}
                />

                {/* Single Evaluator Dialog */}
                                <SingleEvaluatorDialog
                    open={singleEvaluatorDialog.open}
                    evaluator={singleEvaluatorDialog.evaluator}
                    booklets={singleEvaluatorDialog.booklets}
                    fileName={singleEvaluatorDialog.fileName}
                    onResolve={singleEvaluatorDialog.onResolve}
                    onClose={() => setSingleEvaluatorDialog(prev => ({ ...prev, open: false }))}
                    onAlternateModerator={() => {
                                setSingleEvaluatorDialog(prev => ({ ...prev, open: false }))
                                setAlternateModeratorDialog({
                                    open: true,
                                    fileName: singleEvaluatorDialog.fileName,
                                    onResolve: (moderatorId) => {
                                        singleEvaluatorDialog.onResolve('different', moderatorId)
                                    }
                                })
                            }}
                />

                {/* Alternate Moderator Dialog */}
                <AlternateModeratorDialog
                    open={alternateModeratorDialog.open}
                    fileName={alternateModeratorDialog.fileName}
                    onResolve={alternateModeratorDialog.onResolve}
                    onClose={() => {
                        setAlternateModeratorDialog(prev => ({ ...prev, open: false }))
                        // When user cancels from alternate moderator dialog, resolve with special action
                        singleEvaluatorDialog.onResolve('different_cancelled')
                    }}
                />

                {/* Enhanced Modern Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={snackbar.severity === 'error' ? 8000 : 5000}
                    onClose={closeSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    TransitionComponent={Slide}
                    transitionDuration={400}
                    sx={{
                        '& .MuiSnackbar-root': {
                            top: '24px !important'
                        }
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            minWidth: snackbar.severity === 'error' ? '650px' : '480px',
                            maxWidth: snackbar.severity === 'error' ? '850px' : '650px',
                            background: snackbar.severity === 'error' 
                                ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
                                : snackbar.severity === 'success'
                                ? 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)'
                                : snackbar.severity === 'warning'
                                ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
                                : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                            backdropFilter: 'blur(24px)',
                            borderRadius: '20px',
                            border: snackbar.severity === 'error' 
                                ? '1px solid rgba(255, 255, 255, 0.15)'
                                : '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: snackbar.severity === 'error'
                                ? '0 25px 80px rgba(220, 38, 38, 0.25), 0 12px 40px rgba(0, 0, 0, 0.15)'
                                : snackbar.severity === 'success'
                                ? '0 25px 80px rgba(34, 197, 94, 0.25), 0 12px 40px rgba(0, 0, 0, 0.1)'
                                : snackbar.severity === 'warning'
                                ? '0 25px 80px rgba(245, 158, 11, 0.25), 0 12px 40px rgba(0, 0, 0, 0.1)'
                                : '0 25px 80px rgba(59, 130, 246, 0.25), 0 12px 40px rgba(0, 0, 0, 0.1)',
                            overflow: 'hidden',
                            position: 'relative',
                            transform: 'translateY(0)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: snackbar.severity === 'error'
                                    ? '0 30px 100px rgba(220, 38, 38, 0.3), 0 15px 50px rgba(0, 0, 0, 0.2)'
                                    : snackbar.severity === 'success'
                                    ? '0 30px 100px rgba(34, 197, 94, 0.3), 0 15px 50px rgba(0, 0, 0, 0.15)'
                                    : snackbar.severity === 'warning'
                                    ? '0 30px 100px rgba(245, 158, 11, 0.3), 0 15px 50px rgba(0, 0, 0, 0.15)'
                                    : '0 30px 100px rgba(59, 130, 246, 0.3), 0 15px 50px rgba(0, 0, 0, 0.15)'
                            },
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: 'rgba(255, 255, 255, 0.3)',
                                backdropFilter: 'blur(10px)'
                            },
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
                                pointerEvents: 'none'
                            }
                        }}
                    >
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            p: 3.5,
                            gap: 2.5,
                            position: 'relative',
                            zIndex: 1
                        }}>
                            {/* Enhanced Icon */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '48px',
                                height: '48px',
                                borderRadius: '16px',
                                background: 'rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                flexShrink: 0,
                                position: 'relative',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: '-1px',
                                    left: '-1px',
                                    right: '-1px',
                                    bottom: '-1px',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))',
                                    zIndex: -1
                                }
                            }}>
                                {snackbar.severity === 'error' ? (
                                    <ErrorOutline sx={{ 
                                        fontSize: '28px', 
                                        color: 'rgba(255, 255, 255, 1)',
                                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                                    }} />
                                ) : snackbar.severity === 'success' ? (
                                    <CheckCircleOutline sx={{ 
                                        fontSize: '28px', 
                                        color: 'rgba(255, 255, 255, 1)',
                                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                                    }} />
                                ) : snackbar.severity === 'warning' ? (
                                    <WarningAmber sx={{ 
                                        fontSize: '28px', 
                                        color: 'rgba(255, 255, 255, 1)',
                                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                                    }} />
                                ) : (
                                    <Info sx={{ 
                                        fontSize: '28px', 
                                        color: 'rgba(255, 255, 255, 1)',
                                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                                    }} />
                                )}
                            </Box>

                            {/* Enhanced Content */}
                            <Box sx={{
                                flex: 1,
                                minWidth: 0,
                                '& br': {
                                    marginBottom: '10px'
                                },
                                '& b': {
                                    fontWeight: 700,
                                    color: 'rgba(255, 255, 255, 1)',
                                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)'
                                }
                            }}>
                                <div 
                                    dangerouslySetInnerHTML={{ __html: snackbar.message }}
                                    style={{
                                        fontSize: '15px',
                                        lineHeight: '1.7',
                                        color: 'rgba(255, 255, 255, 1)',
                                        fontWeight: 600,
                                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                                        letterSpacing: '0.2px'
                                    }}
                                />
                            </Box>

                            {/* Enhanced Close Button */}
                            <IconButton
                                onClick={closeSnackbar}
                                sx={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '12px',
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        color: 'rgba(255, 255, 255, 1)',
                                        transform: 'scale(1.05)',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                    },
                                    '&:active': {
                                        transform: 'scale(0.95)'
                                    },
                                    flexShrink: 0
                                }}
                            >
                                <Box component="span" sx={{
                                    fontSize: '20px',
                                    fontWeight: 400,
                                    lineHeight: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    ×
                                </Box>
                            </IconButton>
                        </Box>
                    </Box>
                </Snackbar>
            </Box>
        </ThemeProvider>
    )
}

export default App 