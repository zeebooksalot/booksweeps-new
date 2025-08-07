import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigrations() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
  
  if (!fs.existsSync(migrationsDir)) {
    console.error('Migrations directory not found')
    process.exit(1)
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()

  console.log('Running migrations...')

  for (const file of migrationFiles) {
    console.log(`Running migration: ${file}`)
    
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql })
      
      if (error) {
        console.error(`Error running migration ${file}:`, error)
        process.exit(1)
      }
      
      console.log(`✅ Migration ${file} completed successfully`)
    } catch (error) {
      console.error(`Error running migration ${file}:`, error)
      process.exit(1)
    }
  }

  console.log('🎉 All migrations completed successfully!')
}

runMigrations().catch(console.error) 