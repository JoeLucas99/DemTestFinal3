/**
 * Home Page Component
 * 
 * This component serves as the main landing page of the application.
 * It provides:
 * - Application title
 * - Navigation buttons to start test or access settings
 * - Mobile device detection for fullscreen handling
 */

"use client"

import Link from "next/link"
import { Button } from "../components/ui/button"
import { useEffect, useState } from "react"

// Home component: The main landing page of the application
export default function Home() {
  // State to track if the device is mobile for responsive behavior
  const [isMobile, setIsMobile] = useState(false)

  // Effect to check and update mobile status on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  /**
   * Handles starting the test.
   * On mobile devices, attempts to enter fullscreen mode for better UX.
   */
  const handleStartTest = () => {
    // If on mobile, request fullscreen mode
    if (isMobile && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    }
  }

  // Render the home page interface
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {/* Application title */}
      <h1 className="text-6xl font-bold mb-8">Dementia Test App</h1>
      {/* Navigation buttons */}
      <div className="flex flex-col gap-4">
        {/* Start Test button - triggers fullscreen on mobile */}
        <Link href="/test">
          <Button onClick={handleStartTest} className="text-xl py-3 px-6 bg-black text-white hover:bg-gray-800">
            Start Test
          </Button>
        </Link>
        {/* Settings button */}
        <Link href="/settings">
          <Button variant="outline" className="text-xl py-3 px-6">
            Settings
          </Button>
        </Link>
      </div>
    </main>
  )
}

