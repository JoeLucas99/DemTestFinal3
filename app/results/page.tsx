/**
 * Results Page Component
 * 
 * This component displays the test results after completion, showing:
 * - Individual results for each stimulus
 * - Time taken for each response
 * - Correctness of answers
 * - Target and selected angles
 * - Option to download results as CSV
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { stringify } from "csv-stringify/sync"

/**
 * Result interface defines the structure of a single test result.
 * Each result contains information about the correctness, timing, and angles involved.
 */
interface Result {
  correct: boolean          // Whether the selected angle matched the target
  time: number            // Time taken to respond in milliseconds
  targetAngle?: number    // The correct angle that should have been selected
  selectedAngle?: number  // The angle actually selected by the user
}

// Component for displaying test results
export default function Results() {
  // State to store the test results
  const [results, setResults] = useState<Result[]>([])
  const router = useRouter()

  // Load results from sessionStorage when component mounts
  useEffect(() => {
    const storedResults = sessionStorage.getItem("testResults")
    if (storedResults) {
      setResults(JSON.parse(storedResults))
    }
  }, [])

  /**
   * Handles downloading the results as a CSV file.
   * Creates a formatted CSV with headers and data rows.
   */
  const downloadCSV = () => {
    // Create CSV data with headers and formatted rows
    const csvData = [
      ["Stimulus", "Correct", "Time (seconds)", "Target Angle", "Selected Angle"],
      ...results.map((result, index) => [
        index + 1,
        result.correct ? "Yes" : "No",
        (result.time / 1000).toFixed(2),
        result.targetAngle || "N/A",
        result.selectedAngle || "N/A",
      ]),
    ]

    // Convert data to CSV format and create download link
    const csv = stringify(csvData)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "test_results.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Render the results interface
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-5xl font-bold mb-8">Test Results</h1>
      {/* Display individual results for each stimulus */}
      <div className="w-full max-w-md">
        {results.map((result, index) => (
          <div key={index} className="mb-4 p-4 border rounded text-xl">
            <p>
              Stimulus {index + 1}: {result.correct ? "Correct" : "Incorrect"}
            </p>
            <p>Time taken: {(result.time / 1000).toFixed(2)} seconds</p>
            {result.targetAngle !== undefined && <p>Target Angle: {result.targetAngle}°</p>}
            {result.selectedAngle !== undefined && <p>Selected Angle: {result.selectedAngle}°</p>}
          </div>
        ))}
      </div>
      {/* Action buttons for downloading results and returning to main menu */}
      <Button onClick={downloadCSV} className="mt-8 text-xl py-3 px-6 bg-green-600 text-white hover:bg-green-700">
        Download Results (CSV)
      </Button>
      <Button onClick={() => router.push("/")} className="mt-4 text-xl py-3 px-6 bg-black text-white hover:bg-gray-800">
        Back to Main Menu
      </Button>
    </div>
  )
}

