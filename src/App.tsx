import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  InputAdornment,
  IconButton,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip
} from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { Brightness4, Brightness7, Settings, CloudUpload } from '@mui/icons-material'

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark')
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [userPreferences, setUserPreferences] = useState({
    theme: 'dark' as 'light' | 'dark' | 'auto',
    autoSave: true,
    topCategory: 20,
    middleCategory: 40,
    bottomCategory: 40,
    pickTop: 5,
    pickMiddle: 10,
    pickBottom: 5,
    maxBookletsPerEvaluator: 100,
    generateSchedule: true,
    generateBulk: true,
  })

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

  const theme = React.useMemo(
    () =>
      createTheme({
              palette: {
        mode,
        primary: {
          main: mode === 'dark' ? '#64b5f6' : '#3f51b5',
          light: mode === 'dark' ? '#90caf9' : '#7986cb',
          dark: mode === 'dark' ? '#1976d2' : '#303f9f',
        },
        secondary: {
          main: mode === 'dark' ? '#f48fb1' : '#ff5722',
          light: mode === 'dark' ? '#f8bbd9' : '#ff8a65',
          dark: mode === 'dark' ? '#c2185b' : '#d84315',
        },
        background: {
          default: mode === 'dark' ? '#121212' : '#f0f4f8',
          paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
        text: {
          primary: mode === 'dark' ? '#ffffff' : '#1a237e',
          secondary: mode === 'dark' ? '#b0bec5' : '#5c6bc0',
        },
      },
        components: {
                  MuiCssBaseline: {
          styleOverrides: {
            body: {
              background: mode === 'dark'
                ? 'linear-gradient(135deg, #121212 0%, #1a1a2e 100%)'
                : 'linear-gradient(135deg, #f0f4f8 0%, #e8eaf6 50%, #c5cae9 100%)',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed',
              minHeight: '100vh',
              margin: 0,
              padding: 0,
            },
            '#root': {
              background: mode === 'dark'
                ? 'linear-gradient(135deg, #121212 0%, #1a1a2e 100%)'
                : 'linear-gradient(135deg, #f0f4f8 0%, #e8eaf6 50%, #c5cae9 100%)',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed',
              minHeight: '100vh',
            },
          },
        },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 600,
              },
            },
          },
                  MuiAppBar: {
          styleOverrides: {
            root: {
              background: mode === 'dark'
                ? 'linear-gradient(90deg, #1e1e1e 0%, #2c3e50 100%)'
                : 'linear-gradient(90deg, #ffffff 0%, #e8eaf6 100%)',
              boxShadow: mode === 'dark' ? 'none' : undefined,
              borderBottom: mode === 'light' ? '1px solid #e0e0e0' : 'none',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              background: mode === 'dark'
                ? 'linear-gradient(135deg, #1e1e1e 0%, #2c3e50 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
              borderRadius: 12,
              boxShadow: mode === 'dark' ? 'none' : undefined,
            },
          },
        },
        },
      }),
    [mode],
  )

  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences')
    if (savedPreferences) {
      const parsed = JSON.parse(savedPreferences)
      setUserPreferences({
        theme: parsed.theme || 'dark',
        autoSave: parsed.autoSave ?? true,
        topCategory: parsed.topCategory ?? 20,
        middleCategory: parsed.middleCategory ?? 40,
        bottomCategory: parsed.bottomCategory ?? 40,
        pickTop: parsed.pickTop ?? 5,
        pickMiddle: parsed.pickMiddle ?? 10,
        pickBottom: parsed.pickBottom ?? 5,
        maxBookletsPerEvaluator: parsed.maxBookletsPerEvaluator ?? 100,
        generateSchedule: parsed.generateSchedule ?? true,
        generateBulk: parsed.generateBulk ?? true,
      })
      if (parsed.theme === 'light' || parsed.theme === 'dark') {
        setMode(parsed.theme)
      }
    }
  }, [])

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

  const savePreferences = (newPreferences: typeof userPreferences) => {
    // Ensure at least one output option is enabled
    if (!newPreferences.generateSchedule && !newPreferences.generateBulk) {
      newPreferences.generateBulk = true
    }
    
    setUserPreferences(newPreferences)
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences))
    if (newPreferences.theme === 'light' || newPreferences.theme === 'dark') {
      setMode(newPreferences.theme as 'light' | 'dark')
    }
  }

  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light'
    setMode(newMode)
    if (userPreferences.theme !== 'auto') {
      const newPreferences = { ...userPreferences, theme: newMode as 'light' | 'dark' | 'auto' }
      savePreferences(newPreferences)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const fileNames = Array.from(files).map(file => file.name)
      setSelectedFiles(fileNames)
    }
    // Reset the input value so the same file can be selected again
    event.target.value = ''
  }

  const handleGenerateScheduleChange = (checked: boolean) => {
    if (!checked && !generateBulk) {
      // If trying to turn off schedule and bulk is already off, turn on bulk and keep schedule off
      setGenerateBulk(true)
      setGenerateSchedule(false)
      return
    }
    setGenerateSchedule(checked)
  }

  const handleGenerateBulkChange = (checked: boolean) => {
    if (!checked && !generateSchedule) {
      // If trying to turn off bulk and schedule is already off, turn on schedule and keep bulk off
      setGenerateSchedule(true)
      setGenerateBulk(false)
      return
    }
    setGenerateBulk(checked)
  }

  // Validation effect for main form
  useEffect(() => {
    console.log('Validation triggered:', { topCategory, middleCategory, bottomCategory, pickTop, pickMiddle, pickBottom, maxBookletsPerEvaluator: userPreferences.maxBookletsPerEvaluator })
    
    // Booklet distribution validation
    if (topCategory === 0 || middleCategory === 0 || bottomCategory === 0) {
      setDistributionError('None of the fields can be zero.')
    } else if (topCategory + middleCategory + bottomCategory > 100) {
      setDistributionError('Sum of Top, Middle, and Bottom must not exceed 100.')
    } else {
      setDistributionError(null)
    }
    
    // Picking validation
    const maxPick = userPreferences.maxBookletsPerEvaluator || 100
    const pickSum = pickTop + pickMiddle + pickBottom
    console.log('Picking validation:', { pickSum, maxPick, isValid: pickSum === maxPick })
    
    if (pickSum !== maxPick) {
      setPickingError(`Sum of top pick, middle pick, and bottom pick must be exactly equal to ${maxPick}%.`)
    } else {
      setPickingError(null)
    }
  }, [topCategory, middleCategory, bottomCategory, pickTop, pickMiddle, pickBottom, userPreferences.maxBookletsPerEvaluator])

  // Note: Removed auto-adjustment logic - only validation is active

  // Check if Process Files button should be active
  const isProcessButtonActive = () => {
    // Check if at least one Excel file is selected
    const hasExcelFiles = selectedFiles.length > 0
    
    // Check if at least one output toggle is selected
    const hasOutputSelected = generateSchedule || generateBulk
    
    // Check if distribution validation passes (no errors)
    const distributionValid = !distributionError
    
    // Check if picking validation passes (no errors)
    const pickingValid = !pickingError
    
    return hasExcelFiles && hasOutputSelected && distributionValid && pickingValid
  }

  // Add validation for settings panel
  const [settingsDistributionError, setSettingsDistributionError] = useState<string | null>(null)
  const [settingsPickingError, setSettingsPickingError] = useState<string | null>(null)

  // Validation effect for settings panel
  useEffect(() => {
    console.log('Settings validation triggered:', { 
      topCategory: userPreferences.topCategory, 
      middleCategory: userPreferences.middleCategory, 
      bottomCategory: userPreferences.bottomCategory, 
      pickTop: userPreferences.pickTop, 
      pickMiddle: userPreferences.pickMiddle, 
      pickBottom: userPreferences.pickBottom, 
      maxBookletsPerEvaluator: userPreferences.maxBookletsPerEvaluator 
    })
    
    // Booklet distribution validation for settings
    if (userPreferences.topCategory === 0 || userPreferences.middleCategory === 0 || userPreferences.bottomCategory === 0) {
      setSettingsDistributionError('None of the fields can be zero.')
    } else if (userPreferences.topCategory + userPreferences.middleCategory + userPreferences.bottomCategory > 100) {
      setSettingsDistributionError('Sum of Top, Middle, and Bottom must not exceed 100.')
    } else {
      setSettingsDistributionError(null)
    }
    
    // Picking validation for settings
    const maxPick = userPreferences.maxBookletsPerEvaluator || 100
    const pickSum = userPreferences.pickTop + userPreferences.pickMiddle + userPreferences.pickBottom
    console.log('Settings picking validation:', { pickSum, maxPick, isValid: pickSum === maxPick })
    
    if (pickSum !== maxPick) {
      setSettingsPickingError(`Sum of top pick, middle pick, and bottom pick must be exactly equal to ${maxPick}%.`)
    } else {
      setSettingsPickingError(null)
    }
  }, [userPreferences.topCategory, userPreferences.middleCategory, userPreferences.bottomCategory, userPreferences.pickTop, userPreferences.pickMiddle, userPreferences.pickBottom, userPreferences.maxBookletsPerEvaluator])


  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header */}
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 600 }}>
              Moderator App
            </Typography>
            <IconButton
              onClick={() => setPreferencesOpen(true)}
              sx={{ 
                color: 'text.primary',
                mr: 1,
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }
              }}
            >
              <Settings />
            </IconButton>
            <IconButton
              onClick={toggleColorMode}
              sx={{ 
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }
              }}
            >
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
          <Paper sx={{ p: 2 }}>


            <Grid container spacing={2}>
              {/* Configure Distribution and Picking */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                      Configure Distribution and Picking
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={enableDistribution}
                          onChange={(e) => setEnableDistribution(e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: mode === 'dark' ? '#90caf9' : '#1976d2',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: mode === 'dark' ? '#90caf9' : '#1976d2',
                            },
                          }}
                        />
                      }
                      label=""
                      sx={{ marginRight: 0 }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Select top"
                        type="number"
                        value={topCategory}
                        onChange={(e) => setTopCategory(Number(e.target.value))}
                        disabled={!enableDistribution}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography
                                variant="caption"
                                sx={{
                                  color: !enableDistribution
                                    ? (theme) => theme.palette.text.disabled
                                    : (theme) => theme.palette.text.secondary,
                                  fontSize: '0.75rem',
                                }}
                              >
                                % booklets
                              </Typography>
                            </InputAdornment>
                          ),
                          sx: { fontSize: '0.9rem' }
                        }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { borderRadius: 2 },
                          '& .Mui-disabled': {
                            opacity: 0.7
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Select middle"
                        type="number"
                        value={middleCategory}
                        onChange={(e) => setMiddleCategory(Number(e.target.value))}
                        disabled={!enableDistribution}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography
                                variant="caption"
                                sx={{
                                  color: !enableDistribution
                                    ? (theme) => theme.palette.text.disabled
                                    : (theme) => theme.palette.text.secondary,
                                  fontSize: '0.75rem',
                                }}
                              >
                                % booklets
                              </Typography>
                            </InputAdornment>
                          ),
                          sx: { fontSize: '0.9rem' }
                        }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { borderRadius: 2 },
                          '& .Mui-disabled': {
                            opacity: 0.7
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Select bottom"
                        type="number"
                        value={bottomCategory}
                        onChange={(e) => setBottomCategory(Number(e.target.value))}
                        disabled={!enableDistribution}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography
                                variant="caption"
                                sx={{
                                  color: !enableDistribution
                                    ? (theme) => theme.palette.text.disabled
                                    : (theme) => theme.palette.text.secondary,
                                  fontSize: '0.75rem',
                                }}
                              >
                                % booklets
                              </Typography>
                            </InputAdornment>
                          ),
                          sx: { fontSize: '0.9rem' }
                        }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { borderRadius: 2 },
                          '& .Mui-disabled': {
                            opacity: 0.7
                          }
                        }}
                      />
                    </Grid>
                    {/* Picking Criteria fields moved here */}
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Pick from top"
                        type="number"
                        value={pickTop}
                        onChange={(e) => setPickTop(Number(e.target.value))}
                        disabled={!enableDistribution}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography
                                variant="caption"
                                sx={{
                                  color: !enableDistribution
                                    ? (theme) => theme.palette.text.disabled
                                    : (theme) => theme.palette.text.secondary,
                                  fontSize: '0.75rem',
                                }}
                              >
                                % from top
                              </Typography>
                            </InputAdornment>
                          ),
                          sx: { fontSize: '0.9rem' }
                        }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { borderRadius: 2 },
                          '& .Mui-disabled': {
                            opacity: 0.7
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Pick from middle"
                        type="number"
                        value={pickMiddle}
                        onChange={(e) => setPickMiddle(Number(e.target.value))}
                        disabled={!enableDistribution}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography
                                variant="caption"
                                sx={{
                                  color: !enableDistribution
                                    ? (theme) => theme.palette.text.disabled
                                    : (theme) => theme.palette.text.secondary,
                                  fontSize: '0.75rem',
                                }}
                              >
                                % from middle
                              </Typography>
                            </InputAdornment>
                          ),
                          sx: { fontSize: '0.9rem' }
                        }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { borderRadius: 2 },
                          '& .Mui-disabled': {
                            opacity: 0.7
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Pick from bottom"
                        type="number"
                        value={pickBottom}
                        onChange={(e) => setPickBottom(Number(e.target.value))}
                        disabled={!enableDistribution}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography
                                variant="caption"
                                sx={{
                                  color: !enableDistribution
                                    ? (theme) => theme.palette.text.disabled
                                    : (theme) => theme.palette.text.secondary,
                                  fontSize: '0.75rem',
                                }}
                              >
                                % from bottom
                              </Typography>
                            </InputAdornment>
                          ),
                          sx: { fontSize: '0.9rem' }
                        }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { borderRadius: 2 },
                          '& .Mui-disabled': {
                            opacity: 0.7
                          }
                        }}
                      />
                    </Grid>
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
                </Paper>
              </Grid>

              {/* Output File Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                        Output File
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={generateSchedule}
                            onChange={(e) => handleGenerateScheduleChange(e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: mode === 'dark' ? '#90caf9' : '#1976d2',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: mode === 'dark' ? '#90caf9' : '#1976d2',
                              },
                            }}
                          />
                        }
                        label="Generate schedule-wise file(s)"
                        sx={{ color: 'text.primary' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={generateBulk}
                            onChange={(e) => handleGenerateBulkChange(e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: mode === 'dark' ? '#90caf9' : '#1976d2',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: mode === 'dark' ? '#90caf9' : '#1976d2',
                              },
                            }}
                          />
                        }
                        label="Generate Bulk file"
                        sx={{ color: 'text.primary' }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* File Upload Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Box
                    component="label"
                                          sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'flex-start',
                        gap: 0.5,
                        minHeight: 60,
                        width: '100%',
                        border: '2px dashed',
                        borderColor: mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                        borderRadius: 2,
                        px: 1,
                        py: 0.5,
                        background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                          background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        },
                        '&:active': {
                          transform: 'scale(0.98)',
                        }
                      }}
                  >
                    <input
                      type="file"
                      hidden
                      multiple
                      accept=".xlsx"
                      onChange={handleFileUpload}
                    />
                                              {selectedFiles.length === 0 ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'center', py: 1 }}>
                            <CloudUpload sx={{ fontSize: 24, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Click to browse Excel files (.xlsx) or drag and drop
                            </Typography>
                          </Box>
                        ) : (
                          <>
                            {selectedFiles.map((file, idx) => (
                              <Chip
                                key={file + idx}
                                label={file}
                                onDelete={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))
                                }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                                sx={{ 
                                  m: 0.25,
                                  maxWidth: '100%',
                                  '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '200px'
                                  }
                                }}
                              />
                            ))}
                          </>
                        )}
                      </Box>
                </Paper>
              </Grid>

              {/* Process Files Button Section */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    disabled={!isProcessButtonActive()}
                    sx={{
                      background: isProcessButtonActive() 
                        ? (mode === 'dark' 
                            ? 'linear-gradient(45deg, #64b5f6 30%, #3f51b5 90%)'
                            : 'linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)')
                        : (mode === 'dark' 
                            ? 'linear-gradient(45deg, #424242 30%, #616161 90%)'
                            : 'linear-gradient(45deg, #e0e0e0 30%, #bdbdbd 90%)'),
                      color: 'white',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      transition: 'all 0.3s ease-in-out',
                      opacity: isProcessButtonActive() ? 1 : 0.6,
                      cursor: isProcessButtonActive() ? 'pointer' : 'not-allowed',
                      '&:hover': isProcessButtonActive() ? {
                        background: mode === 'dark' 
                          ? 'linear-gradient(45deg, #90caf9 30%, #64b5f6 90%)'
                          : 'linear-gradient(45deg, #5c6bc0 30%, #3f51b5 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: mode === 'dark' 
                          ? '0 8px 25px rgba(100, 181, 246, 0.4)'
                          : '0 8px 25px rgba(63, 81, 181, 0.4)',
                      } : {},
                      '&:active': isProcessButtonActive() ? {
                        transform: 'translateY(0px)',
                      } : {},
                      '&:disabled': {
                        transform: 'none',
                        boxShadow: 'none',
                      }
                    }}
                  >
                    Process Files
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>

        {/* User Preferences Dialog */}
        <Dialog
          open={preferencesOpen}
          onClose={() => setPreferencesOpen(false)}
          maxWidth="sm"
          fullWidth
        >
            <DialogTitle sx={{ color: 'text.primary', pb: 1, fontSize: '1.25rem', fontWeight: 700 }}>
    User Preferences
  </DialogTitle>
  <Typography variant="body2" sx={{ color: 'text.secondary', px: 3, pb: 2, fontSize: '0.8rem' }}>
    Set your preferences which will be used for the next time you launch this application.
  </Typography>
  <Divider sx={{ mx: 3, mb: 2 }} />
  <DialogContent sx={{ pt: 1, pb: 2, px: 3 }}>
    {/* Theme */}
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, fontWeight: 600, fontSize: '1rem' }}>
        Theme
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant={userPreferences.theme === 'light' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => savePreferences({ ...userPreferences, theme: 'light' })}
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
          onClick={() => savePreferences({ ...userPreferences, theme: 'dark' })}
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
          onClick={() => savePreferences({ ...userPreferences, theme: 'auto' })}
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
    {/* Distribution & Picking */}
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, fontWeight: 600, fontSize: '1rem' }}>
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
            onChange={e => {
              const value = Number(e.target.value)
              if (value > 0 && value <= 100) {
                savePreferences({ ...userPreferences, maxBookletsPerEvaluator: value })
              }
            }}
            InputProps={{ 
              endAdornment: <InputAdornment position="end" sx={{ color: 'rgba(0, 0, 0, 0.6)', opacity: 0.7 }}>%</InputAdornment>,
              sx: { fontSize: '0.9rem' }
            }}
            inputProps={{
              min: 1,
              max: 100
            }}
            sx={{ 
              '& .MuiInputLabel-root': { fontSize: '0.85rem' },
              '& .MuiOutlinedInput-input': { fontSize: '0.9rem' }
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
            onChange={e => savePreferences({ ...userPreferences, topCategory: Number(e.target.value) })}
            InputProps={{ 
              endAdornment: <InputAdornment position="end" sx={{ color: 'rgba(0, 0, 0, 0.6)', opacity: 0.7 }}>%</InputAdornment>,
              sx: { fontSize: '0.9rem' }
            }}
            sx={{ 
              '& .MuiInputLabel-root': { fontSize: '0.85rem' },
              '& .MuiOutlinedInput-input': { fontSize: '0.9rem' }
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
            onChange={e => savePreferences({ ...userPreferences, middleCategory: Number(e.target.value) })}
            InputProps={{ 
              endAdornment: <InputAdornment position="end" sx={{ color: 'rgba(0, 0, 0, 0.6)', opacity: 0.7 }}>%</InputAdornment>,
              sx: { fontSize: '0.9rem' }
            }}
            sx={{ 
              '& .MuiInputLabel-root': { fontSize: '0.85rem' },
              '& .MuiOutlinedInput-input': { fontSize: '0.9rem' }
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
            onChange={e => savePreferences({ ...userPreferences, bottomCategory: Number(e.target.value) })}
            InputProps={{ 
              endAdornment: <InputAdornment position="end" sx={{ color: 'rgba(0, 0, 0, 0.6)', opacity: 0.7 }}>%</InputAdornment>,
              sx: { fontSize: '0.9rem' }
            }}
            sx={{ 
              '& .MuiInputLabel-root': { fontSize: '0.85rem' },
              '& .MuiOutlinedInput-input': { fontSize: '0.9rem' }
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
            onChange={e => savePreferences({ ...userPreferences, pickTop: Number(e.target.value) })}
            InputProps={{ 
              endAdornment: <InputAdornment position="end" sx={{ color: 'rgba(0, 0, 0, 0.6)', opacity: 0.7 }}>%</InputAdornment>,
              sx: { fontSize: '0.9rem' }
            }}
            sx={{ 
              '& .MuiInputLabel-root': { fontSize: '0.85rem' },
              '& .MuiOutlinedInput-input': { fontSize: '0.9rem' }
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
            onChange={e => savePreferences({ ...userPreferences, pickMiddle: Number(e.target.value) })}
            InputProps={{ 
              endAdornment: <InputAdornment position="end" sx={{ color: 'rgba(0, 0, 0, 0.6)', opacity: 0.7 }}>%</InputAdornment>,
              sx: { fontSize: '0.9rem' }
            }}
            sx={{ 
              '& .MuiInputLabel-root': { fontSize: '0.85rem' },
              '& .MuiOutlinedInput-input': { fontSize: '0.9rem' }
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
            onChange={e => savePreferences({ ...userPreferences, pickBottom: Number(e.target.value) })}
            InputProps={{ 
              endAdornment: <InputAdornment position="end" sx={{ color: 'rgba(0, 0, 0, 0.6)', opacity: 0.7 }}>%</InputAdornment>,
              sx: { fontSize: '0.9rem' }
            }}
            sx={{ 
              '& .MuiInputLabel-root': { fontSize: '0.85rem' },
              '& .MuiOutlinedInput-input': { fontSize: '0.9rem' }
            }}
          />
        </Grid>
        {settingsDistributionError && (
          <Typography color="error" variant="body2" sx={{ mt: 1, ml: 1 }}>
            {settingsDistributionError}
          </Typography>
        )}
        {settingsPickingError && (
          <Typography color="error" variant="body2" sx={{ mt: 1, ml: 1 }}>
            {settingsPickingError}
          </Typography>
        )}
      </Grid>
    </Box>
    {/* Output File Options */}
    <Box>
      <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, fontWeight: 600, fontSize: '1rem' }}>
        Output File Options
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={userPreferences.generateSchedule}
              onChange={e => {
                const checked = e.target.checked
                if (!checked && !userPreferences.generateBulk) {
                  // If trying to turn off schedule and bulk is already off, turn on bulk and keep schedule off
                  savePreferences({ ...userPreferences, generateBulk: true, generateSchedule: false })
                } else {
                  savePreferences({ ...userPreferences, generateSchedule: checked })
                }
              }}
            />
          }
          label="Generate schedule-wise file(s)"
          sx={{ 
            color: 'text.primary',
            '& .MuiFormControlLabel-label': { fontSize: '0.9rem' }
          }}
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={userPreferences.generateBulk}
              onChange={e => {
                const checked = e.target.checked
                if (!checked && !userPreferences.generateSchedule) {
                  // If trying to turn off bulk and schedule is already off, turn on schedule and keep bulk off
                  savePreferences({ ...userPreferences, generateSchedule: true, generateBulk: false })
                } else {
                  savePreferences({ ...userPreferences, generateBulk: checked })
                }
              }}
            />
          }
          label="Generate Bulk file"
          sx={{ 
            color: 'text.primary',
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
          onChange={(e) => {
            const newPreferences = { 
              ...userPreferences, 
              autoSave: e.target.checked 
            }
            savePreferences(newPreferences)
          }}
        />
      }
      label="Auto Save"
      sx={{ 
        color: 'text.primary',
        '& .MuiFormControlLabel-label': { fontSize: '0.85rem' }
      }}
    />
    <Button 
      variant="contained"
      onClick={() => setPreferencesOpen(false)}
      sx={{ 
        fontSize: '0.85rem',
        textTransform: 'none',
        px: 3,
        py: 1
      }}
    >
      Close
    </Button>
  </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  )
}

export default App 