"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Interface defining the shape of our settings
export interface Settings {
  stimuliCount: number
  anglesPerQuadrant: number
  correctQuadrant: number
  useCorrectQuadrant: boolean
  degreeVariance: number
}

// Interface defining the shape of our context
interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
}

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// SettingsProvider component: Provides global settings context
export function SettingsProvider({ children }: { children: ReactNode }) {
  // Initialize settings with default values or values from localStorage
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("dementiaTestSettings")
      return savedSettings
        ? JSON.parse(savedSettings)
        : {
            stimuliCount: 3,
            anglesPerQuadrant: 1,
            correctQuadrant: 1,
            useCorrectQuadrant: false,
            degreeVariance: 10,
          }
    }
    return {
      stimuliCount: 3,
      anglesPerQuadrant: 1,
      correctQuadrant: 1,
      useCorrectQuadrant: false,
      degreeVariance: 10,
    }
  })

  // Function to update settings
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prevSettings) => {
      const updatedSettings = { ...prevSettings, ...newSettings }
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

