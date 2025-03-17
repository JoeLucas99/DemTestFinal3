"use client"

import type React from "react"

// StyleWrapper component: Applies global styles to its children
// This component provides essential global styles for the application,
// including user selection prevention and landscape mode handling
export default function StyleWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <style jsx global>{`
        /* Disable user selection across the entire application */
        /* This prevents text selection which could interfere with the test */
        body {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        /* Disable dragging and touch callout for better mobile experience */
        /* These styles prevent unwanted interactions on mobile devices */
        * {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Handle landscape orientation for better mobile experience */
        /* This ensures proper display when device is rotated */
        @media (orientation: landscape) {
          .landscape-rotate {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            width: 100vw;
          }
        }
      `}</style>
    </>
  )
}

