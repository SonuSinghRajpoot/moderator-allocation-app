import React from 'react'
import {
    Paper,
    Box,
    Typography,
    Chip,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { CloudUpload } from '@mui/icons-material'

interface FileUploadProps {
    selectedFiles: string[]
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
    onFileRemove: (fileName: string) => void
}

export const FileUpload: React.FC<FileUploadProps> = ({
    selectedFiles,
    onFileUpload,
    onFileRemove,
}) => {
    const theme = useTheme()
    
    const handleFileRemove = (fileName: string) => (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onFileRemove(fileName)
    }

    return (
        <Paper sx={{ 
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
            display: 'flex',
            flexDirection: 'column',
            '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: theme.palette.mode === 'dark'
                    ? '0 6px 25px rgba(0, 0, 0, 0.4)'
                    : '0 6px 25px rgba(0, 0, 0, 0.12)'
            }
        }}>
            <Typography 
                variant="h6" 
                sx={{ 
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    mb: 1.5,
                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}
            >
                File Upload
            </Typography>
            
            <Box
                component="label"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    minHeight: selectedFiles.length === 0 ? 70 : 'auto',
                    border: '2px dashed',
                    borderColor: 'rgba(102, 126, 234, 0.4)',
                    borderRadius: 3,
                    px: 1.5,
                    py: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    background: 'rgba(102, 126, 234, 0.03)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(102, 126, 234, 0.05)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease-in-out',
                    },
                    '&:hover': {
                        borderColor: '#667eea',
                        background: 'rgba(102, 126, 234, 0.08)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
                        '&::before': {
                            opacity: 1,
                        }
                    },
                    '&:active': {
                        transform: 'translateY(0px)',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)',
                    }
                }}
            >
                <input
                    type="file"
                    hidden
                    multiple
                    accept=".xlsx"
                    onChange={onFileUpload}
                />
                {selectedFiles.length === 0 ? (
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        gap: 1, 
                        width: '100%', 
                        justifyContent: 'center', 
                        textAlign: 'center'
                    }}>
                        <CloudUpload sx={{ 
                            fontSize: 40,
                            color: 'rgba(102, 126, 234, 0.7)',
                            mb: 0.75,
                            filter: 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.2))'
                        }} />
                        <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            fontSize: '1rem', 
                            mb: 0.25,
                            color: 'rgba(102, 126, 234, 0.9)'
                        }}>
                            Upload Excel Files
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            color: 'text.secondary', 
                            fontSize: '0.85rem', 
                            fontWeight: 500
                        }}>
                            Click to browse or drag & drop (.xlsx)
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        width: '100%',
                        alignItems: 'flex-start',
                        maxHeight: '200px', // Allow up to ~8 rows of chips
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(0, 0, 0, 0.05)',
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
                        {selectedFiles.map((file, idx) => (
                            <Chip
                                key={file + idx}
                                label={file}
                                onDelete={handleFileRemove(file)}
                                onClick={(e) => {
                                    e.stopPropagation()
                                }}
                                size="small"
                                sx={{
                                    maxWidth: '100%',
                                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                                    color: '#4caf50',
                                    border: '1px solid #4caf50',
                                    borderRadius: 1,
                                    fontWeight: 500,
                                    height: '24px',
                                    '& .MuiChip-label': {
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '200px',
                                        fontSize: '0.75rem',
                                        px: 0.5
                                    },
                                    '& .MuiChip-deleteIcon': {
                                        color: '#4caf50',
                                        fontSize: '16px',
                                        width: '16px',
                                        height: '16px',
                                        margin: '0 2px 0 0',
                                        '&:hover': {
                                            color: '#2e7d32',
                                            transform: 'scale(1.1)',
                                            transition: 'all 0.2s ease-in-out'
                                        }
                                    },
                                    '&:hover': {
                                        bgcolor: 'rgba(76, 175, 80, 0.2)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.12)',
                                        transition: 'all 0.2s ease-in-out'
                                    }
                                }}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </Paper>
    )
} 