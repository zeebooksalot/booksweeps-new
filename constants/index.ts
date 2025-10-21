// Main constants file - re-exports from organized modules
// This file serves as the main entry point for all constants

// Import and re-export from organized modules
export * from './shared'
export * from './filters'
export * from './api'
export * from './ui'
export * from './messages'

// Import mock data from centralized location
export { FALLBACK_DATA } from '@/lib/mock-data'