"use client"

import type React from "react"

// StyleWrapper component: Applies global styles to its children
export default function StyleWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <style jsx global>{`
        /* Disable user selection */
        body {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        /* Disable dragging and touch callout */
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

        /* Rotate content in landscape mode */
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

