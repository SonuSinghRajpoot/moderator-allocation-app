import React, { useState } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    Paper,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
    PersonAdd,
    Close,
    CheckCircle,
    Email,
} from '@mui/icons-material'

interface AlternateModeratorDialogProps {
    open: boolean
    fileName: string
    onResolve: (moderatorId: string) => void
    onClose: () => void
}

export const AlternateModeratorDialog: React.FC<AlternateModeratorDialogProps> = ({
    open,
    fileName,
    onResolve,
    onClose,
}) => {
    const theme = useTheme()
    const [moderatorId, setModeratorId] = useState('')
    const [isValid, setIsValid] = useState(false)

    const handleInputChange = (value: string) => {
        setModeratorId(value)
        setIsValid(value.trim().length > 0 && value.includes('@'))
    }

    const handleSubmit = () => {
        if (isValid) {
            onResolve(moderatorId.trim())
            onClose()
            setModeratorId('')
            setIsValid(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isValid) {
            handleSubmit()
        }
    }

    const handleClose = () => {
        onClose()
        setModeratorId('')
        setIsValid(false)
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            disableAutoFocus
            disableEnforceFocus
            disableRestoreFocus
            keepMounted
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
                        background: 'linear-gradient(90deg, #22c55e, #10b981)',
                    }
                }
            }}
        >
            {/* Close Button */}
            <IconButton
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    zIndex: 1,
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    background: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.05)',
                    color: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(0, 0, 0, 0.6)',
                    '&:hover': {
                        background: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.2)'
                            : 'rgba(0, 0, 0, 0.1)',
                        color: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 1)'
                            : 'rgba(0, 0, 0, 0.8)',
                        transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease-in-out'
                }}
            >
                <Close />
            </IconButton>

            <DialogTitle sx={{ 
                pt: 4, 
                pb: 2,
                px: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #22c55e, #10b981)',
                    boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)',
                    flexShrink: 0
                }}>
                    <PersonAdd sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Box>
                    <Typography variant="h5" sx={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #22c55e 0%, #10b981 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 0.5
                    }}>
                        Assign Alternate Moderator
                    </Typography>
                    <Typography variant="body2" sx={{ 
                        color: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.9)'
                            : 'text.secondary',
                        fontWeight: 500
                    }}>
                        Enter the email ID of the new moderator
                    </Typography>
                    <Typography variant="body2" sx={{ 
                        color: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.8)'
                            : 'text.secondary',
                        fontWeight: 400,
                        fontSize: '0.8rem',
                        fontStyle: 'italic'
                    }}>
                        Processing: {fileName}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pb: 2 }}>
                <Paper sx={{
                    p: 2.5,
                    borderRadius: 2,
                    background: 'rgba(34, 197, 94, 0.05)',
                    border: '1px solid rgba(34, 197, 94, 0.1)',
                    mb: 3
                }}>
                    <Typography variant="body1" sx={{ 
                        mb: 2,
                        lineHeight: 1.6,
                        color: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.95)'
                            : 'text.primary'
                    }}>
                        Please provide the email address of the moderator who will review the selected booklets.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email sx={{ fontSize: 20, color: 'rgba(34, 197, 94, 0.8)' }} />
                        <Typography variant="body2" sx={{ 
                            color: theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.8)'
                                : 'text.secondary'
                        }}>
                            Enter a valid email address
                        </Typography>
                    </Box>
                </Paper>

                <TextField
                    autoFocus
                    margin="dense"
                    label="Moderator Email ID"
                    type="email"
                    fullWidth
                    size="medium"
                    variant="outlined"
                    value={moderatorId}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    error={moderatorId.length > 0 && !isValid}
                    helperText={moderatorId.length > 0 && !isValid ? "Please enter a valid email address" : ""}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            fontSize: '1rem',
                            '& fieldset': {
                                borderColor: 'rgba(34, 197, 94, 0.2)',
                                borderWidth: 2,
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(34, 197, 94, 0.4)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'rgba(34, 197, 94, 0.6)',
                            },
                            '&.Mui-error fieldset': {
                                borderColor: 'rgba(244, 67, 54, 0.4)',
                            }
                        },
                        '& .MuiInputLabel-root': { 
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.8)'
                                : 'rgba(0, 0, 0, 0.7)'
                        },
                        '& .MuiOutlinedInput-input': { 
                            fontSize: '1rem',
                            fontWeight: 500
                        },
                        '& .MuiFormHelperText-root': {
                            fontSize: '0.85rem',
                            fontWeight: 500
                        }
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ 
                gap: 1.5, 
                p: 3,
                pt: 0
            }}>
                <Button 
                    onClick={handleClose}
                    variant="outlined"
                    sx={{
                        py: 1.5,
                        px: 3,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderWidth: 2,
                        borderColor: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.3)'
                            : 'rgba(0, 0, 0, 0.2)',
                        color: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.9)'
                            : 'rgba(0, 0, 0, 0.7)',
                        '&:hover': {
                            borderColor: theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.5)'
                                : 'rgba(0, 0, 0, 0.4)',
                            background: theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(0, 0, 0, 0.05)',
                        },
                        transition: 'all 0.3s ease-in-out'
                    }}
                >
                    Cancel
                </Button>
                
                <Button 
                    onClick={handleSubmit} 
                    variant="contained"
                    disabled={!isValid}
                    startIcon={<CheckCircle />}
                    sx={{
                        py: 1.5,
                        px: 3,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        background: isValid 
                            ? 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)'
                            : 'rgba(0, 0, 0, 0.12)',
                        boxShadow: isValid 
                            ? '0 8px 24px rgba(34, 197, 94, 0.3)'
                            : 'none',
                        color: isValid ? 'white' : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.38)'),
                        '&:hover': isValid ? {
                            background: 'linear-gradient(135deg, #1ea34e 0%, #0d9488 100%)',
                            boxShadow: '0 12px 32px rgba(34, 197, 94, 0.4)',
                            transform: 'translateY(-2px)',
                        } : {},
                        '&:disabled': {
                            background: theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(0, 0, 0, 0.12)',
                            color: theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.4)'
                                : 'rgba(0, 0, 0, 0.38)',
                            transform: 'none',
                            boxShadow: 'none'
                        },
                        transition: 'all 0.3s ease-in-out'
                    }}
                >
                    Assign Moderator
                </Button>
            </DialogActions>
        </Dialog>
    )
} 