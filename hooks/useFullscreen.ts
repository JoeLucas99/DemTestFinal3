"use client"

import { useState, useCallback, useEffect } from "react"

// Custom hook for managing fullscreen functionality
// This hook provides a way to toggle fullscreen mode and track its state
export function useFullscreen() {
  // State to track whether the app is currently in fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Function to toggle fullscreen mode
  // This function handles both entering and exiting fullscreen mode
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      // Request fullscreen mode if not already in it
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      // Exit fullscreen mode if already in it
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }, [])

  // Effect to update fullscreen state when it changes
  // This ensures our state stays in sync with the actual fullscreen state
  useEffect(() => {
    // Handler to update state when fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    // Add listener for fullscreen changes
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    
    // Cleanup: remove listener when component unmounts
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Return the current fullscreen state and toggle function
  return { isFullscreen, toggleFullscreen }
}

