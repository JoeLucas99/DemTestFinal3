/**
 * Root Layout Component
 * 
 * This component serves as the main layout wrapper for the entire application.
 * It provides:
 * - Global font configuration (Inter)
 * - Viewport settings for responsive design
 * - Global context providers
 * - Fullscreen functionality
 * - Style and context menu wrappers
 */

import { Inter } from "next/font/google"
import "../styles/globals.css"
import FullscreenButton from "../components/FullscreenButton"
import { SettingsProvider } from "../contexts/SettingsContext"
import StyleWrapper from "../components/StyleWrapper"
import ContextMenuWrapper from "../components/ContextMenuWrapper"
import type React from "react"

// Initialize the Inter font with Latin subset for consistent typography
const inter = Inter({ subsets: ["latin"] })

// Root layout component for the entire application
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Meta tag for responsive design and disabling user scaling on mobile devices */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        {/* SettingsProvider: Provides global settings context for the entire app */}
        <SettingsProvider>
          {/* StyleWrapper: Applies global styles and theme settings */}
          <StyleWrapper>
            {/* ContextMenuWrapper: Prevents default context menu behavior for better UX */}
            <ContextMenuWrapper>
              {/* Main container with fullscreen support and landscape rotation */}
              <div className="relative min-h-screen landscape-rotate">
                {/* FullscreenButton: Provides UI for toggling fullscreen mode */}
                <FullscreenButton />
                {/* Render child components (pages) */}
                {children}
              </div>
            </ContextMenuWrapper>
          </StyleWrapper>
        </SettingsProvider>
      </body>
    </html>
  )
}

