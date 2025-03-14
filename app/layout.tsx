import { Inter } from "next/font/google"
import "../styles/globals.css"
import FullscreenButton from "../components/FullscreenButton"
import { SettingsProvider } from "../contexts/SettingsContext"
import StyleWrapper from "../components/StyleWrapper"
import ContextMenuWrapper from "../components/ContextMenuWrapper"
import type React from "react"

// Initialize the Inter font with Latin subset
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
        {/* Meta tag for responsive design and disabling user scaling */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        {/* SettingsProvider: Provides global settings context */}
        <SettingsProvider>
          {/* StyleWrapper: Applies global styles */}
          <StyleWrapper>
            {/* ContextMenuWrapper: Prevents default context menu behavior */}
            <ContextMenuWrapper>
              <div className="relative min-h-screen landscape-rotate">
                {/* FullscreenButton: Toggles fullscreen mode */}
                <FullscreenButton />
                {/* Render child components */}
                {children}
              </div>
            </ContextMenuWrapper>
          </StyleWrapper>
        </SettingsProvider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
