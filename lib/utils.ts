import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function to merge Tailwind CSS classes
// This function combines clsx for conditional class names with
// tailwind-merge to properly handle Tailwind CSS class conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
