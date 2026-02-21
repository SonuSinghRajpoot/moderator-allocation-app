import React from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Grid,
    TextField,
    FormControlLabel,
    Switch,
    Divider,
    InputAdornment,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { UserPreferences as UserPreferencesType } from '../../types'
import { UI_TEXT } from '../../constants'

interface UserPreferencesProps {
    open: boolean
    userPreferences: UserPreferencesType
    onClose: () => void
    onSavePreferences: (preferences: UserPreferencesType) => void
    distributionError: string | null
    pickingError: string | null
}

export const UserPreferencesDialog: React.FC<UserPreferencesProps> = ({
    open,
    userPreferences,
    onClose,
    onSavePreferences,
    distributionError,
    pickingError,
}) => {
    const theme = useTheme()
    const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
        onSavePreferences({ ...userPreferences, theme })
    }

    const handleAutoSaveChange = (checked: boolean) => {
        onSavePreferences({ ...userPreferences, autoSave: checked })
    }

    const handleSaveToSameLocationChange = (checked: boolean) => {
        onSavePreferences({ ...userPreferences, saveToSameLocation: checked })
    }

    const handleMaxBookletsChange = (value: number) => {
        if (value > 0 && value <= 100) {
            onSavePreferences({ ...userPreferences, maxBookletsPerEvaluator: value })
        }
    }

    const handleDistributionChange = (field: keyof UserPreferencesType, value: number) => {
        onSavePreferences({ ...userPreferences, [field]: value })
    }

    const handlePickingChange = (field: keyof UserPreferencesType, value: number) => {
        onSavePreferences({ ...userPreferences, [field]: value })
    }

    const handleOutputChange = (field: keyof UserPreferencesType, checked: boolean) => {
        if (field === 'generateSchedule' && !checked && !userPreferences.generateBulk) {
            onSavePreferences({ ...userPreferences, generateBulk: true, generateSchedule: false })
        } else if (field === 'generateBulk' && !checked && !userPreferences.generateSchedule) {
            onSavePreferences({ ...userPreferences, generateSchedule: true, generateBulk: false })
        } else {
            onSavePreferences({ ...userPreferences, [field]: checked })
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    background: theme.palette.mode === 'dark' 
                        ? 'rgba(30, 30, 50, 0.98)'
                        : 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    border: theme.palette.mode === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: theme.palette.mode === 'dark'
                        ? '0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(0, 0, 0, 0.2)'
                        : '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                    }
                }
            }}
        >
            <DialogTitle sx={{ pb: 1, fontSize: '1.25rem', fontWeight: 700 }}>
                {UI_TEXT.USER_PREFERENCES}
            </DialogTitle>
            <Typography variant="body2" sx={{ px: 3, pb: 2, fontSize: '0.8rem' }}>
                Set your preferences which will be used for the next time you launch this application.
            </Typography>
            <Divider sx={{ mx: 3, mb: 2 }} />
            <DialogContent sx={{ pt: 1, pb: 2, px: 3 }}>
                {/* Theme */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1rem' }}>
                        Theme
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant={userPreferences.theme === 'light' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => handleThemeChange('light')}
                            sx={{
                                minWidth: 'auto',
                                px: 2,
                                fontSize: '0.8rem',
                                textTransform: 'none'
                            }}
                        >
                            Light
                        </Button>
                        <Button
                            variant={userPreferences.theme === 'dark' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => handleThemeChange('dark')}
                            sx={{
                                minWidth: 'auto',
                                px: 2,
                                fontSize: '0.8rem',
                                textTransform: 'none'
                            }}
                        >
                            Dark
                        </Button>
                        <Button
                            variant={userPreferences.theme === 'auto' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => handleThemeChange('auto')}
                            sx={{
                                minWidth: 'auto',
                                px: 2,
                                fontSize: '0.8rem',
                                textTransform: 'none'
                            }}
                        >
                            System Default
                        </Button>
                    </Box>
                </Box>

                {/* First Cycle Name */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1rem' }}>
                        Cycle Configuration
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="First Cycle Name"
                                size="small"
                                value={userPreferences.firstCycleName}
                                onChange={e => onSavePreferences({ ...userPreferences, firstCycleName: e.target.value })}
                                helperText="The name of the primary cycle to be processed (e.g., 'primary', 'first', 'main')"
                                sx={{
                                    '& .MuiInputLabel-root': { fontSize: '0.8rem' },
                                    '& .MuiOutlinedInput-input': { fontSize: '0.85rem' },
                                    '& .MuiFormHelperText-root': { fontSize: '0.75rem' }
                                }}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* Distribution & Picking */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1rem' }}>
                        Distribution & Picking
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Maximum precentage of booklet selection for moderation per evaluator"
                                type="number"
                                size="small"
                                value={userPreferences.maxBookletsPerEvaluator}
                                onChange={e => handleMaxBookletsChange(Number(e.target.value))}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    sx: { fontSize: '0.85rem' }
                                }}
                                inputProps={{
                                    min: 1,
                                    max: 100
                                }}
                                sx={{
                                    '& .MuiInputLabel-root': { fontSize: '0.8rem' },
                                    '& .MuiOutlinedInput-input': { fontSize: '0.85rem' }
                                }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="Top %"
                                type="number"
                                size="small"
                                value={userPreferences.topCategory}
                                onChange={e => handleDistributionChange('topCategory', Number(e.target.value))}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    sx: { fontSize: '0.85rem' }
                                }}
                                sx={{
                                    '& .MuiInputLabel-root': { fontSize: '0.8rem' },
                                    '& .MuiOutlinedInput-input': { fontSize: '0.85rem' }
                                }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="Middle %"
                                type="number"
                                size="small"
                                value={userPreferences.middleCategory}
                                onChange={e => handleDistributionChange('middleCategory', Number(e.target.value))}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    sx: { fontSize: '0.85rem' }
                                }}
                                sx={{
                                    '& .MuiInputLabel-root': { fontSize: '0.8rem' },
                                    '& .MuiOutlinedInput-input': { fontSize: '0.85rem' }
                                }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="Bottom %"
                                type="number"
                                size="small"
                                value={userPreferences.bottomCategory}
                                onChange={e => handleDistributionChange('bottomCategory', Number(e.target.value))}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    sx: { fontSize: '0.85rem' }
                                }}
                                sx={{
                                    '& .MuiInputLabel-root': { fontSize: '0.8rem' },
                                    '& .MuiOutlinedInput-input': { fontSize: '0.85rem' }
                                }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="Pick Top %"
                                type="number"
                                size="small"
                                value={userPreferences.pickTop}
                                onChange={e => handlePickingChange('pickTop', Number(e.target.value))}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    sx: { fontSize: '0.85rem' }
                                }}
                                sx={{
                                    '& .MuiInputLabel-root': { fontSize: '0.8rem' },
                                    '& .MuiOutlinedInput-input': { fontSize: '0.85rem' }
                                }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="Pick Middle %"
                                type="number"
                                size="small"
                                value={userPreferences.pickMiddle}
                                onChange={e => handlePickingChange('pickMiddle', Number(e.target.value))}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    sx: { fontSize: '0.85rem' }
                                }}
                                sx={{
                                    '& .MuiInputLabel-root': { fontSize: '0.8rem' },
                                    '& .MuiOutlinedInput-input': { fontSize: '0.85rem' }
                                }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="Pick Bottom %"
                                type="number"
                                size="small"
                                value={userPreferences.pickBottom}
                                onChange={e => handlePickingChange('pickBottom', Number(e.target.value))}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    sx: { fontSize: '0.85rem' }
                                }}
                                sx={{
                                    '& .MuiInputLabel-root': { fontSize: '0.8rem' },
                                    '& .MuiOutlinedInput-input': { fontSize: '0.85rem' }
                                }}
                            />
                        </Grid>
                        {distributionError && (
                            <Typography color="error" variant="body2" sx={{ mt: 1, ml: 1 }}>
                                {distributionError}
                            </Typography>
                        )}
                        {pickingError && (
                            <Typography color="error" variant="body2" sx={{ mt: 1, ml: 1 }}>
                                {pickingError}
                            </Typography>
                        )}
                    </Grid>
                </Box>

                {/* Output File Options */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1rem' }}>
                        Output File Options
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    size="small"
                                    checked={userPreferences.generateSchedule}
                                    onChange={e => handleOutputChange('generateSchedule', e.target.checked)}
                                />
                            }
                            label="Generate schedule-wise file(s)"
                            sx={{
                                '& .MuiFormControlLabel-label': { fontSize: '0.9rem' }
                            }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    size="small"
                                    checked={userPreferences.generateBulk}
                                    onChange={e => handleOutputChange('generateBulk', e.target.checked)}
                                />
                            }
                            label="Generate Bulk file"
                            sx={{
                                '& .MuiFormControlLabel-label': { fontSize: '0.9rem' }
                            }}
                        />
                    </Box>
                </Box>

                {/* File Saving Options */}
                <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1rem' }}>
                        File Saving Options
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    size="small"
                                    checked={userPreferences.saveToSameLocation}
                                    onChange={e => handleSaveToSameLocationChange(e.target.checked)}
                                />
                            }
                            label="Save output files in same location as input files"
                            sx={{
                                '& .MuiFormControlLabel-label': { fontSize: '0.9rem' }
                            }}
                        />
                    </Box>
                </Box>
            </DialogContent>
            <Divider sx={{ mx: 2 }} />
            <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
                <FormControlLabel
                    control={
                        <Switch
                            size="small"
                            checked={userPreferences.autoSave}
                            onChange={(e) => handleAutoSaveChange(e.target.checked)}
                        />
                    }
                    label={UI_TEXT.AUTO_SAVE}
                    sx={{
                        '& .MuiFormControlLabel-label': { fontSize: '0.85rem' }
                    }}
                />
                <Button
                    variant="contained"
                    onClick={onClose}
                    sx={{
                        fontSize: '0.85rem',
                        textTransform: 'none',
                        px: 3,
                        py: 1
                    }}
                >
                    {UI_TEXT.CLOSE}
                </Button>
            </DialogActions>
        </Dialog>
    )
} 