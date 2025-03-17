import * as React from "react"

// Breakpoint width in pixels that determines if a device is considered mobile
const MOBILE_BREAKPOINT = 768

// Custom hook to detect if the current device is mobile
// This hook uses window.matchMedia to listen for viewport width changes
// and returns a boolean indicating if the width is below the mobile breakpoint
export function useIsMobile() {
  // State to track whether the device is mobile
  // Initially undefined to prevent hydration mismatch
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  // Effect to set up media query listener
  // This runs once when the component mounts
  React.useEffect(() => {
    // Create media query for mobile breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Handler to update mobile state when viewport changes
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Add listener for viewport changes
    mql.addEventListener("change", onChange)
    
    // Set initial mobile state
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Cleanup: remove listener when component unmounts
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Return boolean indicating if device is mobile
  // Double negation ensures boolean type
  return !!isMobile
}

