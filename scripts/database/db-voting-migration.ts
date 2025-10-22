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

async function runVotingMigration() {
  console.log('🚀 Running voting system migration...')
  
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '006_voting_system.sql')
  const sql = fs.readFileSync(migrationPath, 'utf8')
  
  // Split the SQL into individual statements
  const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

  console.log(`Found ${statements.length} SQL statements to execute`)

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    if (statement.trim()) {
      console.log(`Executing statement ${i + 1}/${statements.length}...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error)
          console.error('Statement:', statement)
          process.exit(1)
        }
      } catch (error) {
        console.error(`Error executing statement ${i + 1}:`, error)
        console.error('Statement:', statement)
        process.exit(1)
      }
    }
  }

  console.log('✅ Voting system migration completed successfully!')
}

runVotingMigration().catch(console.error) 