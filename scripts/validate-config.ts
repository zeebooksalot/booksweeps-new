#!/usr/bin/env node

import { validateConfig } from '../lib/config'

console.log('🔍 Validating configuration...')

const errors = validateConfig()

if (errors.length > 0) {
  console.error('❌ Configuration errors found:')
  errors.forEach(error => {
    console.error(`  - ${error}`)
  })
  console.error('\nPlease check your .env file and ensure all required variables are set.')
  process.exit(1)
} else {
  console.log('✅ Configuration is valid!')
  console.log('\nEnvironment variables found:')
  console.log(`  - NEXT_PUBLIC_SITE_URL: ${process.env.NEXT_PUBLIC_SITE_URL || 'not set'}`)
  console.log(`  - NEXT_PUBLIC_READER_URL: ${process.env.NEXT_PUBLIC_READER_URL || 'not set'}`)
  console.log(`  - NEXT_PUBLIC_AUTHOR_URL: ${process.env.NEXT_PUBLIC_AUTHOR_URL || 'not set'}`)
  console.log(`  - NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'not set'}`)
  console.log(`  - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'not set'}`)
  console.log(`  - SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'not set'}`)
  console.log(`  - NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? 'set' : 'not set'}`)
} 