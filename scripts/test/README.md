# Test Scripts

This directory contains scripts for testing various components and functionality.

## Scripts

### `test-author-api.ts`
Tests the author API endpoints and functionality.

**Usage:**
```bash
npx tsx scripts/test/test-author-api.ts
```

**Test Coverage:**
- Author creation and updates
- API endpoint validation
- Error handling scenarios
- Authentication flows

### `test-delivery-methods.ts`
Tests delivery methods and email functionality.

**Usage:**
```bash
npx tsx scripts/test/test-delivery-methods.ts
```

**Test Coverage:**
- Email delivery methods
- Notification systems
- Delivery method validation
- Error scenarios

## Requirements

- Node.js 18+
- TypeScript
- Supabase connection
- Test data setup

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Test Data

Test scripts may require specific test data to be present in the database. Ensure the database is seeded before running tests.

## Error Handling

Test scripts include comprehensive error handling and will report test results with pass/fail status.

## Dependencies

- `@supabase/supabase-js` - Supabase client
- `tsx` - TypeScript execution
- `fs` - File system operations
- `path` - Path utilities
