#!/usr/bin/env node

import { validateConfig } from '../../lib/config/index'
import { 
  validateScriptEnvironment, 
  displayValidationResults,
  checkEnvironment 
} from '../shared/validation'

// Enhanced validation using shared utilities
function validateEnvironment() {
  console.log('🔍 Validating configuration...')
  
  // First, validate basic environment requirements
  const basicValidation = validateScriptEnvironment({
    requiredEnvVars: [
      'NEXT_PUBLIC_SITE_URL',
      'NEXT_PUBLIC_READER_URL',
      'NEXT_PUBLIC_AUTHOR_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXTAUTH_SECRET'
    ],
    requiredFiles: [
      'package.json',
      '.env.local'
    ],
    checkNodeVersion: true,
    checkNpmVersion: true
  })
  
  displayValidationResults(basicValidation, 'setup-validate-config.ts')
  
  if (!basicValidation.valid) {
    process.exit(1)
  }
  
  // Then validate using the config module
  try {
    const configValidation = validateConfig()
    
    if (!configValidation.valid) {
      console.error('❌ Configuration errors found:')
      configValidation.errors.forEach(error => {
        console.error(`  - ${error}`)
      })
      console.error('\n💡 Please check your .env file and ensure all required variables are set.')
      console.error('💡 Make sure you are running this script from the project root directory.')
      process.exit(1)
    }
    
    console.log('✅ Configuration is valid!')
    return true
  } catch (error) {
    console.error('❌ Failed to validate configuration:', error)
    console.error('💡 Make sure the config validation module is available')
    process.exit(1)
  }
}

function displayEnvironmentVariables() {
  const envCheck = checkEnvironment([
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_READER_URL', 
    'NEXT_PUBLIC_AUTHOR_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET'
  ])
  
  console.log('\n📋 Environment variables status:')
  console.log(`  - Total required: ${envCheck.requiredEnvVars.length}`)
  console.log(`  - Present: ${envCheck.presentEnvVars.length}`)
  console.log(`  - Missing: ${envCheck.missingEnvVars.length}`)
  
  envCheck.requiredEnvVars.forEach(varName => {
    const value = process.env[varName]
    const status = value ? '✅ set' : '❌ not set'
    const displayValue = value ? (varName.includes('SECRET') || varName.includes('KEY') ? '***hidden***' : value) : 'not set'
    console.log(`  - ${varName}: ${status} ${value ? `(${displayValue})` : ''}`)
  })
}

// Node.js version checking is now handled by shared validation utilities

// Main execution with comprehensive error handling
async function main() {
  try {
    console.log('🚀 Starting configuration validation...')
    
    validateEnvironment()
    displayEnvironmentVariables()
    
    console.log('\n🎉 Configuration validation completed successfully!')
  } catch (error) {
    console.error('❌ Configuration validation failed:', error)
    console.error('💡 Check the error details above and try again')
    process.exit(1)
  }
}

// Run the main function
main() 