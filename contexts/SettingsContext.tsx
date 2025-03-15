"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Interface defining the shape of our settings
export interface Settings {
  stimuliCount: number
  anglesPerQuadrant: number
  correctQuadrant: number
  useCorrectQuadrant: boolean
  degreeVariance: number
  targetAngles: number[] // Array of target angles for each stimulus
}

// Interface defining the shape of our context
interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
}

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// Initial default settings
const defaultSettings: Settings = {
  stimuliCount: 3,
  anglesPerQuadrant: 1,
  correctQuadrant: 1,
  useCorrectQuadrant: false,
  degreeVariance: 7.5,
  targetAngles: [30, 60, 120]
}

// SettingsProvider component: Provides global settings context
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  // Load settings from localStorage on client-side only
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
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dementiaTestSettings", JSON.stringify(settings))
    }
  }, [settings])

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">
      <div className="text-2xl">Loading...</div>
    </div>
  }

  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>
}

// Custom hook for using the settings context
export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

function generateStimuli(settings: Settings): Stimulus[] {
  if (!settings) {
    console.error('Settings not available')
    return []
  }

  const { stimuliCount, anglesPerQuadrant, correctQuadrant, useCorrectQuadrant, degreeVariance, targetAngles } = settings
  // Rest of your function...
}

