/**
 * Settings Page Component
 * 
 * This component provides a user interface for configuring test parameters:
 * - Number of stimuli to present
 * - Target angles for each stimulus
 * - Number of angles per quadrant
 * - Quadrant placement rules
 * - Degree variance for angle options
 */

"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Switch } from "../../components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { useSettings } from "../../contexts/SettingsContext"
import { useState, useEffect } from "react"

export default function Settings() {
  // Get settings and update function from context
  const { settings, updateSettings } = useSettings()
  const { stimuliCount, anglesPerQuadrant, correctQuadrant, useCorrectQuadrant, degreeVariance, targetAngles } =
    settings
  const router = useRouter()
  // Local state for managing target angle inputs
  const [localTargetAngles, setLocalTargetAngles] = useState<string[]>([])

  // Initialize local target angles from settings
  useEffect(() => {
    setLocalTargetAngles(targetAngles.map((angle) => angle.toString()))
  }, [targetAngles])

  /**
   * Handles form submission.
   * Converts local target angles to numbers and updates settings.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Convert local target angles to numbers and update settings
    const numericTargetAngles = localTargetAngles.map((angle) => Number.parseInt(angle) || 0)

    updateSettings({ targetAngles: numericTargetAngles })
    router.push("/")
  }

  /**
   * Handles changes to the degree variance setting.
   * Rounds the value to nearest 2.5 and clamps between 7.5 and 50.
   */
  const handleDegreeVarianceChange = (value: string) => {
    const numValue = Number.parseFloat(value)
    // Round to the nearest 2.5 instead of 10
    const roundedValue = Math.max(7.5, Math.min(50, Math.round(numValue / 2.5) * 2.5))
    updateSettings({ degreeVariance: roundedValue })
  }

  /**
   * Handles changes to individual target angles.
   * Clamps values between 1 and 179 degrees.
   */
  const handleTargetAngleChange = (index: number, value: string) => {
    const newAngles = [...localTargetAngles]
    // Ensure the value is within 1-179 range
    const numValue = Number(value)
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(179, Math.max(1, numValue))
      newAngles[index] = clampedValue.toString()
    } else {
      newAngles[index] = value
    }
    setLocalTargetAngles(newAngles)
  }

  /**
   * Handles changes to the number of stimuli.
   * Updates settings and triggers regeneration of target angles.
   */
  const handleStimuliCountChange = (value: number) => {
    updateSettings({ stimuliCount: value })
  }

  // Render the settings form
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-5xl font-bold mb-8">Settings</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        {/* Number of stimuli input */}
        <div>
          <Label htmlFor="stimuliCount" className="text-xl">
            Number of Stimuli
          </Label>
          <Input
            id="stimuliCount"
            type="number"
            value={stimuliCount}
            onChange={(e) => handleStimuliCountChange(Number(e.target.value))}
            min={1}
            className="text-xl py-2 px-3"
          />
        </div>

        {/* Target angles inputs */}
        <div className="space-y-3">
          <Label className="text-xl">Target Angles</Label>
          {localTargetAngles.map((angle, index) => (
            <div key={index} className="flex items-center gap-2">
              <Label htmlFor={`targetAngle-${index}`} className="text-lg min-w-[100px]">
                Stimulus {index + 1}:
              </Label>
              <Input
                id={`targetAngle-${index}`}
                type="number"
                value={angle}
                onChange={(e) => {
                  const value = Math.min(179, Math.max(1, Number(e.target.value) || 1))
                  handleTargetAngleChange(index, value.toString())
                }}
                min={1}
                max={179}
                className="text-xl py-2 px-3"
              />
              <span className="text-lg">degrees</span>
            </div>
          ))}
        </div>

        {/* Angles per quadrant input */}
        <div>
          <Label htmlFor="anglesPerQuadrant" className="text-xl">
            Angles per Quadrant
          </Label>
          <Input
            id="anglesPerQuadrant"
            type="number"
            value={anglesPerQuadrant}
            onChange={(e) => updateSettings({ anglesPerQuadrant: Math.min(Number(e.target.value), 4) })}
            min={1}
            max={4}
            className="text-xl py-2 px-3"
          />
        </div>

        {/* Quadrant placement toggle and selector */}
        <div className="flex items-center space-x-2">
          <Switch
            id="useCorrectQuadrant"
            checked={useCorrectQuadrant}
            onCheckedChange={(checked) => updateSettings({ useCorrectQuadrant: checked })}
            className="scale-150 data-[state=checked]:bg-black transition-colors duration-200"
          />
          <Label htmlFor="useCorrectQuadrant" className="text-xl ml-2">
            Use Specific Quadrant for Correct Angle
          </Label>
        </div>

        {/* Quadrant selector (shown when useCorrectQuadrant is true) */}
        {useCorrectQuadrant && (
          <div className="relative z-10">
            <Label htmlFor="correctQuadrant" className="text-xl">
              Correct Angle Quadrant
            </Label>
            <Select
              value={correctQuadrant.toString()}
              onValueChange={(value) => updateSettings({ correctQuadrant: Number(value) })}
            >
              <SelectTrigger className="text-xl py-2 px-3 w-full bg-white border border-gray-300">
                <SelectValue placeholder="Select quadrant" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 shadow-lg">
                <SelectItem value="1" className="text-xl cursor-pointer hover:bg-gray-100">
                  Top Left
                </SelectItem>
                <SelectItem value="2" className="text-xl cursor-pointer hover:bg-gray-100">
                  Top Right
                </SelectItem>
                <SelectItem value="3" className="text-xl cursor-pointer hover:bg-gray-100">
                  Bottom Left
                </SelectItem>
                <SelectItem value="4" className="text-xl cursor-pointer hover:bg-gray-100">
                  Bottom Right
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Degree variance input */}
        <div>
          <Label htmlFor="degreeVariance" className="text-xl">
            Degree Variance
          </Label>
          <Input
            id="degreeVariance"
            type="number"
            value={degreeVariance}
            onChange={(e) => handleDegreeVarianceChange(e.target.value)}
            min={7.5}
            max={50}
            step={2.5}
            className="text-xl py-2 px-3"
          />
        </div>

        {/* Save settings button */}
        <Button
          onClick={handleSubmit}
          className="w-full text-xl py-3 px-6 bg-white text-black border border-black hover:bg-gray-100"
        >
          Save Settings
        </Button>
      </form>
    </div>
  )
}

