"use client"

import type React from "react"

// ContextMenuWrapper component: Prevents default context menu behavior
// This component is used to disable the right-click context menu throughout the app
// to prevent accidental interactions during the test
export default function ContextMenuWrapper({ children }: { children: React.ReactNode }) {
  // Handler to prevent the default context menu from appearing
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  // Wrap children with a div that prevents context menu
  return <div onContextMenu={handleContextMenu}>{children}</div>
}

