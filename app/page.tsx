"use client"

import Link from "next/link"
import { Button } from "../components/ui/button"
import { useEffect, useState } from "react"

// Home component: The main landing page of the application
export default function Home() {
  // State to track if the device is mobile
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

  // Handler for starting the test
  const handleStartTest = () => {
    // If on mobile, request fullscreen mode
    if (isMobile && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-6xl font-bold mb-8">Dementia Test App</h1>
      <div className="flex flex-col gap-4">
        <Link href="/test">
          <Button onClick={handleStartTest} className="text-xl py-3 px-6 bg-black text-white hover:bg-gray-800">
            Start Test
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="outline" className="text-xl py-3 px-6">
            Settings
          </Button>
        </Link>
      </div>
    </main>
  )
}

