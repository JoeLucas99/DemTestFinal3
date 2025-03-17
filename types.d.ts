/// <reference types="react" />

// Extend the JSX namespace to allow any custom elements
// This is used to prevent TypeScript errors when using custom elements
// that don't have type definitions
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any; // Allow any string as an element name
  }
} 