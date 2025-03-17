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
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

