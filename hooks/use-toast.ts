
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

// Constants for toast behavior
const TOAST_LIMIT = 1 // Maximum number of toasts to show at once
const TOAST_REMOVE_DELAY = 1000000 // Delay in ms before removing a toast

// Type definition for a toast message
// Extends the base ToastProps with additional fields
type ToasterToast = ToastProps & {
  id: string // Unique identifier for the toast
  title?: React.ReactNode // Optional title of the toast
  description?: React.ReactNode // Optional description of the toast
  action?: ToastActionElement // Optional action button for the toast
}

// Action types for the toast reducer
// These define all possible actions that can be performed on toasts
const actionTypes = {
  ADD_TOAST: "ADD_TOAST", // Add a new toast
  UPDATE_TOAST: "UPDATE_TOAST", // Update an existing toast
  DISMISS_TOAST: "DISMISS_TOAST", // Dismiss a toast
  REMOVE_TOAST: "REMOVE_TOAST", // Remove a toast from the queue
} as const

// Counter for generating unique toast IDs
let count = 0

// Function to generate unique IDs for toasts
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

// Type definitions for the reducer
type ActionType = typeof actionTypes

// Union type of all possible toast actions
type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

// State interface for the toast system
interface State {
  toasts: ToasterToast[] // Array of active toasts
}

// Map to store timeout IDs for toast removal
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// Function to queue a toast for removal
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

// Reducer function to handle toast state updates
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Queue toasts for removal
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// Array to store state change listeners
const listeners: Array<(state: State) => void> = []

// Initial state for the toast system
let memoryState: State = { toasts: [] }

// Function to dispatch actions and notify listeners
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// Type for toast creation parameters
type Toast = Omit<ToasterToast, "id">

// Function to create and show a new toast
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

// Custom hook to use the toast system
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }

