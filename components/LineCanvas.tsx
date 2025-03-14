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

  // Initialize lines with unique IDs, quadrants, and positions
  useEffect(() => {
    const anglesPerQuadrant = Math.ceil(angles.length / 4)
    const quadrantSize = size / 2
    const newLines = angles.map((angle, index) => {
      const quadrant = Math.floor(index / anglesPerQuadrant)
      const angleIndexInQuadrant = index % anglesPerQuadrant

      // Calculate position based on the quadrant and index
      let x, y
      const padding = size * 0.15 // 15% padding
      const availableSpace = quadrantSize - padding * 2

      // Position calculation based on number of angles per quadrant
      if (anglesPerQuadrant === 1) {
        x = quadrant % 2 === 0 ? padding : quadrantSize + padding
        y = quadrant < 2 ? padding : quadrantSize + padding
      } else if (anglesPerQuadrant === 2) {
        x =
          quadrant % 2 === 0
            ? padding + angleIndexInQuadrant * availableSpace
            : quadrantSize + padding + (1 - angleIndexInQuadrant) * availableSpace
        y = quadrant < 2 ? padding : quadrantSize + padding
      } else if (anglesPerQuadrant === 3) {
        if (angleIndexInQuadrant === 0) {
          x = quadrant % 2 === 0 ? padding : quadrantSize + padding
          y = quadrant < 2 ? padding : quadrantSize + padding
        } else {
          x =
            quadrant % 2 === 0
              ? padding + (angleIndexInQuadrant - 1) * availableSpace
              : quadrantSize + padding + (2 - angleIndexInQuadrant) * availableSpace
          y = quadrant < 2 ? padding + availableSpace : quadrantSize + padding + availableSpace
        }
      } else {
        // 4 angles per quadrant
        x =
          quadrant % 2 === 0
            ? padding + (angleIndexInQuadrant % 2) * availableSpace
            : quadrantSize + padding + (1 - (angleIndexInQuadrant % 2)) * availableSpace
        y =
          quadrant < 2
            ? Math.floor(angleIndexInQuadrant / 2) === 0
              ? padding
              : padding + availableSpace
            : Math.floor(angleIndexInQuadrant / 2) === 0
              ? quadrantSize + padding
              : quadrantSize + padding + availableSpace
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

  // Function to draw a line on the canvas
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
      const radians = (angle * Math.PI) / 180
      const endX = startX + Math.cos(radians) * length
      const endY = startY - Math.sin(radians) * length

      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.stroke()
    },
    [size],
  )

  // Effect to draw lines on the canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const lineLength = size / 8 // Uniform length for all lines

    if (targetAngle !== undefined) {
      // Draw the target angle
      drawLine(ctx, size / 2, size / 2, targetAngle, "black", 3, lineLength, true)
    } else {
      lines.forEach((line) => {
        const isSelected = line.angle === selectedAngle
        const isHovered = line.id === hoveredLine?.id
        const color = isSelected ? "blue" : isHovered && !disabled ? "lightblue" : "black"
        const lineWidth = isSelected || (isHovered && !disabled) ? 8 : 6

        drawLine(ctx, line.position.x, line.position.y, line.angle, color, lineWidth, lineLength)
      })
    }
  }, [lines, targetAngle, selectedAngle, hoveredLine, size, drawLine, disabled])

  // Function to check if a point is near a line
  const isPointNearLine = useCallback(
    (x: number, y: number, line: Line) => {
      const lineLength = Math.min(size / 3, 150)
      const radians = (line.angle * Math.PI) / 180
      let endX = line.position.x + Math.cos(radians) * lineLength
      let endY = line.position.y - Math.sin(radians) * lineLength

      // Adjust end points to keep lines within canvas
      const padding = 20
      endX = Math.max(padding, Math.min(endX, size - padding))
      endY = Math.max(padding, Math.min(endY, size - padding))

      const distToLine =
        Math.abs(
          (endY - line.position.y) * x - (endX - line.position.x) * y + endX * line.position.y - endY * line.position.x,
        ) / Math.sqrt((endY - line.position.y) ** 2 + (endX - line.position.x) ** 2)

      const isWithinLineSegment =
        x >= Math.min(line.position.x, endX) - 10 &&
        x <= Math.max(line.position.x, endX) + 10 &&
        y >= Math.min(line.position.y, endY) - 10 &&
        y <= Math.max(line.position.y, endY) + 10

      return distToLine <= 5 && isWithinLineSegment
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
        const closestLine = clickedLines.reduce((closest, current) => {
          const distToCurrent = Math.hypot(current.position.x - x, current.position.y - y)
          const distToClosest = Math.hypot(closest.position.x - x, closest.position.y - y)
          return distToCurrent < distToClosest ? current : closest
        })
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

