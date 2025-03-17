"use client"

import { useState, useEffect } from "react"
import { Expand, Shrink } from "lucide-react"
import { Button } from "./ui/button"

// FullscreenButton component: Toggles fullscreen mode
// This component provides a button to enter/exit fullscreen mode,
// which is particularly useful for mobile devices and test-taking
export default function FullscreenButton() {
  // State to track whether the app is currently in fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Function to toggle fullscreen mode
  // Handles both entering and exiting fullscreen, with error handling
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Request fullscreen mode
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      // Exit fullscreen mode if supported
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Effect to update fullscreen state when it changes
  // Listens for the fullscreenchange event to keep state in sync
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Render the fullscreen toggle button with appropriate icon
  // Shows different icons based on current fullscreen state
  return (
    <Button
      className="fixed top-4 left-4 z-50 bg-black text-white hover:bg-gray-800 text-xl py-3 px-6"
      onClick={toggleFullscreen}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? <Shrink className="h-6 w-6" /> : <Expand className="h-6 w-6" />}
    </Button>
  )
}

