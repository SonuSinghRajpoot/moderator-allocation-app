import React from 'react'
import {
    Paper,
    Box,
    Typography,
    Grid,
    TextField,
    FormControlLabel,
    Switch,
    InputAdornment,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { UI_TEXT } from '../../constants'

interface ProcessingConfigProps {
    enableDistribution: boolean
    topCategory: number
    middleCategory: number
    bottomCategory: number
    pickTop: number
    pickMiddle: number
    pickBottom: number
    distributionError: string | null
    pickingError: string | null
    onEnableDistributionChange: (checked: boolean) => void
    onTopCategoryChange: (value: number) => void
    onMiddleCategoryChange: (value: number) => void
    onBottomCategoryChange: (value: number) => void
    onPickTopChange: (value: number) => void
    onPickMiddleChange: (value: number) => void
    onPickBottomChange: (value: number) => void
}

export const ProcessingConfig: React.FC<ProcessingConfigProps> = ({
    enableDistribution,
    topCategory,
    middleCategory,
    bottomCategory,
    pickTop,
    pickMiddle,
    pickBottom,
    distributionError,
    pickingError,
    onEnableDistributionChange,
    onTopCategoryChange,
    onMiddleCategoryChange,
    onBottomCategoryChange,
    onPickTopChange,
    onPickMiddleChange,
    onPickBottomChange,
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
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 1.5,
                pb: 0.75,
                borderBottom: theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(0, 0, 0, 0.1)'
            }}>
                <Typography 
                    variant="h6" 
                    sx={{ 
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: 'rgba(102, 126, 234, 0.9)'
                    }}
                >
                    {UI_TEXT.CONFIGURE_DISTRIBUTION}
                </Typography>
                <FormControlLabel
                    control={
                        <Switch
                            checked={enableDistribution}
                            onChange={(e) => onEnableDistributionChange(e.target.checked)}
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
                    label=""
                    sx={{ marginRight: 0 }}
                />
            </Box>

            <Grid container spacing={1.5}>
                {/* Distribution Section */}
                <Grid item xs={12}>
                    <Typography 
                        variant="subtitle1" 
                        sx={{ 
                            mb: 1, 
                            fontWeight: 600,
                            color: 'text.secondary',
                            fontSize: '0.85rem'
                        }}
                    >
                        Distribution Categories
                    </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                                            <TextField
                            fullWidth
                            label="Top Category"
                            type="number"
                            value={topCategory}
                            onChange={(e) => onTopCategoryChange(Number(e.target.value))}
                            disabled={!enableDistribution}
                            size="small"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                                            % booklets
                                        </Typography>
                                    </InputAdornment>
                                ),
                                sx: { 
                                    fontSize: '0.9rem',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: enableDistribution ? '#667eea' : 'rgba(255, 255, 255, 0.2)',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: enableDistribution ? '#764ba2' : 'rgba(255, 255, 255, 0.3)',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#667eea',
                                    }
                                }
                            }}
                            sx={{
                                '& .MuiInputLabel-root': {
                                    fontSize: '0.85rem',
                                    fontWeight: 500
                                }
                            }}
                        />
                </Grid>
                <Grid item xs={12} md={4}>
                                            <TextField
                            fullWidth
                            label="Middle Category"
                            type="number"
                            value={middleCategory}
                            onChange={(e) => onMiddleCategoryChange(Number(e.target.value))}
                            disabled={!enableDistribution}
                            size="small"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                                            % booklets
                                        </Typography>
                                    </InputAdornment>
                                ),
                                sx: { 
                                    fontSize: '0.9rem',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: enableDistribution ? '#667eea' : 'rgba(255, 255, 255, 0.2)',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: enableDistribution ? '#764ba2' : 'rgba(255, 255, 255, 0.3)',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#667eea',
                                    }
                                }
                            }}
                            sx={{
                                '& .MuiInputLabel-root': {
                                    fontSize: '0.85rem',
                                    fontWeight: 500
                                }
                            }}
                        />
                </Grid>
                <Grid item xs={12} md={4}>
                                            <TextField
                            fullWidth
                            label="Bottom Category"
                            type="number"
                            value={bottomCategory}
                            onChange={(e) => onBottomCategoryChange(Number(e.target.value))}
                            disabled={!enableDistribution}
                            size="small"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                                            % booklets
                                        </Typography>
                                    </InputAdornment>
                                ),
                                sx: { 
                                    fontSize: '0.9rem',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: enableDistribution ? '#667eea' : 'rgba(255, 255, 255, 0.2)',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: enableDistribution ? '#764ba2' : 'rgba(255, 255, 255, 0.3)',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#667eea',
                                    }
                                }
                            }}
                            sx={{
                                '& .MuiInputLabel-root': {
                                    fontSize: '0.85rem',
                                    fontWeight: 500
                                }
                            }}
                        />
                </Grid>

                {/* Picking Section */}
                <Grid item xs={12}>
                    <Typography 
                        variant="subtitle1" 
                        sx={{ 
                            mb: 1, 
                            mt: 0.25,
                            fontWeight: 600,
                            color: 'text.secondary',
                            fontSize: '0.85rem'
                        }}
                    >
                        Selection Percentages
                    </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                                            <TextField
                            fullWidth
                            label="Pick from Top"
                            type="number"
                            value={pickTop}
                            onChange={(e) => onPickTopChange(Number(e.target.value))}
                            disabled={!enableDistribution}
                            size="small"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                                            % from top
                                        </Typography>
                                    </InputAdornment>
                                ),
                                sx: { 
                                    fontSize: '0.9rem',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: enableDistribution ? '#667eea' : 'rgba(255, 255, 255, 0.2)',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: enableDistribution ? '#764ba2' : 'rgba(255, 255, 255, 0.3)',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#667eea',
                                    }
                                }
                            }}
                            sx={{
                                '& .MuiInputLabel-root': {
                                    fontSize: '0.85rem',
                                    fontWeight: 500
                                }
                            }}
                        />
                </Grid>
                <Grid item xs={12} md={4}>
                                            <TextField
                            fullWidth
                            label="Pick from Middle"
                            type="number"
                            value={pickMiddle}
                            onChange={(e) => onPickMiddleChange(Number(e.target.value))}
                            disabled={!enableDistribution}
                            size="small"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                                            % from middle
                                        </Typography>
                                    </InputAdornment>
                                ),
                                sx: { 
                                    fontSize: '0.9rem',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: enableDistribution ? '#667eea' : 'rgba(255, 255, 255, 0.2)',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: enableDistribution ? '#764ba2' : 'rgba(255, 255, 255, 0.3)',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#667eea',
                                    }
                                }
                            }}
                            sx={{
                                '& .MuiInputLabel-root': {
                                    fontSize: '0.85rem',
                                    fontWeight: 500
                                }
                            }}
                        />
                </Grid>
                <Grid item xs={12} md={4}>
                                            <TextField
                            fullWidth
                            label="Pick from Bottom"
                            type="number"
                            value={pickBottom}
                            onChange={(e) => onPickBottomChange(Number(e.target.value))}
                            disabled={!enableDistribution}
                            size="small"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                                            % from bottom
                                        </Typography>
                                    </InputAdornment>
                                ),
                                sx: { 
                                    fontSize: '0.9rem',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: enableDistribution ? '#667eea' : 'rgba(255, 255, 255, 0.2)',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: enableDistribution ? '#764ba2' : 'rgba(255, 255, 255, 0.3)',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#667eea',
                                    }
                                }
                            }}
                            sx={{
                                '& .MuiInputLabel-root': {
                                    fontSize: '0.85rem',
                                    fontWeight: 500
                                }
                            }}
                        />
                </Grid>
            </Grid>
            
            {/* Error Messages */}
            {(distributionError || pickingError) && (
                <Box sx={{ mt: 1.5, p: 1, borderRadius: 1.5, bgcolor: 'rgba(244, 67, 54, 0.1)', border: '1px solid rgba(244, 67, 54, 0.3)' }}>
                    {distributionError && (
                        <Typography color="error" variant="body2" sx={{ mb: pickingError ? 0.75 : 0, fontWeight: 500, fontSize: '0.85rem' }}>
                            ⚠️ {distributionError}
                        </Typography>
                    )}
                    {pickingError && (
                        <Typography color="error" variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                            ⚠️ {pickingError}
                        </Typography>
                    )}
                </Box>
            )}
        </Paper>
    )
} 