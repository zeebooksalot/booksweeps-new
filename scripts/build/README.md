# Build Scripts

This directory contains scripts for building and deploying the application.

## Scripts

### `build.sh`
Netlify build script for production deployment.

**Usage:**
```bash
./scripts/build/build.sh
```

**Requirements:**
- Node.js 18+
- npm 8+
- Netlify CLI (optional)

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

## Error Handling

The build script includes basic error handling and will exit with non-zero status on failure.

## Dependencies

- Next.js build system
- TypeScript compilation
- Tailwind CSS processing
- Supabase client configuration
