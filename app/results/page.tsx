"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { stringify } from "csv-stringify/sync"

interface Result {
  correct: boolean
  time: number
  targetAngle?: number
  selectedAngle?: number
}

// Component for displaying test results
export default function Results() {
  const [results, setResults] = useState<Result[]>([])
  const router = useRouter()

  // Load results from sessionStorage when component mounts
  useEffect(() => {
    const storedResults = sessionStorage.getItem("testResults")
    if (storedResults) {
      setResults(JSON.parse(storedResults))
    }
  }, [])

  const downloadCSV = () => {
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-5xl font-bold mb-8">Test Results</h1>
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
      <Button onClick={downloadCSV} className="mt-8 text-xl py-3 px-6 bg-green-600 text-white hover:bg-green-700">
        Download Results (CSV)
      </Button>
      <Button onClick={() => router.push("/")} className="mt-4 text-xl py-3 px-6 bg-black text-white hover:bg-gray-800">
        Back to Main Menu
      </Button>
    </div>
  )
}

