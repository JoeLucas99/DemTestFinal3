"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import LineCanvas from "../../components/LineCanvas"
import { Button } from "../../components/ui/button"
import { useSettings, SettingsProvider } from "../../contexts/SettingsContext"
import type { Settings } from "../../contexts/SettingsContext"
import { useFullscreen } from "../../hooks/useFullscreen"

// Interface for a single stimulus in the test
interface Stimulus {
  targetAngle: number
  options: number[]
}

// Helper function to determine if an angle is acute or obtuse
function getAngleCategory(angle: number): "acute" | "obtuse" | "right" {
  // Normalize angle to 0-180 range
  const normalizedAngle = angle % 180

  if (normalizedAngle === 90) return "right"
  if (normalizedAngle < 90) return "acute"
  return "obtuse"
}

// Helper function to get all possible angles in a category within variance
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

// Helper function to normalize angles to 0-360 range
function normalizeAngle(angle: number): number {
  // Ensure angle is between 0 and 360
  return ((angle % 360) + 360) % 360
}

// Function to generate stimuli based on current settings
function generateStimuli(settings: Settings): Stimulus[] {
  const { stimuliCount, anglesPerQuadrant, correctQuadrant, useCorrectQuadrant, degreeVariance, targetAngles } =
    settings

  console.log("Generating stimuli with settings:", settings)

  return Array.from({ length: stimuliCount }, (_, stimulusIndex) => {
    // Use the target angle from settings, ensuring it's within 0-360 range
    const targetAngle = normalizeAngle(targetAngles[stimulusIndex] || Math.floor(Math.random() * 36) * 10) // 0-350 degrees in steps of 10
    const targetCategory = getAngleCategory(targetAngle)

    // Total number of angles needed
    const totalAnglesNeeded = anglesPerQuadrant * 4
    console.log(`Stimulus ${stimulusIndex}: Target angle ${targetAngle}, need ${totalAnglesNeeded} total angles`)

    // Start with the target angle
    let options: number[] = [targetAngle]

    // Generate angles in a chain, where each new angle is within the degree variation of at least one existing angle
    while (options.length < totalAnglesNeeded) {
      // Pick a random angle from the existing options to branch from
      const baseAngle = options[Math.floor(Math.random() * options.length)]

      // Calculate the new angle with exact variance
      const direction = Math.random() > 0.5 ? 1 : -1

      // Apply the exact variance (not a random value between 0 and max)
      let newAngle = baseAngle + direction * degreeVariance

      // Normalize to 0-360 range
      newAngle = normalizeAngle(newAngle)

      // Ensure the angle is within the same category (acute, obtuse, right)
      if (targetCategory === "acute") {
        newAngle = Math.max(0, Math.min(80, newAngle))
      } else if (targetCategory === "obtuse") {
        newAngle = Math.max(100, Math.min(180, newAngle))
      } else {
        // right
        newAngle = Math.max(80, Math.min(100, newAngle))
      }

      // Add the new angle to options without rounding to nearest 10
      options.push(newAngle)
    }

    // Make sure there's exactly one correct angle
    const correctCount = options.filter((angle) => angle === targetAngle).length
    if (correctCount > 1) {
      // Remove excess correct angles
      for (let i = 0; i < correctCount - 1; i++) {
        const index = options.findIndex((angle) => angle === targetAngle)
        if (index > 0) {
          // Keep at least one
          options.splice(index, 1)

          // Add a new angle that's within variation of an existing angle
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
            // right
            newAngle = Math.max(80, Math.min(100, newAngle))
          }

          options.push(newAngle)
        }
      }
    }

    console.log(`Final options (${options.length}):`, options)

    // Shuffle the options
    options = options.sort(() => Math.random() - 0.5)

    // If useCorrectQuadrant is true, ensure the target angle is in the correct quadrant
    if (useCorrectQuadrant) {
      // Reorganize options to ensure target is in correct quadrant
      const quadrantSize = anglesPerQuadrant
      const targetQuadrantStart = (correctQuadrant - 1) * quadrantSize
      const targetQuadrantEnd = targetQuadrantStart + quadrantSize

      // Find the current position of the target angle
      const targetIndex = options.indexOf(targetAngle)

      // If target is not in the correct quadrant, swap it with a random angle in the correct quadrant
      if (targetIndex < targetQuadrantStart || targetIndex >= targetQuadrantEnd) {
        const randomIndexInCorrectQuadrant = targetQuadrantStart + Math.floor(Math.random() * quadrantSize)
        // Swap
        ;[options[targetIndex], options[randomIndexInCorrectQuadrant]] = [
          options[randomIndexInCorrectQuadrant],
          options[targetIndex],
        ]
      }
    }

    return { targetAngle, options }
  })
}

// Test component: Manages the test logic and UI
export default function Test() {
  const { settings } = useSettings()
  const [stimuli, setStimuli] = useState<Stimulus[]>(() => generateStimuli(settings))
  const [currentStimulusIndex, setCurrentStimulusIndex] = useState(-1)
  const [selectedAngle, setSelectedAngle] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number>(0)
  const [results, setResults] = useState<
    { correct: boolean; time: number; targetAngle: number; selectedAngle: number }[]
  >([])
  const router = useRouter()
  const [canvasSize, setCanvasSize] = useState(400)
  const [isLandscape, setIsLandscape] = useState(false)
  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false)

  // Effect to start timing when a new stimulus is shown
  useEffect(() => {
    if (currentStimulusIndex >= 0) {
      setStartTime(Date.now())
      setSelectedAngle(null)
    }
  }, [currentStimulusIndex])

  // Effect to handle window resizing and orientation changes
  useEffect(() => {
    const handleResize = () => {
      const isLandscape = window.innerWidth > window.innerHeight
      setIsLandscape(isLandscape)
      // Increase the maximum canvas size from 600 to 650
      setCanvasSize(Math.min(isLandscape ? window.innerHeight - 100 : window.innerWidth - 30, 650))
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Effect to disable text selection and context menu
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

  // Handler for when an angle is selected
  const handleSelection = useCallback(
    (angle: number) => {
      if (selectedAngle === null) {
        setSelectedAngle(angle)
        const endTime = Date.now()
        const timeTaken = endTime - startTime
        setResults((prevResults) => [
          ...prevResults,
          {
            correct: angle === stimuli[currentStimulusIndex].targetAngle,
            time: timeTaken,
            targetAngle: stimuli[currentStimulusIndex].targetAngle,
            selectedAngle: angle,
          },
        ])
      }
    },
    [selectedAngle, startTime, stimuli, currentStimulusIndex],
  )

  // Handler for moving to the next stimulus or finishing the test
  const handleNextStimulus = useCallback(() => {
    if (currentStimulusIndex < stimuli.length - 1) {
      setCurrentStimulusIndex(currentStimulusIndex + 1)
    } else {
      sessionStorage.setItem("testResults", JSON.stringify(results))
      router.push("/results")
    }
  }, [currentStimulusIndex, stimuli.length, results, router])

  // Handler for starting the test and attempting to enter fullscreen
  const handleStartTest = useCallback(() => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement
        .requestFullscreen()
        .catch((err) => {
          console.warn(`Fullscreen request failed: ${err.message}. Continuing without fullscreen.`)
          // Continue with the test even if fullscreen fails
        })
        .finally(() => {
          setShowFullscreenPrompt(false)
          setCurrentStimulusIndex(0)
        })
    } else {
      // If fullscreen is not supported, just start the test
      setShowFullscreenPrompt(false)
      setCurrentStimulusIndex(0)
    }
  }, [])

  // Effect to start the test on component mount
  useEffect(() => {
    // Delay the fullscreen request to ensure it's triggered by a user action
    const timer = setTimeout(() => {
      handleStartTest()
    }, 100)
    return () => clearTimeout(timer)
  }, [handleStartTest])

  if (stimuli.length === 0 || (currentStimulusIndex === -1 && !showFullscreenPrompt)) {
    return <div>Loading...</div>
  }

  const stimulus = stimuli[currentStimulusIndex]

  console.log("Current stimulus:", stimulus)
  console.log("Options length:", stimulus.options.length)
  console.log("Settings:", settings)

  return (
    <SettingsProvider>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 select-none">
        <div className="w-full max-w-3xl flex flex-col items-center relative">
          <div className="flex items-center justify-center w-full mb-8 relative">
            <LineCanvas
              angles={[stimulus.targetAngle]}
              targetAngle={stimulus.targetAngle}
              size={350} // Increased from 300 to give more space
              className="mr-4"
            />
            {selectedAngle !== null && (
              <div className="absolute right-[-40px] top-1/2 transform -translate-y-1/2">
                <Button
                  onClick={handleNextStimulus}
                  className="text-xl py-3 px-6 bg-black text-white hover:bg-gray-800"
                >
                  {currentStimulusIndex < stimuli.length - 1 ? "Next Stimulus" : "Finish Test"}
                </Button>
              </div>
            )}
          </div>
          <LineCanvas
            angles={stimulus.options}
            onSelect={handleSelection}
            selectedAngle={selectedAngle}
            size={canvasSize}
            disabled={selectedAngle !== null}
          />
        </div>
      </div>
    </SettingsProvider>
  )
}

