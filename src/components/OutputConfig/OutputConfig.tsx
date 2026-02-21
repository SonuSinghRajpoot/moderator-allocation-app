import React from 'react'
import {
    Paper,
    Grid,
    Typography,
    FormControlLabel,
    Switch,
    Box,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { UI_TEXT } from '../../constants'

interface OutputConfigProps {
    generateSchedule: boolean
    generateBulk: boolean
    onGenerateScheduleChange: (checked: boolean) => void
    onGenerateBulkChange: (checked: boolean) => void
}

export const OutputConfig: React.FC<OutputConfigProps> = ({
    generateSchedule,
    generateBulk,
    onGenerateScheduleChange,
    onGenerateBulkChange,
}) => {
    const theme = useTheme()

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
            '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: theme.palette.mode === 'dark'
                    ? '0 6px 25px rgba(0, 0, 0, 0.4)'
                    : '0 6px 25px rgba(0, 0, 0, 0.12)'
            }
        }}>
                        <Typography 
                variant="subtitle1" 
                sx={{ 
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    mb: 1,
                    color: 'rgba(102, 126, 234, 0.7)'
                }}
            >
                {UI_TEXT.OUTPUT_FILE}
            </Typography>
            
            <Grid container spacing={1.5}>
                <Grid item xs={12} md={6}>
                    <Box sx={{
                        p: 1,
                        borderRadius: 1,
                        border: `1px solid ${generateSchedule ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                        background: generateSchedule ? 'rgba(102, 126, 234, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer',
                        '&:hover': {
                            borderColor: 'rgba(102, 126, 234, 0.4)',
                            background: 'rgba(102, 126, 234, 0.03)',
                            transform: 'scale(1.005)'
                        }
                    }}
                    onClick={() => onGenerateScheduleChange(!generateSchedule)}
                    >
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={generateSchedule}
                                    onChange={(e) => onGenerateScheduleChange(e.target.checked)}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#667eea',
                                            '&:hover': {
                                                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                            },
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#667eea',
                                        },
                                    }}
                                />
                            }
                            label={
                                <Box sx={{ ml: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.25, fontSize: '0.95rem' }}>
                                        {UI_TEXT.INDIVIDUAL_FILES}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                                        Generate separate files for each input file
                                    </Typography>
                                </Box>
                            }
                            sx={{ margin: 0, width: '100%' }}
                        />
                    </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Box sx={{
                        p: 1,
                        borderRadius: 1,
                        border: `1px solid ${generateBulk ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                        background: generateBulk ? 'rgba(102, 126, 234, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer',
                        '&:hover': {
                            borderColor: 'rgba(102, 126, 234, 0.4)',
                            background: 'rgba(102, 126, 234, 0.03)',
                            transform: 'scale(1.005)'
                        }
                    }}
                    onClick={() => onGenerateBulkChange(!generateBulk)}
                    >
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={generateBulk}
                                    onChange={(e) => onGenerateBulkChange(e.target.checked)}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#667eea',
                                            '&:hover': {
                                                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                            },
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#667eea',
                                        },
                                    }}
                                />
                            }
                            label={
                                <Box sx={{ ml: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.25, fontSize: '0.95rem' }}>
                                        {UI_TEXT.BULK_FILE}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                                        Combine all data into a single file
                                    </Typography>
                                </Box>
                            }
                            sx={{ margin: 0, width: '100%' }}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    )
} 