# Database Scripts

This directory contains scripts for database operations including migrations, seeding, and maintenance.

## Scripts

### `db-migrate.ts`
Database migration runner that applies pending migrations to the database.

**Usage:**
```bash
npx tsx scripts/database/db-migrate.ts
```

**Requirements:**
- Node.js 18+
- TypeScript
- Supabase connection

### `db-seed.ts`
Database seeding script that populates the database with initial data.

**Usage:**
```bash
npx tsx scripts/database/db-seed.ts
```

**Requirements:**
- Node.js 18+
- TypeScript
- Supabase connection
- Database migrations applied

### `db-voting-migration.ts`
Voting system migration script for specific voting functionality.

**Usage:**
```bash
npx tsx scripts/database/db-voting-migration.ts
```

### `db-apply-public-policy.sql`
SQL script to apply public access policies to the database.

**Usage:**
```bash
# Execute via Supabase CLI or dashboard
supabase db reset --db-url "your-db-url"
```

## Environment Variables

All database scripts require:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

## Error Handling

Database scripts include transaction support and will rollback on failure.

## Dependencies

- `@supabase/supabase-js` - Supabase client
- `tsx` - TypeScript execution
- `fs` - File system operations
- `path` - Path utilities
