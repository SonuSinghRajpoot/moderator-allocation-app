import { useState, useEffect } from 'react'
import { UserPreferences } from '../types'
import { DEFAULT_USER_PREFERENCES, STORAGE_KEYS } from '../constants'

export const useUserPreferences = () => {
    const [userPreferences, setUserPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES)

    // Load preferences from localStorage on mount
    useEffect(() => {
        const savedPreferences = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
        if (savedPreferences) {
            try {
                const parsed = JSON.parse(savedPreferences)
                setUserPreferences({
                    theme: parsed.theme || DEFAULT_USER_PREFERENCES.theme,
                    autoSave: parsed.autoSave ?? DEFAULT_USER_PREFERENCES.autoSave,
                    saveToSameLocation: parsed.saveToSameLocation ?? DEFAULT_USER_PREFERENCES.saveToSameLocation,
                    firstCycleName: parsed.firstCycleName ?? DEFAULT_USER_PREFERENCES.firstCycleName,
                    topCategory: parsed.topCategory ?? DEFAULT_USER_PREFERENCES.topCategory,
                    middleCategory: parsed.middleCategory ?? DEFAULT_USER_PREFERENCES.middleCategory,
                    bottomCategory: parsed.bottomCategory ?? DEFAULT_USER_PREFERENCES.bottomCategory,
                    pickTop: parsed.pickTop ?? DEFAULT_USER_PREFERENCES.pickTop,
                    pickMiddle: parsed.pickMiddle ?? DEFAULT_USER_PREFERENCES.pickMiddle,
                    pickBottom: parsed.pickBottom ?? DEFAULT_USER_PREFERENCES.pickBottom,
                    maxBookletsPerEvaluator: parsed.maxBookletsPerEvaluator ?? DEFAULT_USER_PREFERENCES.maxBookletsPerEvaluator,
                    generateSchedule: parsed.generateSchedule ?? DEFAULT_USER_PREFERENCES.generateSchedule,
                    generateBulk: parsed.generateBulk ?? DEFAULT_USER_PREFERENCES.generateBulk,
                })
            } catch (error) {
                console.error('Error loading user preferences:', error)
                // Keep default preferences if loading fails
            }
        }
    }, [])

    // Save preferences to localStorage
    const savePreferences = (newPreferences: UserPreferences) => {
        // Ensure at least one output option is enabled
        if (!newPreferences.generateSchedule && !newPreferences.generateBulk) {
            newPreferences.generateBulk = true
        }

        setUserPreferences(newPreferences)
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(newPreferences))
    }

    // Update specific preference
    const updatePreference = <K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
    ) => {
        const newPreferences = { ...userPreferences, [key]: value }
        savePreferences(newPreferences)
    }

    // Reset preferences to defaults
    const resetPreferences = () => {
        savePreferences(DEFAULT_USER_PREFERENCES)
    }

    return {
        userPreferences,
        savePreferences,
        updatePreference,
        resetPreferences,
    }
} 