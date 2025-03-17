"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Interface defining the shape of our settings
// This interface describes all the configurable parameters for the test
export interface Settings {
  stimuliCount: number // Number of stimuli to present in the test
  anglesPerQuadrant: number // How many angles to show in each quadrant
  correctQuadrant: number // Which quadrant contains the correct answer (0-3)
  useCorrectQuadrant: boolean // Whether to restrict answers to a specific quadrant
  degreeVariance: number // How much variation to allow in angle options
  targetAngles: number[] // Array of target angles for each stimulus
}

// Interface defining the shape of our context
// This describes what data and functions are available through the context
interface SettingsContextType {
  settings: Settings // The current settings object
  updateSettings: (newSettings: Partial<Settings>) => void // Function to update settings
}

// Create the context with undefined as initial value
// This will be provided by the SettingsProvider component
const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// Initial default settings for the test
// These values will be used if no settings are found in localStorage
const defaultSettings: Settings = {
  stimuliCount: 3,
  anglesPerQuadrant: 1,
  correctQuadrant: 1,
  useCorrectQuadrant: false,
  degreeVariance: 7.5,
  targetAngles: [30, 60, 120]
}

// SettingsProvider component: Provides global settings context
// This component wraps the app and provides settings to all child components
export function SettingsProvider({ children }: { children: ReactNode }) {
  // State to store current settings and loading status
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  // Load settings from localStorage on client-side only
  // This effect runs once when the component mounts
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

  // Function to update settings
  // This function handles both updating state and persisting to localStorage
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

  // Effect to sync settings with localStorage
  // This ensures settings persist across page reloads
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

  // Provide the settings context to all child components
  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>
}

// Custom hook for using the settings context
// This hook provides type-safe access to settings throughout the app
export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

