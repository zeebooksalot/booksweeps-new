# Shared Script Utilities

This directory contains shared utilities and validation functions used across all scripts.

## 📁 Contents

### `validation.ts`
Comprehensive validation utilities for all scripts including:
- Environment variable validation
- Node.js and npm version checking
- File and directory existence validation
- Dependency validation
- Script permission checking

## 🔧 Usage

### Basic Validation
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

### Environment Checking
```typescript
import { checkEnvironment } from '../shared/validation'

const envCheck = checkEnvironment(['NEXT_PUBLIC_SUPABASE_URL'])
console.log(`Environment variables: ${envCheck.presentEnvVars.length}/${envCheck.requiredEnvVars.length} set`)
```

### Individual Validations
```typescript
import { 
  validateNodeVersion, 
  validateNpmVersion, 
  validateEnvironmentVariables 
} from '../shared/validation'

// Check Node.js version
const nodeCheck = validateNodeVersion()
if (!nodeCheck.valid) {
  console.error('Node.js version check failed')
}

// Check npm version
const npmCheck = validateNpmVersion()
if (!npmCheck.valid) {
  console.error('npm version check failed')
}

// Check environment variables
const envCheck = validateEnvironmentVariables(['REQUIRED_VAR'])
if (!envCheck.valid) {
  console.error('Environment variables missing')
}
```

## 📋 Available Functions

### Core Validation Functions
- `validateNodeVersion()` - Validates Node.js version (requires 18+)
- `validateNpmVersion()` - Validates npm version (requires 8+)
- `validateEnvironmentVariables(requiredVars)` - Validates required environment variables
- `validateFileExists(filePath, description)` - Validates file existence
- `validateDirectoryExists(dirPath, description)` - Validates directory existence
- `validateDependencies(dependencies)` - Validates required dependencies
- `validateScriptPermissions(scriptPath)` - Validates script execution permissions

### Comprehensive Functions
- `validateScriptEnvironment(options)` - Comprehensive validation for all requirements
- `checkEnvironment(requiredEnvVars)` - Environment status checking
- `displayValidationResults(result, scriptName)` - User-friendly validation display

## 🎯 Benefits

### Consistency
- All scripts use the same validation logic
- Consistent error messages and formatting
- Standardized validation requirements

### Reliability
- Comprehensive error checking
- Graceful failure handling
- Clear error reporting

### Maintainability
- Centralized validation logic
- Easy to update validation requirements
- Reusable across all scripts

## 🔍 Validation Options

### Environment Variables
```typescript
validateScriptEnvironment({
  requiredEnvVars: ['VAR1', 'VAR2']
})
```

### File Requirements
```typescript
validateScriptEnvironment({
  requiredFiles: ['package.json', '.env.local'],
  requiredDirs: ['src', 'public']
})
```

### System Requirements
```typescript
validateScriptEnvironment({
  checkNodeVersion: true,
  checkNpmVersion: true
})
```

### Dependencies
```typescript
validateScriptEnvironment({
  requiredDependencies: ['@supabase/supabase-js', 'fs']
})
```

## 📊 Validation Results

All validation functions return a `ValidationResult` object:
```typescript
interface ValidationResult {
  valid: boolean;      // Whether validation passed
  errors: string[];    // List of errors found
  warnings: string[];  // List of warnings
}
```

## 🚀 Best Practices

1. **Always validate before execution** - Run validation at the start of every script
2. **Use comprehensive validation** - Check all requirements in one call
3. **Display results clearly** - Use `displayValidationResults()` for user-friendly output
4. **Handle failures gracefully** - Exit with clear error messages
5. **Check environment early** - Validate before expensive operations

## 🔧 Integration

To integrate these utilities into a new script:

1. Import the required functions
2. Run validation at the start of the script
3. Display results to the user
4. Exit early if validation fails
5. Continue with script logic if validation passes

Example:
```typescript
import { validateScriptEnvironment, displayValidationResults } from '../shared/validation'

// Validate environment
const validation = validateScriptEnvironment({
  requiredEnvVars: ['REQUIRED_VAR'],
  checkNodeVersion: true
})

displayValidationResults(validation, 'my-script.ts')

if (!validation.valid) {
  process.exit(1)
}

// Continue with script logic...
```
