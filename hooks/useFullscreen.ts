"use client"

import { useState, useCallback, useEffect } from "react"

// Custom hook for managing fullscreen functionality
export function useFullscreen() {
  // State to track fullscreen status
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Function to toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }, [])

  // Effect to update fullscreen state when it changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  return { isFullscreen, toggleFullscreen }
}

