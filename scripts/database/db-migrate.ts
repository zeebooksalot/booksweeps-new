import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { 
  validateScriptEnvironment, 
  displayValidationResults,
  checkEnvironment 
} from '../shared/validation'

// Enhanced validation using shared utilities
function validateEnvironment() {
  const validation = validateScriptEnvironment({
    requiredEnvVars: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ],
    requiredDirs: [
      path.join(process.cwd(), 'supabase', 'migrations')
    ],
    checkNodeVersion: true,
    checkNpmVersion: true
  })
  
  displayValidationResults(validation, 'db-migrate.ts')
  
  if (!validation.valid) {
    process.exit(1)
  }
  
  // Display environment info
  const envCheck = checkEnvironment([
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ])
  
  console.log('\n📋 Environment Status:')
  console.log(`  - Node.js: ${envCheck.nodeVersion}`)
  console.log(`  - npm: ${envCheck.npmVersion}`)
  console.log(`  - Environment variables: ${envCheck.presentEnvVars.length}/${envCheck.requiredEnvVars.length} set`)
}

// Validate environment before proceeding
validateEnvironment()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

let supabase: any
try {
  supabase = createClient(supabaseUrl, supabaseServiceKey)
  console.log('✅ Supabase client created successfully')
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error)
  process.exit(1)
}

async function runMigrations() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
  
  console.log(`🔍 Checking migrations directory: ${migrationsDir}`)
  
  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Migrations directory not found')
    console.error(`💡 Expected directory: ${migrationsDir}`)
    console.error('💡 Make sure you are running this script from the project root')
    process.exit(1)
  }

  console.log('✅ Migrations directory found')

  let migrationFiles: string[]
  try {
    migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()
  } catch (error) {
    console.error('❌ Failed to read migrations directory:', error)
    process.exit(1)
  }

  if (migrationFiles.length === 0) {
    console.log('ℹ️ No migration files found')
    return
  }

  console.log(`📋 Found ${migrationFiles.length} migration files:`)
  migrationFiles.forEach(file => console.log(`  - ${file}`))

  console.log('\n🚀 Running migrations...')

  let successCount = 0
  let failureCount = 0

  for (const file of migrationFiles) {
    console.log(`\n🔄 Running migration: ${file}`)
    
    let sql: string
    try {
      sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    } catch (error) {
      console.error(`❌ Failed to read migration file ${file}:`, error)
      failureCount++
      continue
    }
    
    if (!sql.trim()) {
      console.log(`⚠️ Migration ${file} is empty, skipping...`)
      continue
    }
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql })
      
      if (error) {
        console.error(`❌ Error running migration ${file}:`, error)
        console.error(`💡 Migration failed, but continuing with remaining migrations...`)
        failureCount++
        continue
      }
      
      console.log(`✅ Migration ${file} completed successfully`)
      successCount++
    } catch (error) {
      console.error(`❌ Exception running migration ${file}:`, error)
      console.error(`💡 Migration failed, but continuing with remaining migrations...`)
      failureCount++
    }
  }

  console.log('\n📊 Migration Summary:')
  console.log(`  ✅ Successful: ${successCount}`)
  console.log(`  ❌ Failed: ${failureCount}`)
  console.log(`  📋 Total: ${migrationFiles.length}`)

  if (failureCount > 0) {
    console.log('\n⚠️ Some migrations failed. Please check the errors above.')
    process.exit(1)
  }

  console.log('\n🎉 All migrations completed successfully!')
}

// Enhanced error handling for main execution
async function main() {
  try {
    console.log('🚀 Starting database migration process...')
    await runMigrations()
    console.log('✅ Migration process completed successfully!')
  } catch (error) {
    console.error('❌ Migration process failed:', error)
    console.error('💡 Check the error details above and try again')
    process.exit(1)
  }
}

// Run the main function
main() 