import React from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Paper,
    Chip,
    IconButton,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
    Person,
    SwapHoriz,
    Cancel,
    Close,
    Warning,
} from '@mui/icons-material'

interface SingleEvaluatorDialogProps {
    open: boolean
    evaluator: string
    booklets: any[]
    fileName: string
    onResolve: (action: 'same' | 'different' | 'cancel' | 'different_cancelled', alternateModerator?: string) => void
    onClose: () => void
    onAlternateModerator: () => void
}

export const SingleEvaluatorDialog: React.FC<SingleEvaluatorDialogProps> = ({
    open,
    evaluator,
    booklets,
    fileName,
    onResolve,
    onClose,
    onAlternateModerator,
}) => {
    const theme = useTheme()
    
    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                    }
                }
            }}
        >
            {/* Close Button */}
            <IconButton
                onClick={onClose}
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
                    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                    boxShadow: '0 8px 24px rgba(255, 107, 107, 0.3)',
                    flexShrink: 0
                }}>
                    <Warning sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Box>
                    <Typography variant="h5" sx={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 0.5
                    }}>
                        Single Evaluator Detected
                    </Typography>
                    <Typography variant="body2" sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500
                    }}>
                        Action required for moderator assignment
                    </Typography>
                    <Typography variant="body2" sx={{ 
                        color: 'text.secondary',
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
                    background: 'rgba(102, 126, 234, 0.05)',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    mb: 3
                }}>
                    <Typography variant="body1" sx={{ 
                        mb: 2,
                        lineHeight: 1.6,
                        color: 'text.primary'
                    }}>
                        Only one evaluator was found with booklets selected for moderation.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Person sx={{ fontSize: 20, color: 'rgba(102, 126, 234, 0.8)' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {evaluator}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                            label={`${booklets.length} booklets`}
                            size="small"
                            sx={{
                                background: 'rgba(102, 126, 234, 0.1)',
                                color: 'rgba(102, 126, 234, 0.9)',
                                fontWeight: 600,
                                fontSize: '0.8rem'
                            }}
                        />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            selected for moderation
                        </Typography>
                    </Box>
                </Paper>

                <Typography variant="subtitle1" sx={{ 
                    fontWeight: 600,
                    mb: 2,
                    color: 'text.primary'
                }}>
                    Choose how to handle moderator assignment:
                </Typography>
            </DialogContent>

            <DialogActions sx={{ 
                flexDirection: 'column', 
                gap: 1.5, 
                p: 3,
                pt: 0
            }}>
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Person />}
                    onClick={() => {
                        onResolve('same')
                        onClose()
                    }}
                    sx={{
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                            boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)',
                            transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease-in-out'
                    }}
                >
                    Assign Same Evaluator as Moderator
                </Button>
                
                <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<SwapHoriz />}
                    onClick={() => {
                        onClose()
                        onAlternateModerator()
                    }}
                    sx={{
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderWidth: 2,
                        borderColor: 'rgba(102, 126, 234, 0.3)',
                        color: 'rgba(102, 126, 234, 0.9)',
                        '&:hover': {
                            borderColor: 'rgba(102, 126, 234, 0.6)',
                            background: 'rgba(102, 126, 234, 0.05)',
                            transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.3s ease-in-out'
                    }}
                >
                    Assign Different Moderator
                </Button>
                
                <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<Cancel />}
                    onClick={() => {
                        onResolve('cancel')
                        onClose()
                    }}
                    sx={{
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderWidth: 2,
                        borderColor: 'rgba(244, 67, 54, 0.3)',
                        color: 'rgba(244, 67, 54, 0.9)',
                        '&:hover': {
                            borderColor: 'rgba(244, 67, 54, 0.6)',
                            background: 'rgba(244, 67, 54, 0.05)',
                            transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.3s ease-in-out'
                    }}
                >
                    Cancel Processing
                </Button>
            </DialogActions>
        </Dialog>
    )
} 