import { useState } from 'react'

export interface FileLogContainer {
    id: string
    fileName: string
    isCollapsed: boolean
    logs: string[]
    cycleValidation?: {
        isValid: boolean
        invalidCycles?: string[]
    }
}

export const useProcessingLogs = () => {
    const [fileContainers, setFileContainers] = useState<FileLogContainer[]>([])
    const [summaryLogs, setSummaryLogs] = useState<string[]>([])
    const [currentFileContainerId, setCurrentFileContainerId] = useState<string | null>(null)

    // Start a new processing run - clear all existing logs
    const startNewRun = () => {
        // Clear all existing file containers and summary logs
        setFileContainers([])
        setSummaryLogs([])
        setCurrentFileContainerId(null)
    }

    // Add a file container for processing
    const addFileContainer = (fileName: string) => {
        const fileContainer: FileLogContainer = {
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fileName,
            isCollapsed: false,
            logs: []
        }
        
        console.log('Creating file container:', fileContainer.id, 'for file:', fileName)
        
        setFileContainers(prev => [...prev, fileContainer])
        setCurrentFileContainerId(fileContainer.id)
        
        console.log('Set current file container ID to:', fileContainer.id)
        
        // Return the container ID for external use
        return fileContainer.id
    }

    // Add a file container and immediately add logs to it
    const addFileContainerWithLogs = (fileName: string, initialLogs: string[]) => {
        const fileContainer: FileLogContainer = {
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fileName,
            isCollapsed: false,
            logs: initialLogs
        }
        
        console.log('Creating file container with logs:', fileContainer.id, 'for file:', fileName)
        
        setFileContainers(prev => [...prev, fileContainer])
        setCurrentFileContainerId(fileContainer.id)
        
        console.log('Set current file container ID to:', fileContainer.id)
        
        return fileContainer.id
    }

    // Set the current file container ID
    const setCurrentFileContainer = (fileContainerId: string) => {
        setCurrentFileContainerId(fileContainerId)
    }

    // Add cycle validation to current file container
    const addCycleValidation = (isValid: boolean, invalidCycles?: string[]) => {
        if (!currentFileContainerId) return
        
        setFileContainers(prev => prev.map(fileContainer => {
            if (fileContainer.id === currentFileContainerId) {
                return {
                    ...fileContainer,
                    cycleValidation: { isValid, invalidCycles }
                }
            }
            return fileContainer
        }))
    }

    // Add a log line to the current file container
    const addLogLine = (message: string) => {
        if (!currentFileContainerId) return
        
        setFileContainers(prev => prev.map(fileContainer => {
            if (fileContainer.id === currentFileContainerId) {
                return {
                    ...fileContainer,
                    logs: [...fileContainer.logs, message]
                }
            }
            return fileContainer
        }))
    }

    // Add a log line to a specific file container
    const addLogLineToContainer = (message: string, fileContainerId?: string) => {
        const targetId = fileContainerId || currentFileContainerId
        if (!targetId) {
            console.warn('No file container ID provided or set, cannot add log:', message)
            return
        }
        
        console.log('Adding log to container:', targetId, message)
        
        setFileContainers(prev => prev.map(fileContainer => {
            if (fileContainer.id === targetId) {
                console.log('Found container, adding log:', fileContainer.fileName)
                return {
                    ...fileContainer,
                    logs: [...fileContainer.logs, message]
                }
            }
            return fileContainer
        }))
    }

    // Add summary log to the global summary section
    const addSummaryLog = (message: string) => {
        setSummaryLogs(prev => [...prev, message])
    }

    // Clear all logs
    const clearLogs = () => {
        setFileContainers([])
        setSummaryLogs([])
        setCurrentFileContainerId(null)
    }

    // Get current logs from all file containers
    const getCurrentLogs = () => {
        return fileContainers.flatMap(container => container.logs)
    }

    // Get all logs from all containers
    const getAllLogs = () => {
        return fileContainers.flatMap(container => container.logs)
    }

    // Get log count
    const getLogCount = () => {
        return fileContainers.reduce((total, container) => {
            return total + container.logs.length
        }, 0)
    }

    // Check if logs are empty
    const isEmpty = () => {
        return fileContainers.length === 0
    }

    // Toggle file container collapse state
    const toggleFileContainer = (fileContainerId: string) => {
        setFileContainers(prev => prev.map(fileContainer => {
            if (fileContainer.id === fileContainerId) {
                return {
                    ...fileContainer,
                    isCollapsed: !fileContainer.isCollapsed
                }
            }
            return fileContainer
        }))
    }

    // Get all file containers for display
    const getFileContainers = () => {
        return fileContainers
    }

    return {
        logContainers: getFileContainers(),
        summaryLogs,
        addLogLine,
        addLogLineToContainer,
        addSummaryLog,
        addFileContainer,
        addFileContainerWithLogs,
        addCycleValidation,
        clearLogs,
        getCurrentLogs,
        getAllLogs,
        getLogCount,
        isEmpty,
        startNewRun,
        toggleFileContainer,
        setCurrentFileContainer,
    }
} 