# Scripts Directory

This directory contains all project scripts organized by category for better maintainability and clarity.

## 📁 Directory Structure

```
scripts/
├── build/           # Build and deployment scripts
├── database/        # Database operations and migrations
├── setup/           # Environment setup and configuration
├── test/            # Testing scripts and utilities
├── shared/          # Shared utilities and validation functions
└── README.md        # This file
```

## 🚀 Quick Start

### Build Scripts
```bash
# Run production build
./scripts/build/build.sh
```

### Database Scripts
```bash
# Run database migrations
npx tsx scripts/database/db-migrate.ts

# Seed database with initial data
npx tsx scripts/database/db-seed.ts
```

### Setup Scripts
```bash
# Validate configuration
npx tsx scripts/setup/setup-validate-config.ts

# Setup real data
./scripts/setup/setup-real-data.sh
```

### Test Scripts
```bash
# Test author API
npx tsx scripts/test/test-author-api.ts

# Test delivery methods
npx tsx scripts/test/test-delivery-methods.ts
```

## 📋 Script Categories

### Build Scripts (`build/`)
Scripts for building and deploying the application.
- `build.sh` - Netlify production build with comprehensive error handling

### Database Scripts (`database/`)
Scripts for database operations, migrations, and maintenance.
- `db-migrate.ts` - Run database migrations with transaction support
- `db-seed.ts` - Seed database with initial data
- `db-voting-migration.ts` - Voting system migration
- `db-apply-public-policy.sql` - Apply public access policies

### Setup Scripts (`setup/`)
Scripts for environment setup and configuration.
- `setup-real-data.sh` - Setup with real data
- `setup-security-env.sh` - Security environment setup
- `setup-validate-config.ts` - Configuration validation

### Test Scripts (`test/`)
Scripts for testing various components and functionality.
- `test-author-api.ts` - Author API testing
- `test-delivery-methods.ts` - Delivery methods testing

### Shared Utilities (`shared/`)
Common utilities and validation functions used across all scripts.
- `validation.ts` - Comprehensive validation utilities
- `README.md` - Shared utilities documentation

## 🔧 Requirements

### System Requirements
- Node.js 18+
- npm 8+
- TypeScript (for .ts scripts)
- Bash (for .sh scripts)

### Environment Variables
All scripts require these environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## 🎯 Naming Conventions

All scripts follow standardized naming conventions:
- **Build scripts**: `build-*.sh`
- **Database scripts**: `db-*.ts` or `db-*.sql`
- **Setup scripts**: `setup-*.sh` or `setup-*.ts`
- **Test scripts**: `test-*.ts`

### File Extensions
- **Shell scripts**: `.sh`
- **TypeScript scripts**: `.ts`
- **SQL scripts**: `.sql`
- **JavaScript scripts**: `.js`

## 🛠️ Error Handling

All scripts include comprehensive error handling:
- Environment variable validation
- Node.js and npm version checking
- File and directory existence validation
- Dependency validation
- Graceful failure with helpful error messages
- Progress indicators for long-running operations

## 🔍 Troubleshooting

### Common Issues

1. **Missing environment variables**
   - Run `npx tsx scripts/setup/setup-validate-config.ts` to check configuration

2. **Node.js version issues**
   - Ensure Node.js 18+ is installed
   - Check version with `node --version`

3. **Permission issues**
   - Ensure scripts have execute permissions
   - Run `chmod +x scripts/*/*.sh` if needed

4. **Database connection issues**
   - Verify Supabase credentials
   - Check network connectivity

## 📊 Script Statistics

- **Total Scripts**: 10 files
- **Build Scripts**: 1 file
- **Database Scripts**: 4 files
- **Setup Scripts**: 3 files
- **Test Scripts**: 2 files

## 🎉 Recent Improvements

- ✅ Organized scripts into logical categories
- ✅ Added comprehensive error handling
- ✅ Standardized naming conventions
- ✅ Added detailed documentation
- ✅ Created shared validation utilities
- ✅ Improved script reliability and user experience

## 📝 Maintenance

Regular maintenance tasks:
- Review script performance monthly
- Update dependencies quarterly
- Test scripts before releases
- Update documentation as needed

## 🔧 Shared Validation Utilities

The `shared/validation.ts` file provides comprehensive validation functions:

### Core Validation Functions
- `validateNodeVersion()` - Node.js version checking (18+ required)
- `validateNpmVersion()` - npm version checking (8+ required)
- `validateEnvironmentVariables()` - Environment variable validation
- `validateFileExists()` - File existence validation
- `validateDirectoryExists()` - Directory existence validation
- `validateDependencies()` - Dependency validation
- `validateScriptPermissions()` - Script permission checking

### Comprehensive Functions
- `validateScriptEnvironment()` - All-in-one validation
- `checkEnvironment()` - Environment status checking
- `displayValidationResults()` - User-friendly error display

### Usage Example
```typescript
import { validateScriptEnvironment, displayValidationResults } from '../shared/validation'

const validation = validateScriptEnvironment({
  requiredEnvVars: ['NEXT_PUBLIC_SUPABASE_URL'],
  requiredFiles: ['package.json'],
  checkNodeVersion: true
})

displayValidationResults(validation, 'my-script.ts')

if (!validation.valid) {
  process.exit(1)
}
```

## 📚 Documentation

Each script category has its own README file with detailed documentation:
- [Build Scripts](build/README.md)
- [Database Scripts](database/README.md)
- [Setup Scripts](setup/README.md)
- [Test Scripts](test/README.md)
- [Shared Utilities](shared/README.md)