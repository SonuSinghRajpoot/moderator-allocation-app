import React, { useState } from 'react'
import {
    Box,
    Typography,
    Paper,
    Chip,
    IconButton,
    Collapse,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { 
    CheckCircle, 
    Error, 
    Warning, 
    Info, 
    FolderOpen,
    Assignment,
    Assessment,
    Save,
    ExpandMore,
    ExpandLess,
    PlayArrow,
    Person,
} from '@mui/icons-material'
import { UI_TEXT } from '../../constants'
import { FileLogContainer } from '../../hooks/useProcessingLogs'

interface ProcessingLogsProps {
    logContainers: FileLogContainer[]
    summaryLogs: string[]
    onToggleFileContainer: (fileContainerId: string) => void
}

// Helper function to determine log type and icon
const getLogInfo = (log: string) => {
    if (log.includes('❌') || log.includes('Error:') || log.includes('Skipped processing this file because of unusual cycles found:')) {
        return { type: 'error', icon: <Error sx={{ fontSize: '1rem', color: '#f44336' }} /> }
    }
    if (log.includes('Success') || log.includes('completed') || 
        log.includes('Validation passed:') || log.includes('Data Loaded:') ||
        log.includes('User chose:') || log.includes('Alternate moderator entered:') ||
        log.includes('Generated:') || log.includes('Saved:')) {
        return { type: 'success', icon: <CheckCircle sx={{ fontSize: '1rem', color: '#4caf50' }} /> }
    }
    if (log.includes('⚠️') || log.includes('Warning')) {
        return { type: 'warning', icon: <Warning sx={{ fontSize: '1rem', color: '#ff9800' }} /> }
    }
    if (log.includes('📊') || log.includes('📁') || log.includes('📋')) {
        return { type: 'info', icon: <Info sx={{ fontSize: '1rem', color: '#2196f3' }} /> }
    }
    if (log.includes('Step') || log.includes('Started processing')) {
        return { type: 'step', icon: <Assessment sx={{ fontSize: '1rem', color: '#9c27b0' }} /> }
    }
    if (log.includes('Assignment') || log.includes('moderator')) {
        return { type: 'assignment', icon: <Assignment sx={{ fontSize: '1rem', color: '#ff5722' }} /> }
    }
    if (log.includes('📄') || log.includes('Generating') || log.includes('Saved:')) {
        return { type: 'output', icon: <Save sx={{ fontSize: '1rem', color: '#00bcd4' }} /> }
    }
    if (log.includes('⚡') || log.includes('Processing started') || log.includes('All files processed')) {
        return { type: 'header', icon: <FolderOpen sx={{ fontSize: '1.2rem', color: '#673ab7' }} /> }
    }
    return { type: 'default', icon: <Info sx={{ fontSize: '1rem', color: '#757575' }} /> }
}

// Helper function to get background color based on log type
const getLogBackground = (type: string, index: number, isDarkMode: boolean = false) => {
    const baseColors = {
        error: 'rgba(244, 67, 54, 0.05)',
        success: 'rgba(76, 175, 80, 0.05)',
        warning: 'rgba(255, 152, 0, 0.05)',
        info: 'rgba(33, 150, 243, 0.05)',
        step: 'rgba(156, 39, 176, 0.05)',
        assignment: 'rgba(255, 87, 34, 0.05)',
        output: 'rgba(0, 188, 212, 0.05)',
        header: isDarkMode ? 'rgba(103, 58, 183, 0.15)' : 'rgba(103, 58, 183, 0.08)',
        default: index % 2 === 0 
            ? (isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)')
            : 'transparent'
    }
    return baseColors[type as keyof typeof baseColors] || baseColors.default
}

// Helper function to get border color based on log type
const getLogBorder = (type: string) => {
    const borderColors = {
        error: 'rgba(244, 67, 54, 0.3)',
        success: 'rgba(76, 175, 80, 0.3)',
        warning: 'rgba(255, 152, 0, 0.3)',
        info: 'rgba(33, 150, 243, 0.3)',
        step: 'rgba(156, 39, 176, 0.3)',
        assignment: 'rgba(255, 87, 34, 0.3)',
        output: 'rgba(0, 188, 212, 0.3)',
        header: 'rgba(103, 58, 183, 0.5)',
        default: 'rgba(102, 126, 234, 0.2)'
    }
    return borderColors[type as keyof typeof borderColors] || borderColors.default
}

// Helper function to detect if a log is an evaluator log
const isEvaluatorLog = (log: string) => {
    return log.trim().startsWith('Evaluator:')
}

// Helper function to extract evaluator email from log
const getEvaluatorEmail = (log: string) => {
    const match = log.match(/^Evaluator:\s*(.+)$/m)
    return match ? match[1].trim() : ''
}

// Helper function to group logs by evaluator
const groupLogsByEvaluator = (logs: string[]) => {
    const groups: { [key: string]: string[] } = {}
    let currentEvaluator = ''
    let currentGroup: string[] = []
    
    logs.forEach(log => {
        if (isEvaluatorLog(log)) {
            // Save previous group if exists
            if (currentEvaluator && currentGroup.length > 0) {
                groups[currentEvaluator] = [...currentGroup]
            }
            // Start new group
            currentEvaluator = getEvaluatorEmail(log)
            currentGroup = [log]
        } else if (currentEvaluator && log.trim().startsWith('  •')) {
            // This is a detail line for current evaluator
            currentGroup.push(log)
        } else {
            // This is a regular log, add to current group if exists
            if (currentEvaluator) {
                currentGroup.push(log)
            }
        }
    })
    
    // Add the last group
    if (currentEvaluator && currentGroup.length > 0) {
        groups[currentEvaluator] = [...currentGroup]
    }
    
    return groups
}

export const ProcessingLogs: React.FC<ProcessingLogsProps> = ({ 
    logContainers,
    summaryLogs,
    onToggleFileContainer
}) => {
    const theme = useTheme()
    const [collapsedEvaluators, setCollapsedEvaluators] = useState<Set<string>>(new Set())

    // Initialize all evaluators as collapsed by default
    React.useEffect(() => {
        const evaluatorEmails = new Set<string>()
        logContainers.forEach(container => {
            const evaluatorGroups = groupLogsByEvaluator(container.logs)
            Object.keys(evaluatorGroups).forEach(email => {
                evaluatorEmails.add(email)
            })
        })
        setCollapsedEvaluators(evaluatorEmails)
    }, [logContainers])

    const toggleEvaluatorCollapse = (evaluatorEmail: string) => {
        setCollapsedEvaluators(prev => {
            const newSet = new Set(prev)
            if (newSet.has(evaluatorEmail)) {
                newSet.delete(evaluatorEmail)
            } else {
                newSet.add(evaluatorEmail)
            }
            return newSet
        })
    }

    return (
        <Paper sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            p: 1.5,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' 
                ? 'rgba(30, 30, 50, 0.95)'
                : 'rgba(255, 255, 255, 0.98)',
            border: theme.palette.mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: theme.palette.mode === 'dark'
                ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                : '0 4px 20px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease-in-out',
            minHeight: 0,
            '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: theme.palette.mode === 'dark'
                    ? '0 6px 25px rgba(0, 0, 0, 0.4)'
                    : '0 6px 25px rgba(0, 0, 0, 0.12)'
            }
        }}>
                            <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    pb: 1,
                    borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}>
                        <Typography 
                            variant="subtitle1" 
                            sx={{ 
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                color: 'rgba(102, 126, 234, 0.8)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                            }}
                        >
                            📋 {UI_TEXT.PROCESSING_LOGS}
                        </Typography>
                        {logContainers.length > 0 && (
                            <Chip 
                                label={logContainers.length} 
                                size="small" 
                                sx={{ 
                                    bgcolor: 'rgba(102, 126, 234, 0.1)', 
                                    color: 'rgba(102, 126, 234, 0.8)',
                                    fontSize: '0.7rem',
                                    height: '20px'
                                }} 
                            />
                        )}
                    </Box>
                </Box>
            
            <Box sx={{ 
                flex: 1, 
                overflow: 'auto',
                borderRadius: 1.5,
                minHeight: 0,
                maxHeight: '100%',
                '&::-webkit-scrollbar': {
                    width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                    background: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.05)',
                    borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(102, 126, 234, 0.3)',
                    borderRadius: '3px',
                    '&:hover': {
                        background: 'rgba(102, 126, 234, 0.5)',
                    },
                },
            }}>
                {logContainers.length === 0 ? (
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: 'text.secondary',
                        textAlign: 'center',
                        py: 4
                    }}>
                        <Typography variant="h4" sx={{ mb: 2, opacity: 0.6 }}>
                            📋
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            opacity: 0.8, 
                            fontWeight: 500,
                            mb: 0.5
                        }}>
                            {UI_TEXT.NO_LOGS}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                            opacity: 0.6,
                            fontSize: '0.75rem'
                        }}>
                            Processing output will appear here
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Summary Logs Section */}
                        {summaryLogs.length > 0 && (
                            <Box sx={{
                                borderRadius: 1.5,
                                background: theme.palette.mode === 'dark'
                                    ? 'rgba(103, 58, 183, 0.15)'
                                    : 'rgba(103, 58, 183, 0.05)',
                                border: theme.palette.mode === 'dark'
                                    ? '1px solid rgba(103, 58, 183, 0.3)'
                                    : '1px solid rgba(103, 58, 183, 0.2)',
                                overflow: 'hidden',
                                mb: 1
                            }}>
                                <Box sx={{
                                    p: 1,
                                    background: theme.palette.mode === 'dark'
                                        ? 'rgba(103, 58, 183, 0.2)'
                                        : 'rgba(103, 58, 183, 0.1)',
                                    borderBottom: theme.palette.mode === 'dark'
                                        ? '1px solid rgba(103, 58, 183, 0.25)'
                                        : '1px solid rgba(103, 58, 183, 0.15)'
                                }}>
                                    <Typography variant="body2" sx={{
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        color: theme.palette.mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.95)'
                                            : 'rgba(103, 58, 183, 0.9)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}>
                                        📊 Processing Summary
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 1 }}>
                                    {summaryLogs.map((log, index) => {
                                        const { type, icon } = getLogInfo(log)
                                        return (
                                            <Box key={index} sx={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: 1,
                                                p: 0.5,
                                                borderRadius: 1,
                                                background: getLogBackground(type, index, theme.palette.mode === 'dark'),
                                                border: `1px solid ${getLogBorder(type)}`,
                                                mb: 0.5,
                                                '&:last-child': { mb: 0 }
                                            }}>
                                                {icon}
                                                <Typography variant="body2" sx={{
                                                    fontSize: '0.75rem',
                                                    lineHeight: 1.4,
                                                    color: theme.palette.mode === 'dark'
                                                        ? 'rgba(255, 255, 255, 0.9)'
                                                        : 'rgba(0, 0, 0, 0.8)',
                                                    flex: 1,
                                                    '& b': {
                                                        fontWeight: 600,
                                                        color: theme.palette.mode === 'dark'
                                                            ? 'rgba(255, 255, 255, 1)'
                                                            : 'rgba(103, 58, 183, 0.9)'
                                                    }
                                                }}
                                                dangerouslySetInnerHTML={{ __html: log }}
                                                />
                                            </Box>
                                        )
                                    })}
                                </Box>
                            </Box>
                        )}
                        
                        {/* File Containers */}
                        {logContainers.map((fileContainer) => {
                            const logs = fileContainer.logs
                            
                            return (
                                <Box key={fileContainer.id} sx={{
                                    borderRadius: 1.5,
                                    background: 'rgba(33, 150, 243, 0.03)',
                                    border: '1px solid rgba(33, 150, 243, 0.15)',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease-in-out',
                                    mb: 2,
                                    '&:hover': {
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                    }
                                }}>
                                    {/* File Container Header */}
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 1.5,
                                        background: '#1976d2',
                                        borderBottom: fileContainer.isCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            background: '#1565c0'
                                        }
                                    }}
                                    onClick={() => onToggleFileContainer(fileContainer.id)}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <PlayArrow sx={{ 
                                                fontSize: '0.9rem', 
                                                color: 'rgba(255, 255, 255, 0.9)' 
                                            }} />
                                            <Typography variant="body2" sx={{
                                                fontWeight: 700,
                                                fontSize: '0.8rem',
                                                color: 'rgba(255, 255, 255, 0.95)'
                                            }}>
                                                {fileContainer.fileName}
                                            </Typography>
                                            
                                            {/* Cycle Validation Indicator */}
                                            {fileContainer.cycleValidation && (
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                    ml: 1
                                                }}>
                                                    {fileContainer.cycleValidation.isValid ? (
                                                        <CheckCircle sx={{ 
                                                            fontSize: '0.8rem', 
                                                            color: '#4caf50' 
                                                        }} />
                                                    ) : (
                                                        <Error sx={{ 
                                                            fontSize: '0.8rem', 
                                                            color: '#f44336' 
                                                        }} />
                                                    )}
                                                    <Typography variant="caption" sx={{
                                                        fontSize: '0.7rem',
                                                        color: fileContainer.cycleValidation.isValid ? '#81c784' : '#ef5350',
                                                        fontWeight: 500
                                                    }}>
                                                        {fileContainer.cycleValidation.isValid 
                                                            ? 'Only valid cycles found'
                                                            : `Invalid cycle(s) ${fileContainer.cycleValidation.invalidCycles?.join(', ')} found`
                                                        }
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            {(() => {
                                                // Extract booklet information from logs
                                                const allocationLog = logs.find(log => log.includes('Allocation Successful:'))
                                                const dataLog = logs.find(log => log.includes('Data Loaded:'))
                                                
                                                const allocationMatch = allocationLog ? allocationLog.match(/Allocation Successful:\s*(\d+)\s*out\s*of\s*(\d+)\s*booklets/) : null
                                                const dataMatch = dataLog ? dataLog.match(/Data Loaded:\s*\d+\s*Rows\s*\|\s*(\d+)\s*Present/) : null
                                                
                                                const pickedCount = allocationMatch ? allocationMatch[1] : '0'
                                                const presentCount = dataMatch ? dataMatch[1] : (allocationMatch ? allocationMatch[2] : '0')
                                                const percentage = presentCount !== '0' ? ((parseInt(pickedCount) / parseInt(presentCount)) * 100).toFixed(2) : '0'
                                                const bookletInfo = `${pickedCount}/${presentCount} (${percentage}%) booklets picked`
                                                
                                                return (
                                                    <>
                                                        <Chip 
                                                            label={bookletInfo} 
                                                            size="small" 
                                                            sx={{ 
                                                                bgcolor: 'rgba(255, 255, 255, 0.15)', 
                                                                color: 'rgba(255, 255, 255, 0.9)',
                                                                fontSize: '0.6rem',
                                                                height: '16px'
                                                            }} 
                                                        />
                                                        <IconButton 
                                                            size="small"
                                                            sx={{ 
                                                                p: 0.25,
                                                                color: 'rgba(255, 255, 255, 0.8)'
                                                            }}
                                                        >
                                                            {fileContainer.isCollapsed ? <ExpandMore /> : <ExpandLess />}
                                                        </IconButton>
                                                    </>
                                                )
                                            })()}
                                        </Box>
                                    </Box>
                                    
                                    {/* File Container Content */}
                                    <Collapse in={!fileContainer.isCollapsed}>
                                        <Box sx={{ p: 2 }}>
                                            {logs.length === 0 ? (
                                                <Typography variant="body2" sx={{
                                                    color: 'text.secondary',
                                                    fontStyle: 'italic',
                                                    textAlign: 'center',
                                                    py: 1,
                                                    fontSize: '0.75rem'
                                                }}>
                                                    No logs for this file
                                                </Typography>
                                            ) : (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                    {(() => {
                                                        const evaluatorGroups = groupLogsByEvaluator(logs)
                                                        const regularLogs = logs.filter(log => !isEvaluatorLog(log) && !log.trim().startsWith('  •'))
                                                        
                                                        return (
                                                            <>
                                                                {/* Regular logs */}
                                                                {regularLogs.map((log, index) => {
                                                                    const logInfo = getLogInfo(log)
                                                                    return (
                                                                        <Box key={`regular-${index}`} sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'flex-start',
                                                                            gap: 0.75,
                                                                            p: 0.75,
                                                                            borderRadius: 1,
                                                                            background: getLogBackground(logInfo.type, index, theme.palette.mode === 'dark'),
                                                                            border: `1px solid ${getLogBorder(logInfo.type)}`,
                                                                            transition: 'all 0.2s ease-in-out',
                                                                            '&:hover': {
                                                                                background: 'rgba(33, 150, 243, 0.05)',
                                                                                transform: 'translateX(1px)',
                                                                            }
                                                                        }}>
                                                                            <Box sx={{ 
                                                                                mt: 0.125,
                                                                                display: 'flex',
                                                                                alignItems: 'center'
                                                                            }}>
                                                                                {logInfo.icon}
                                                                            </Box>
                                                                            <Typography
                                                                                variant="body2"
                                                                                sx={{
                                                                                    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                                                                                    fontSize: '0.75rem',
                                                                                    fontWeight: 400,
                                                                                    whiteSpace: 'pre-wrap',
                                                                                    lineHeight: 1.5,
                                                                                    color: theme.palette.mode === 'dark'
                                                                                        ? 'rgba(255, 255, 255, 0.9)'
                                                                                        : 'rgba(0, 0, 0, 0.75)',
                                                                                    flex: 1
                                                                                }}
                                                                                dangerouslySetInnerHTML={{ __html: log }}
                                                                            />
                                                                        </Box>
                                                                    )
                                                                })}
                                                                
                                                                {/* Evaluator logs - collapsible */}
                                                                                                                                   {Object.entries(evaluatorGroups).map(([evaluatorEmail, evaluatorLogs]) => {
                                                                    const isCollapsed = collapsedEvaluators.has(evaluatorEmail)
                                                                    
                                                                                                                                        // Extract evaluator and moderator information
                                                                    const evaluatorLog = evaluatorLogs.find(log => log.includes('Evaluator:'))
                                                                    const moderatorLog = evaluatorLogs.find(log => log.includes('Assigned Moderator:'))
                                                                    const moderatorSelectedLog = evaluatorLogs.find(log => log.includes('Moderator Selected:'))
                                                                    
                                                                    const evaluatorFullEmail = evaluatorLog ? evaluatorLog.match(/Evaluator:\s*(.+)$/m)?.[1]?.trim() || evaluatorEmail : evaluatorEmail
                                                                    const moderatorFullEmail = moderatorLog ? moderatorLog.match(/Assigned Moderator:\s*(.+)$/m)?.[1]?.trim() : 
                                                                        (moderatorSelectedLog ? moderatorSelectedLog.match(/Moderator Selected:\s*(.+)$/m)?.[1]?.trim() : '')
                                                                    const headerText = moderatorFullEmail ? `${evaluatorFullEmail} → ${moderatorFullEmail}` : evaluatorFullEmail
                                                                    
                                                                    // Extract booklet information
                                                                    const totalLog = evaluatorLogs.find(log => log.includes('Total:'))
                                                                    const totalMatch = totalLog ? totalLog.match(/Total:\s*(\d+)\s*picked\s*from\s*(\d+)\s*booklets/) : null
                                                                    const totalPickedLog = evaluatorLogs.find(log => log.includes('Total Picked:'))
                                                                    const totalPickedMatch = totalPickedLog ? totalPickedLog.match(/Total Picked:\s*(\d+)\s*from\s*(\d+)\s*booklets/) : null
                                                                    const pickedCount = totalPickedMatch ? totalPickedMatch[1] : (totalMatch ? totalMatch[1] : '0')
                                                                    const totalCount = totalPickedMatch ? totalPickedMatch[2] : (totalMatch ? totalMatch[2] : '0')
                                                                    const bookletInfo = `${pickedCount}/${totalCount} booklets picked`
                                                                    
                                                                    return (
                                                                        <Box key={`evaluator-${evaluatorEmail}`} sx={{
                                                                            borderRadius: 1,
                                                                            background: 'rgba(255, 87, 34, 0.05)',
                                                                            border: '1px solid rgba(255, 87, 34, 0.2)',
                                                                            overflow: 'hidden',
                                                                            transition: 'all 0.2s ease-in-out',
                                                                            '&:hover': {
                                                                                background: 'rgba(255, 87, 34, 0.08)',
                                                                                transform: 'translateX(1px)',
                                                                            }
                                                                        }}>
                                                                            {/* Evaluator Header */}
                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'space-between',
                                                                                p: 0.75,
                                                                                background: 'rgba(255, 87, 34, 0.1)',
                                                                                borderBottom: isCollapsed ? 'none' : '1px solid rgba(255, 87, 34, 0.15)',
                                                                                cursor: 'pointer',
                                                                                '&:hover': {
                                                                                    background: 'rgba(255, 87, 34, 0.15)'
                                                                                }
                                                                            }}
                                                                            onClick={() => toggleEvaluatorCollapse(evaluatorEmail)}
                                                                            >
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: 0.75
                                                                                }}>
                                                                                    <Person sx={{ 
                                                                                        fontSize: '0.9rem', 
                                                                                        color: 'rgba(255, 87, 34, 0.8)' 
                                                                                    }} />
                                                                                    <Typography variant="body2" sx={{
                                                                                        fontWeight: 600,
                                                                                        fontSize: '0.7rem',
                                                                                        color: theme.palette.mode === 'dark'
                                                                                            ? 'rgba(255, 255, 255, 0.95)'
                                                                                            : 'rgba(255, 87, 34, 0.9)',
                                                                                        fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif'
                                                                                    }}>
                                                                                        {headerText}
                                                                                    </Typography>
                                                                                </Box>
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: 0.5
                                                                                }}>
                                                                                    <Chip 
                                                                                        label={bookletInfo} 
                                                                                        size="small" 
                                                                                        sx={{ 
                                                                                            bgcolor: theme.palette.mode === 'dark'
                                                                                                ? 'rgba(255, 255, 255, 0.1)'
                                                                                                : 'rgba(0, 0, 0, 0.1)', 
                                                                                            color: theme.palette.mode === 'dark'
                                                                                                ? 'rgba(255, 255, 255, 0.8)'
                                                                                                : 'rgba(0, 0, 0, 0.7)',
                                                                                            fontSize: '0.6rem',
                                                                                            height: '16px'
                                                                                        }} 
                                                                                    />
                                                                                    <IconButton 
                                                                                        size="small"
                                                                                        sx={{ 
                                                                                            p: 0.25,
                                                                                            color: 'rgba(255, 87, 34, 0.7)'
                                                                                        }}
                                                                                    >
                                                                                        {isCollapsed ? <ExpandMore /> : <ExpandLess />}
                                                                                    </IconButton>
                                                                                </Box>
                                                                            </Box>
                                                                            
                                                                            {/* Evaluator Details */}
                                                                            <Collapse in={!isCollapsed}>
                                                                                <Box sx={{ p: 0.75 }}>
                                                                                    {evaluatorLogs.map((log, logIndex) => {
                                                                                        const logInfo = getLogInfo(log)
                                                                                        return (
                                                                                            <Box key={`evaluator-log-${logIndex}`} sx={{
                                                                                                display: 'flex',
                                                                                                alignItems: 'flex-start',
                                                                                                gap: 0.75,
                                                                                                p: 0.5,
                                                                                                borderRadius: 0.5,
                                                                                                background: getLogBackground(logInfo.type, logIndex, theme.palette.mode === 'dark'),
                                                                                                border: `1px solid ${getLogBorder(logInfo.type)}`,
                                                                                                mb: 0.5,
                                                                                                '&:last-child': { mb: 0 },
                                                                                                transition: 'all 0.2s ease-in-out',
                                                                                                '&:hover': {
                                                                                                    background: 'rgba(255, 87, 34, 0.05)',
                                                                                                }
                                                                                            }}>
                                                                                                <Box sx={{ 
                                                                                                    mt: 0.125,
                                                                                                    display: 'flex',
                                                                                                    alignItems: 'center'
                                                                                                }}>
                                                                                                    {logInfo.icon}
                                                                                                </Box>
                                                                                                <Typography
                                                                                                    variant="body2"
                                                                                                    sx={{
                                                                                                        fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                                                                                                        fontSize: '0.7rem',
                                                                                                        fontWeight: 400,
                                                                                                        whiteSpace: 'pre-wrap',
                                                                                                        lineHeight: 1.4,
                                                                                                        color: theme.palette.mode === 'dark'
                                                                                                            ? 'rgba(255, 255, 255, 0.9)'
                                                                                                            : 'rgba(0, 0, 0, 0.75)',
                                                                                                        flex: 1
                                                                                                    }}
                                                                                                    dangerouslySetInnerHTML={{ __html: log }}
                                                                                                />
                                                                                            </Box>
                                                                                        )
                                                                                    })}
                                                                                </Box>
                                                                            </Collapse>
                                                                        </Box>
                                                                    )
                                                                })}
                                                            </>
                                                        )
                                                    })()}
                                                </Box>
                                            )}
                                        </Box>
                                    </Collapse>
                                </Box>
                            )
                        })}
                    </Box>
                )}
            </Box>
        </Paper>
    )
} 