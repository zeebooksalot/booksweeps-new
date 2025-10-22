# Setup Scripts

This directory contains scripts for environment setup, configuration, and initial project setup.

## Scripts

### `setup-real-data.sh`
Sets up the project with real data for development and testing.

**Usage:**
```bash
./scripts/setup/setup-real-data.sh
```

**Features:**
- Environment validation
- Data setup and configuration
- Development environment preparation

### `setup-security-env.sh`
Configures security environment variables and settings.

**Usage:**
```bash
./scripts/setup/setup-security-env.sh
```

**Features:**
- Security environment setup
- Access control configuration
- Security policy application

### `setup-validate-config.ts`
Validates project configuration and environment setup.

**Usage:**
```bash
npx tsx scripts/setup/setup-validate-config.ts
```

**Validation Checks:**
- Environment variables
- Configuration files
- Dependencies
- System requirements

## Requirements

- Node.js 18+
- npm 8+
- Bash (for .sh scripts)
- TypeScript (for .ts scripts)

## Environment Variables

Setup scripts may require various environment variables depending on the setup type:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Error Handling

Setup scripts include comprehensive error handling and validation to ensure proper environment setup.

## Dependencies

- `@supabase/supabase-js` - Supabase client
- `tsx` - TypeScript execution
- `fs` - File system operations
- `path` - Path utilities
