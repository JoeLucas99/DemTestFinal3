"use client"

import type React from "react"

// ContextMenuWrapper component: Prevents default context menu behavior
export default function ContextMenuWrapper({ children }: { children: React.ReactNode }) {
  // Handler to prevent the default context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return <div onContextMenu={handleContextMenu}>{children}</div>
}

