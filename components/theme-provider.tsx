'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

// ThemeProvider component: Provides theme context to the application
// This component wraps the app with theme functionality, allowing for
// light/dark mode switching and theme persistence
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Use Next.js's built-in theme provider to handle theme state
  // This provides automatic theme switching and persistence
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

