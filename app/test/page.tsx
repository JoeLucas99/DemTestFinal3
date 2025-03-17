/**
 * Test Page Component
 * 
 * This file implements the main test interface for the dementia test application.
 * It handles the presentation of angle stimuli, user interaction, timing,
 * and result collection. The test is designed to assess spatial awareness
 * and angle recognition abilities.
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import LineCanvas from "../../components/LineCanvas"
import { Button } from "../../components/ui/button"
import { useSettings, SettingsProvider } from "../../contexts/SettingsContext"
import type { Settings } from "../../contexts/SettingsContext"
import { useFullscreen } from "../../hooks/useFullscreen"

/**
 * Stimulus interface defines the structure of a single test item.
 * Each stimulus consists of a target angle and a set of options to choose from.
 */
interface Stimulus {
  targetAngle: number    // The correct angle to identify
  options: number[]      // Array of angles to choose from
}

/**
 * Determines the category of an angle (acute, obtuse, or right).
 * This is used to ensure generated angles maintain consistent characteristics.
 * 
 * @param angle - The angle to categorize
 * @returns The category of the angle
 */
function getAngleCategory(angle: number): "acute" | "obtuse" | "right" {
  // Normalize angle to 0-180 range
  const normalizedAngle = angle % 180

  if (normalizedAngle === 90) return "right"
  if (normalizedAngle < 90) return "acute"
  return "obtuse"
}

/**
 * Generates a list of possible angles that could be used as options,
 * based on the target angle's category and allowed variance.
 * 
 * @param targetAngle - The correct angle to match
 * @param degreeVariance - Maximum allowed difference from target
 * @param category - The category of the target angle
 * @returns Array of possible angles to use as options
 */
function getPossibleAngles(
  targetAngle: number,
  degreeVariance: number,
  category: "acute" | "obtuse" | "right",
): number[] {
  const possibleAngles: number[] = []

  // Define the range based on category
  let minAngle = 0
  let maxAngle = 0

  if (category === "acute") {
    minAngle = 0
    maxAngle = 80
  } else if (category === "obtuse") {
    minAngle = 100
    maxAngle = 180
  } else {
    // right
    minAngle = 80
    maxAngle = 100
  }

  // Generate all possible angles within the category and variance
  for (let angle = minAngle; angle <= maxAngle; angle += 10) {
    // Skip the target angle
    if (angle === targetAngle) continue

    // Check if the angle is within the variance
    if (Math.abs(angle - targetAngle) <= degreeVariance) {
      possibleAngles.push(angle)
    }
  }

  return possibleAngles
}

/**
 * Normalizes an angle to the 0-360 degree range.
 * This ensures consistent angle representation throughout the application.
 * 
 * @param angle - The angle to normalize
 * @returns The normalized angle
 */
function normalizeAngle(angle: number): number {
  // Ensure angle is between 0 and 360
  return ((angle % 360) + 360) % 360
}

/**
 * Generates the complete set of stimuli for the test based on current settings.
 * This function creates a balanced set of options for each stimulus while
 * maintaining the specified constraints (variance, quadrant placement, etc.).
 * 
 * @param settings - Current test settings
 * @returns Array of stimuli with target angles and options
 */
function generateStimuli(settings: Settings): Stimulus[] {
  const { stimuliCount, anglesPerQuadrant, correctQuadrant, useCorrectQuadrant, degreeVariance, targetAngles } =
    settings

  console.log("Generating stimuli with settings:", settings)

  return Array.from({ length: stimuliCount }, (_, stimulusIndex) => {
    // Use the target angle from settings, ensuring it's within 0-360 range
    const targetAngle = normalizeAngle(targetAngles[stimulusIndex] || Math.floor(Math.random() * 36) * 10)
    const targetCategory = getAngleCategory(targetAngle)

    // Total number of angles needed
    const totalAnglesNeeded = anglesPerQuadrant * 4
    console.log(`Stimulus ${stimulusIndex}: Target angle ${targetAngle}, need ${totalAnglesNeeded} total angles`)

    // Start with the target angle
    let options: number[] = [targetAngle]

    // Generate angles in a chain, where each new angle is within the degree variation
    while (options.length < totalAnglesNeeded) {
      // Pick a random angle from the existing options to branch from
      const baseAngle = options[Math.floor(Math.random() * options.length)]

      // Calculate the new angle with exact variance
      const direction = Math.random() > 0.5 ? 1 : -1
      let newAngle = baseAngle + direction * degreeVariance
      newAngle = normalizeAngle(newAngle)

      // Ensure the angle is within the same category
      if (targetCategory === "acute") {
        newAngle = Math.max(0, Math.min(80, newAngle))
      } else if (targetCategory === "obtuse") {
        newAngle = Math.max(100, Math.min(180, newAngle))
      } else {
        // right
        newAngle = Math.max(80, Math.min(100, newAngle))
      }

      options.push(newAngle)
    }

    // Ensure exactly one correct angle
    const correctCount = options.filter((angle) => angle === targetAngle).length
    if (correctCount > 1) {
      // Remove excess correct angles and replace with new options
      for (let i = 0; i < correctCount - 1; i++) {
        const index = options.findIndex((angle) => angle === targetAngle)
        if (index > 0) {
          options.splice(index, 1)
          const baseAngle = options[Math.floor(Math.random() * options.length)]
          const direction = Math.random() > 0.5 ? 1 : -1
          let newAngle = baseAngle + direction * degreeVariance
          newAngle = normalizeAngle(newAngle)

          // Ensure it's not the target angle
          if (Math.abs(newAngle - targetAngle) < 1) {
            newAngle = normalizeAngle(targetAngle + degreeVariance * (direction === 1 ? 1 : -1))
          }

          // Apply category constraints
          if (targetCategory === "acute") {
            newAngle = Math.max(0, Math.min(80, newAngle))
          } else if (targetCategory === "obtuse") {
            newAngle = Math.max(100, Math.min(180, newAngle))
          } else {
            newAngle = Math.max(80, Math.min(100, newAngle))
          }

          options.push(newAngle)
        }
      }
    }

    // Shuffle the options
    options = options.sort(() => Math.random() - 0.5)

    // Handle quadrant placement if enabled
    if (useCorrectQuadrant) {
      const quadrantSize = anglesPerQuadrant
      const targetQuadrantStart = (correctQuadrant - 1) * quadrantSize
      const targetQuadrantEnd = targetQuadrantStart + quadrantSize
      const targetIndex = options.indexOf(targetAngle)

      if (targetIndex < targetQuadrantStart || targetIndex >= targetQuadrantEnd) {
        const randomIndexInCorrectQuadrant = targetQuadrantStart + Math.floor(Math.random() * quadrantSize)
        ;[options[targetIndex], options[randomIndexInCorrectQuadrant]] = [
          options[randomIndexInCorrectQuadrant],
          options[targetIndex],
        ]
      }
    }

    return { targetAngle, options }
  })
}

/**
 * Main Test Component
 * 
 * This component manages the test interface, including:
 * - Displaying stimuli
 * - Handling user input
 * - Timing responses
 * - Collecting results
 * - Managing fullscreen mode
 * - Handling responsive layout
 */
export default function Test() {
  // State management for test progress and results
  const { settings } = useSettings()
  const [stimuli, setStimuli] = useState<Stimulus[]>(() => generateStimuli(settings))
  const [currentStimulusIndex, setCurrentStimulusIndex] = useState(-1)
  const [selectedAngle, setSelectedAngle] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [results, setResults] = useState<Array<{ stimulusIndex: number; selectedAngle: number; time: number }>>([])
  const router = useRouter()
  
  // UI state management
  const [canvasSize, setCanvasSize] = useState(400)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)
  const { toggleFullscreen } = useFullscreen()

  // Effect to detect mobile device and screen orientation
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
      setIsLandscape(window.innerWidth > window.innerHeight)
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  // Start timing when a new stimulus is shown
  useEffect(() => {
    if (currentStimulusIndex >= 0) {
      setStartTime(Date.now())
      setSelectedAngle(null)
    }
  }, [currentStimulusIndex])

  // Handle window resizing and orientation changes
  useEffect(() => {
    const handleResize = () => {
      const isLandscape = window.innerWidth > window.innerHeight
      setIsLandscape(isLandscape)
      setCanvasSize(Math.min(isLandscape ? window.innerHeight - 100 : window.innerWidth - 30, 650))
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Prevent text selection and context menu during test
  useEffect(() => {
    const disableSelection = (e: Event) => e.preventDefault()
    const disableContextMenu = (e: Event) => e.preventDefault()

    document.addEventListener("selectstart", disableSelection)
    document.addEventListener("contextmenu", disableContextMenu)

    return () => {
      document.removeEventListener("selectstart", disableSelection)
      document.removeEventListener("contextmenu", disableContextMenu)
    }
  }, [])

  /**
   * Handles user selection of an angle.
   * Records the selection, timing, and correctness of the response.
   * 
   * @param angle - The angle selected by the user
   */
  const handleSelection = useCallback(
    (angle: number) => {
      if (startTime === null) return // Early return if startTime is not set
      
      const timeTaken = Date.now() - startTime
      setSelectedAngle(angle)
      setResults((prevResults) => [
        ...prevResults,
        {
          stimulusIndex: currentStimulusIndex,
          selectedAngle: angle,
          time: timeTaken,
        },
      ])

      // Move to next stimulus or end test
      if (currentStimulusIndex < stimuli.length - 1) {
        setCurrentStimulusIndex((prev) => prev + 1)
      } else {
        // Store results and navigate to results page
        sessionStorage.setItem("testResults", JSON.stringify(results))
        router.push("/results")
      }
    },
    [currentStimulusIndex, selectedAngle, startTime, stimuli, router, results]
  )

  /**
   * Handles the start of the test.
   * Initializes the first stimulus and handles fullscreen mode.
   */
  const handleStart = () => {
    if (isMobile && !isFullscreen) {
      setShowFullscreenPrompt(true)
    } else {
      setCurrentStimulusIndex(0)
    }
  }

  /**
   * Handles the fullscreen prompt response.
   * If user agrees, enters fullscreen mode and starts test.
   */
  const handleFullscreenPrompt = async () => {
    setShowFullscreenPrompt(false)
    if (isMobile) {
      await toggleFullscreen()
    }
    setCurrentStimulusIndex(0)
  }

  /**
   * Handles skipping the fullscreen prompt.
   * Starts the test without entering fullscreen mode.
   */
  const handleSkipFullscreen = () => {
    setShowFullscreenPrompt(false)
    setCurrentStimulusIndex(0)
  }

  // Render the test interface
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {currentStimulusIndex === -1 ? (
        // Initial screen with start button
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-8">Angle Recognition Test</h1>
          <p className="text-xl mb-8">
            You will be shown a series of angles. Select the angle that matches the target angle.
          </p>
          <Button onClick={handleStart} className="text-xl py-3 px-6 bg-black text-white hover:bg-gray-800">
            Start Test
          </Button>
        </div>
      ) : (
        // Test interface
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">
              Stimulus {currentStimulusIndex + 1} of {stimuli.length}
            </h2>
            <Button onClick={toggleFullscreen} className="text-lg py-2 px-4">
              {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            </Button>
          </div>

          <LineCanvas
            angles={stimuli[currentStimulusIndex].options}
            targetAngle={stimuli[currentStimulusIndex].targetAngle}
            selectedAngle={selectedAngle}
            onSelect={handleSelection}
            size={canvasSize}
            disabled={selectedAngle !== null}
          />
        </div>
      )}

      {/* Fullscreen prompt modal */}
      {showFullscreenPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold mb-4">Enter Fullscreen Mode</h2>
            <p className="mb-6">
              For the best experience on mobile devices, please enter fullscreen mode.
            </p>
            <div className="flex gap-4">
              <Button onClick={handleFullscreenPrompt} className="bg-black text-white">
                Enter Fullscreen
              </Button>
              <Button onClick={handleSkipFullscreen} variant="outline">
                Skip
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

