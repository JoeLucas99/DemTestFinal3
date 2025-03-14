"use client"

import { useState, useEffect } from "react"
import { Expand, Shrink } from "lucide-react"
import { Button } from "./ui/button"

// FullscreenButton component: Toggles fullscreen mode
export default function FullscreenButton() {
  // State to track fullscreen status
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Function to toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Effect to update fullscreen state when it changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

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

