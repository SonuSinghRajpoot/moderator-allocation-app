import { useState } from 'react'
import { SnackbarState } from '../types'

export const useSnackbar = () => {
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'error'
    })

    // Show error message
    const showError = (message: string) => {
        setSnackbar({
            open: true,
            message,
            severity: 'error'
        })
    }

    // Show success message
    const showSuccess = (message: string) => {
        setSnackbar({
            open: true,
            message,
            severity: 'success'
        })
    }

    // Show warning message
    const showWarning = (message: string) => {
        setSnackbar({
            open: true,
            message,
            severity: 'warning'
        })
    }

    // Show info message
    const showInfo = (message: string) => {
        setSnackbar({
            open: true,
            message,
            severity: 'info'
        })
    }

    // Close snackbar
    const closeSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }))
    }

    return {
        snackbar,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        closeSnackbar,
    }
} 