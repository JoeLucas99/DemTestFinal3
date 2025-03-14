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

// Function to generate stimuli based on current settings
function generateStimuli(settings: Settings): Stimulus[] {
  const { stimuliCount, anglesPerQuadrant, correctQuadrant, useCorrectQuadrant } = settings
  return Array.from({ length: stimuliCount }, () => {
    const targetAngle = Math.floor(Math.random() * 18) * 10 // Ensure target angle is a multiple of 10

    // Generate options for each quadrant
    const quadrants = [0, 1, 2, 3].map((quadrantIndex) => {
      const quadrantAngles: number[] = []
      const quadrantStart = quadrantIndex * 90 // Each quadrant is 90 degrees

      // Always include the target angle in the correct quadrant if useCorrectQuadrant is true
      if (useCorrectQuadrant && quadrantIndex === correctQuadrant - 1) {
        quadrantAngles.push(targetAngle)
      }

      // Fill the rest of the quadrant with angles
      while (quadrantAngles.length < anglesPerQuadrant) {
        let newAngle: number
        let attempts = 0
        const maxAttempts = 100 // Prevent infinite loop

        do {
          newAngle = Math.floor(Math.random() * 90) + quadrantStart // Angle within the quadrant
          newAngle = Math.round(newAngle / 10) * 10 // Round to nearest 10
          attempts++
        } while (
          (quadrantAngles.includes(newAngle) ||
            newAngle === targetAngle ||
            quadrantAngles.some((angle) => Math.abs(angle - newAngle) < 20)) &&
          attempts < maxAttempts
        )

        if (attempts < maxAttempts) {
          quadrantAngles.push(newAngle)
        }
      }

      return quadrantAngles
    })

    // Flatten the quadrants into a single array of options
    let options = quadrants.flat()

    // If the target angle is not included, replace a random angle with it
    if (!options.includes(targetAngle)) {
      const randomIndex = Math.floor(Math.random() * options.length)
      options[randomIndex] = targetAngle
    }

    // Remove any duplicates of the target angle
    options = options.map((angle) => (angle === targetAngle ? targetAngle : angle))
    options = [...new Set(options)]

    // If we removed duplicates, add new unique angles to maintain the correct number of options
    while (options.length < anglesPerQuadrant * 4) {
      let newAngle: number
      do {
        newAngle = Math.floor(Math.random() * 360)
        newAngle = Math.round(newAngle / 10) * 10 // Round to nearest 10
      } while (
        options.includes(newAngle) ||
        newAngle === targetAngle ||
        options.some((angle) => Math.abs(angle - newAngle) < 20)
      )
      options.push(newAngle)
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
      setCanvasSize(Math.min(isLandscape ? window.innerHeight - 100 : window.innerWidth - 32, 800))
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

  return (
    <SettingsProvider>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 select-none">
        <div className="w-full max-w-4xl flex flex-col items-center relative">
          <div className="flex items-center justify-center w-full mb-8 relative">
            <LineCanvas
              angles={[stimulus.targetAngle]}
              targetAngle={stimulus.targetAngle}
              size={400}
              className="mr-4"
            />
            {selectedAngle !== null && (
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
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

