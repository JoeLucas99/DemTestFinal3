// Import required dependencies and components
import { Inter } from "next/font/google"
import "../styles/globals.css"
import FullscreenButton from "../components/FullscreenButton"
import { SettingsProvider } from "../contexts/SettingsContext"
import StyleWrapper from "../components/StyleWrapper"
import ContextMenuWrapper from "../components/ContextMenuWrapper"
import type React from "react"

// Initialize the Inter font with Latin subset for consistent typography
const inter = Inter({ subsets: ["latin"] })

// Root layout component that wraps the entire application
// This component provides the basic structure and context providers
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
          {/* StyleWrapper: Applies global styles and handles orientation changes */}
          <StyleWrapper>
            {/* ContextMenuWrapper: Prevents default context menu behavior for better UX */}
            <ContextMenuWrapper>
              {/* Main container with landscape rotation support */}
              <div className="relative min-h-screen landscape-rotate">
                {/* FullscreenButton: Toggles fullscreen mode for better test experience */}
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

