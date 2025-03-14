"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"

// Props interface for the LineCanvas component
interface LineCanvasProps {
  angles: number[]
  targetAngle?: number
  onSelect?: (angle: number) => void
  selectedAngle?: number | null
  className?: string
  size?: number
  disabled?: boolean
}

// Interface for a single line in the canvas
interface Line {
  angle: number
  id: string
  quadrant: number
  position: { x: number; y: number }
}

// LineCanvas component: Renders angles as lines on a canvas
export default function LineCanvas({
  angles,
  targetAngle,
  onSelect,
  selectedAngle,
  className = "",
  size = 400,
  disabled = false,
}: LineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredLine, setHoveredLine] = useState<Line | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null)

  useEffect(() => {
    console.log("Angles received:", angles)
    console.log("Lines generated:", lines)
  }, [angles, lines])

  // Initialize lines with unique IDs, quadrants, and positions
  useEffect(() => {
    if (angles.length === 0) return

    const anglesPerQuadrant = Math.ceil(angles.length / 4)
    const quadrantSize = size / 2
    const newLines = angles.map((angle, index) => {
      const quadrant = Math.floor(index / anglesPerQuadrant)
      const angleIndexInQuadrant = index % anglesPerQuadrant

      // Calculate position based on the quadrant and index
      let x, y

      // Use a fixed grid system with smaller margins to utilize more space
      const margin = size * 0.1 // 10% margin from edges (reduced from 15%)
      const innerSize = size - margin * 2 // Available inner area
      const halfInnerSize = innerSize / 2

      // Define quadrant origins with margins
      const leftX = margin
      const rightX = margin + halfInnerSize
      const topY = margin
      const bottomY = margin + halfInnerSize

      // Calculate positions based on number of angles per quadrant
      if (anglesPerQuadrant === 1) {
        // For 1 angle per quadrant, place it in the center of the quadrant
        x = quadrant % 2 === 0 ? leftX + halfInnerSize * 0.5 : rightX + halfInnerSize * 0.5
        y = quadrant < 2 ? topY + halfInnerSize * 0.5 : bottomY + halfInnerSize * 0.5
      } else if (anglesPerQuadrant === 2) {
        // For 2 angles per quadrant, place them diagonally with more spread (25%/75% instead of 30%/70%)
        if (angleIndexInQuadrant === 0) {
          x = quadrant % 2 === 0 ? leftX + halfInnerSize * 0.25 : rightX + halfInnerSize * 0.25
          y = quadrant < 2 ? topY + halfInnerSize * 0.25 : bottomY + halfInnerSize * 0.25
        } else {
          x = quadrant % 2 === 0 ? leftX + halfInnerSize * 0.75 : rightX + halfInnerSize * 0.75
          y = quadrant < 2 ? topY + halfInnerSize * 0.75 : bottomY + halfInnerSize * 0.75
        }
      } else if (anglesPerQuadrant === 3) {
        // For 3 angles per quadrant, place them in a more spread triangle pattern
        if (angleIndexInQuadrant === 0) {
          x = quadrant % 2 === 0 ? leftX + halfInnerSize * 0.5 : rightX + halfInnerSize * 0.5
          y = quadrant < 2 ? topY + halfInnerSize * 0.2 : bottomY + halfInnerSize * 0.2 // Moved from 0.25 to 0.2
        } else if (angleIndexInQuadrant === 1) {
          x = quadrant % 2 === 0 ? leftX + halfInnerSize * 0.2 : rightX + halfInnerSize * 0.2 // Moved from 0.25 to 0.2
          y = quadrant < 2 ? topY + halfInnerSize * 0.75 : bottomY + halfInnerSize * 0.75 // Moved from 0.7 to 0.75
        } else {
          x = quadrant % 2 === 0 ? leftX + halfInnerSize * 0.8 : rightX + halfInnerSize * 0.8 // Moved from 0.75 to 0.8
          y = quadrant < 2 ? topY + halfInnerSize * 0.75 : bottomY + halfInnerSize * 0.75 // Moved from 0.7 to 0.75
        }
      } else {
        // 4 angles per quadrant - use a 2x2 grid with more spread (20%/80% instead of 25%/75%)
        const gridX = angleIndexInQuadrant % 2 // 0 or 1
        const gridY = Math.floor(angleIndexInQuadrant / 2) // 0 or 1

        // Position at 20% or 80% of the quadrant for more spread
        const xOffset = gridX === 0 ? 0.2 : 0.8
        const yOffset = gridY === 0 ? 0.2 : 0.8

        x = quadrant % 2 === 0 ? leftX + halfInnerSize * xOffset : rightX + halfInnerSize * xOffset

        y = quadrant < 2 ? topY + halfInnerSize * yOffset : bottomY + halfInnerSize * yOffset
      }

      return {
        angle,
        id: Math.random().toString(36).substr(2, 9),
        quadrant,
        position: { x, y },
      }
    })

    setLines(newLines)
  }, [angles, size])

  // Function to draw a line on the canvas - update to make target angles larger
  const drawLine = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      startX: number,
      startY: number,
      angle: number,
      color: string,
      lineWidth = 6,
      length: number = size / 10,
      isTarget = false,
    ) => {
      // Normalize angle to 0-360 range
      const normalizedAngle = ((angle % 360) + 360) % 360
      const radians = (normalizedAngle * Math.PI) / 180
      const endX = startX + Math.cos(radians) * length
      const endY = startY - Math.sin(radians) * length

      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth // Use the same line width for all angles
      ctx.stroke()
    },
    [size],
  )

  // Effect to draw lines on the canvas - update to make target angles longer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Use a shorter line length for option angles to avoid touching the canvas edge
    const lineLength = targetAngle !== undefined ? size / 5 : size / 7 // Shorter lines for options

    if (targetAngle !== undefined) {
      // Draw the target angle with the same length as before
      drawLine(ctx, size / 2, size / 2, targetAngle, "black", 6, lineLength)
    } else {
      lines.forEach((line) => {
        const isSelected = line.id === selectedLineId
        const isHovered = line.id === hoveredLine?.id
        const color = isSelected ? "blue" : isHovered && !disabled ? "lightblue" : "black"
        const lineWidth = isSelected || (isHovered && !disabled) ? 8 : 6

        drawLine(ctx, line.position.x, line.position.y, line.angle, color, lineWidth, lineLength)
      })
    }
  }, [lines, targetAngle, selectedLineId, hoveredLine, size, drawLine, disabled])

  // Update the isPointNearLine function to be much more precise
  const isPointNearLine = useCallback(
    (x: number, y: number, line: Line) => {
      const lineLength = size / 7 // Match the shorter line length used for options
      // Normalize angle to 0-360 range
      const normalizedAngle = ((line.angle % 360) + 360) % 360
      const radians = (normalizedAngle * Math.PI) / 180

      // Calculate the end point of the line
      const endX = line.position.x + Math.cos(radians) * lineLength
      const endY = line.position.y - Math.sin(radians) * lineLength

      // Vector from line start to end
      const lineVectorX = endX - line.position.x
      const lineVectorY = endY - line.position.y
      const lineLength2 = lineVectorX * lineVectorX + lineVectorY * lineVectorY

      // If the line has zero length, just check distance to the point
      if (lineLength2 === 0) {
        return (
          Math.sqrt((x - line.position.x) * (x - line.position.x) + (y - line.position.y) * (y - line.position.y)) <= 5
        )
      }

      // Calculate projection of point onto line
      const t = ((x - line.position.x) * lineVectorX + (y - line.position.y) * lineVectorY) / lineLength2

      // If t is outside [0,1], the closest point is one of the endpoints
      if (t < 0) {
        return (
          Math.sqrt((x - line.position.x) * (x - line.position.x) + (y - line.position.y) * (y - line.position.y)) <= 5
        )
      }
      if (t > 1) {
        return Math.sqrt((x - endX) * (x - endX) + (y - endY) * (y - endY)) <= 5
      }

      // Closest point on line
      const closestX = line.position.x + t * lineVectorX
      const closestY = line.position.y + t * lineVectorY

      // Distance from point to closest point on line
      const distance = Math.sqrt((x - closestX) * (x - closestX) + (y - closestY) * (y - closestY))

      // Very strict threshold - only detect clicks very close to the line
      return distance <= 5
    },
    [size],
  )

  // Handler for canvas click events
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (disabled || !onSelect || selectedAngle !== null) return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const clickedLines = lines.filter((line) => isPointNearLine(x, y, line))

      if (clickedLines.length > 0) {
        // Find the closest line to the click point
        const closestLine = clickedLines.reduce((closest, current) => {
          const distToCurrent = Math.hypot(current.position.x - x, current.position.y - y)
          const distToClosest = Math.hypot(closest.position.x - x, closest.position.y - y)
          return distToCurrent < distToClosest ? current : closest
        })

        // Store the selected line ID to only highlight this specific line
        setSelectedLineId(closestLine.id)

        // Only select this specific line's angle
        onSelect(closestLine.angle)
      }
    },
    [lines, onSelect, isPointNearLine, disabled, selectedAngle],
  )

  // Handler for canvas mouse move events
  const handleCanvasMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (disabled) return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const hoveredLines = lines.filter((line) => isPointNearLine(x, y, line))

      if (hoveredLines.length > 0) {
        const closestLine = hoveredLines.reduce((closest, current) => {
          const distToCurrent = Math.hypot(current.position.x - x, current.position.y - y)
          const distToClosest = Math.hypot(closest.position.x - x, closest.position.y - y)
          return distToCurrent < distToClosest ? current : closest
        })
        setHoveredLine(closestLine)
      } else {
        setHoveredLine(null)
      }
    },
    [lines, isPointNearLine, disabled],
  )

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasMouseMove}
      onMouseLeave={() => setHoveredLine(null)}
      className={`border border-gray-300 ${className} ${disabled ? "cursor-default" : "cursor-pointer"}`}
    />
  )
}

