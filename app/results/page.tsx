"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { stringify } from "csv-stringify/sync"

// Interface defining the structure of a single test result
// Contains information about correctness, timing, and angles
interface Result {
  correct: boolean
  time: number
  targetAngle?: number
  selectedAngle?: number
}

// Component for displaying test results
export default function Results() {
  // State to store the array of test results
  const [results, setResults] = useState<Result[]>([])
  // Router hook for navigation between pages
  const router = useRouter()

  // Load results from sessionStorage when component mounts
  // This ensures we have access to the test results even after page refresh
  useEffect(() => {
    const storedResults = sessionStorage.getItem("testResults")
    if (storedResults) {
      setResults(JSON.parse(storedResults))
    }
  }, [])

  // Function to download results as a CSV file
  // Creates a formatted CSV with headers and data rows
  const downloadCSV = () => {
    // Define CSV headers and format the data rows
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

    // Convert the data to CSV format
    const csv = stringify(csvData)
    // Create a downloadable blob from the CSV data
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    // Create and trigger a download link
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "test_results.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    // Main container with centered content
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Page title */}
      <h1 className="text-5xl font-bold mb-8">Test Results</h1>
      {/* Container for results list */}
      <div className="w-full max-w-md">
        {/* Map through results and display each one */}
        {results.map((result, index) => (
          <div key={index} className="mb-4 p-4 border rounded text-xl">
            {/* Display stimulus number and correctness */}
            <p>
              Stimulus {index + 1}: {result.correct ? "Correct" : "Incorrect"}
            </p>
            {/* Display time taken in seconds */}
            <p>Time taken: {(result.time / 1000).toFixed(2)} seconds</p>
            {/* Display target angle if available */}
            {result.targetAngle !== undefined && <p>Target Angle: {result.targetAngle}°</p>}
            {/* Display selected angle if available */}
            {result.selectedAngle !== undefined && <p>Selected Angle: {result.selectedAngle}°</p>}
          </div>
        ))}
      </div>
      {/* Button to download results as CSV */}
      <Button onClick={downloadCSV} className="mt-8 text-xl py-3 px-6 bg-green-600 text-white hover:bg-green-700">
        Download Results (CSV)
      </Button>
      {/* Button to return to main menu */}
      <Button onClick={() => router.push("/")} className="mt-4 text-xl py-3 px-6 bg-black text-white hover:bg-gray-800">
        Back to Main Menu
      </Button>
    </div>
  )
}

