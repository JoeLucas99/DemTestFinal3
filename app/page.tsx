"use client"

import Link from "next/link"
import { Button } from "../components/ui/button"
import { useEffect, useState } from "react"

// Main landing page component for the Dementia Test App
export default function Home() {
  // State to track if the device is mobile (width <= 768px)
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

  // Handler for starting the test - requests fullscreen on mobile devices
  const handleStartTest = () => {
    // If on mobile, request fullscreen mode for better test experience
    if (isMobile && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {/* Main title */}
      <h1 className="text-6xl font-bold mb-8">Dementia Test App</h1>
      {/* Navigation buttons */}
      <div className="flex flex-col gap-4">
        {/* Start Test button - navigates to /test */}
        <Link href="/test">
          <Button onClick={handleStartTest} className="text-xl py-3 px-6 bg-black text-white hover:bg-gray-800">
            Start Test
          </Button>
        </Link>
        {/* Settings button - navigates to /settings */}
        <Link href="/settings">
          <Button variant="outline" className="text-xl py-3 px-6">
            Settings
          </Button>
        </Link>
      </div>
    </main>
  )
}

