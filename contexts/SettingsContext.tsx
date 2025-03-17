/**
 * SettingsContext.tsx
 * 
 * This file implements a global settings management system using React Context.
 * It provides a way to store and update test settings across the entire application,
 * with persistence to localStorage for maintaining settings between sessions.
 */

"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

/**
 * Settings interface defines the structure of the test configuration.
 * It includes parameters that control the test behavior and appearance.
 */
export interface Settings {
  stimuliCount: number      // Number of stimuli to present in the test
  anglesPerQuadrant: number // Number of angles to show in each quadrant
  correctQuadrant: number   // Which quadrant should contain the correct angle
  useCorrectQuadrant: boolean // Whether to enforce correct angle placement in specific quadrant
  degreeVariance: number    // Maximum allowed difference between angles
  targetAngles: number[]    // Array of target angles for each stimulus
}

/**
 * SettingsContextType defines the shape of the context object that will be provided
 * to all components that consume the settings context.
 */
interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
}

// Create the context with undefined as initial value
const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

/**
 * Default settings used when no saved settings are found in localStorage.
 * These values provide a reasonable starting point for the test.
 */
const defaultSettings: Settings = {
  stimuliCount: 3,
  anglesPerQuadrant: 1,
  correctQuadrant: 1,
  useCorrectQuadrant: false,
  degreeVariance: 7.5,
  targetAngles: [30, 60, 120]
}

/**
 * SettingsProvider component
 * 
 * This component provides the settings context to all child components.
 * It handles:
 * - Loading settings from localStorage on initial mount
 * - Updating settings and persisting changes to localStorage
 * - Managing the loading state while settings are being initialized
 * 
 * @param children - React components that will have access to the settings context
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  // State for storing current settings and loading status
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Effect hook to load settings from localStorage on component mount.
   * This ensures settings persist between page refreshes.
   */
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("dementiaTestSettings")
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        // Validate that the parsed data has the required fields
        if (parsed.stimuliCount && Array.isArray(parsed.targetAngles)) {
          setSettings(parsed)
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      // On error, fall back to default settings
      setSettings(defaultSettings)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Function to update settings
   * 
   * This function handles updating settings while maintaining data integrity:
   * - Merges new settings with existing ones
   * - Handles special cases like updating target angles when stimuli count changes
   * - Persists changes to localStorage
   * 
   * @param newSettings - Partial settings object containing only the fields to update
   */
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prevSettings: Settings) => {
      const updatedSettings = { ...prevSettings, ...newSettings }

      // If stimuliCount changes, adjust targetAngles array length
      if (newSettings.stimuliCount !== undefined && newSettings.stimuliCount !== prevSettings.stimuliCount) {
        // Generate appropriate default angles
        const newTargetAngles = Array(newSettings.stimuliCount)
          .fill(0)
          .map((_, i) => {
            // Use existing angles if available, otherwise generate random ones
            return prevSettings.targetAngles[i] || Math.floor(Math.random() * 36) * 10
          })

        updatedSettings.targetAngles = newTargetAngles
      }

      localStorage.setItem("dementiaTestSettings", JSON.stringify(updatedSettings))
      return updatedSettings
    })
  }

  /**
   * Effect hook to sync settings with localStorage whenever they change.
   * This ensures settings are always up to date in persistent storage.
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dementiaTestSettings", JSON.stringify(settings))
    }
  }, [settings])

  // Show loading state while settings are being initialized
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">
      <div className="text-2xl">Loading...</div>
    </div>
  }

  // Provide the settings context to child components
  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>
}

/**
 * Custom hook for using the settings context
 * 
 * This hook provides a convenient way to access settings from any component.
 * It includes error handling to ensure the hook is only used within a SettingsProvider.
 * 
 * @returns The settings context object containing current settings and update function
 * @throws Error if used outside of a SettingsProvider
 */
export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

