/**
 * Shared validation utilities for all scripts
 * Provides common validation functions and environment checks
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface EnvironmentCheck {
  nodeVersion: string;
  npmVersion: string;
  requiredEnvVars: string[];
  missingEnvVars: string[];
  presentEnvVars: string[];
}

/**
 * Validates Node.js version (requires 18+)
 */
export function validateNodeVersion(): ValidationResult {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    return {
      valid: false,
      errors: [`Node.js version 18+ is required. Current version: ${nodeVersion}`],
      warnings: []
    };
  }
  
  return {
    valid: true,
    errors: [],
    warnings: []
  };
}

/**
 * Validates npm version (requires 8+)
 */
export function validateNpmVersion(): ValidationResult {
  try {
    const { execSync } = require('child_process');
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(npmVersion.split('.')[0]);
    
    if (majorVersion < 8) {
      return {
        valid: false,
        errors: [`npm version 8+ is required. Current version: ${npmVersion}`],
        warnings: []
      };
    }
    
    return {
      valid: true,
      errors: [],
      warnings: []
    };
  } catch (error) {
    return {
      valid: false,
      errors: ['Failed to check npm version'],
      warnings: []
    };
  }
}

/**
 * Validates required environment variables
 */
export function validateEnvironmentVariables(requiredVars: string[]): ValidationResult {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  const present = requiredVars.filter(varName => process.env[varName]);
  
  const errors = missing.map(varName => `Missing required environment variable: ${varName}`);
  const warnings = present.length === 0 ? ['No environment variables found'] : [];
  
  return {
    valid: missing.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates file existence
 */
export function validateFileExists(filePath: string, description: string = 'file'): ValidationResult {
  const fs = require('fs');
  
  if (!fs.existsSync(filePath)) {
    return {
      valid: false,
      errors: [`${description} not found: ${filePath}`],
      warnings: []
    };
  }
  
  return {
    valid: true,
    errors: [],
    warnings: []
  };
}

/**
 * Validates directory existence
 */
export function validateDirectoryExists(dirPath: string, description: string = 'directory'): ValidationResult {
  const fs = require('fs');
  
  if (!fs.existsSync(dirPath)) {
    return {
      valid: false,
      errors: [`${description} not found: ${dirPath}`],
      warnings: []
    };
  }
  
  if (!fs.statSync(dirPath).isDirectory()) {
    return {
      valid: false,
      errors: [`Path exists but is not a directory: ${dirPath}`],
      warnings: []
    };
  }
  
  return {
    valid: true,
    errors: [],
    warnings: []
  };
}

/**
 * Comprehensive environment check
 */
export function checkEnvironment(requiredEnvVars: string[]): EnvironmentCheck {
  const nodeVersion = process.version;
  const npmVersion = (() => {
    try {
      const { execSync } = require('child_process');
      return execSync('npm --version', { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  })();
  
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  const presentEnvVars = requiredEnvVars.filter(varName => process.env[varName]);
  
  return {
    nodeVersion,
    npmVersion,
    requiredEnvVars,
    missingEnvVars,
    presentEnvVars
  };
}

/**
 * Validates script dependencies
 */
export function validateDependencies(dependencies: string[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const dep of dependencies) {
    try {
      require.resolve(dep);
    } catch (error) {
      errors.push(`Missing dependency: ${dep}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates script permissions (Unix only)
 */
export function validateScriptPermissions(scriptPath: string): ValidationResult {
  const fs = require('fs');
  
  try {
    const stats = fs.statSync(scriptPath);
    const isExecutable = !!(stats.mode & parseInt('111', 8));
    
    if (!isExecutable) {
      return {
        valid: false,
        errors: [`Script is not executable: ${scriptPath}`],
        warnings: []
      };
    }
    
    return {
      valid: true,
      errors: [],
      warnings: []
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to check script permissions: ${scriptPath}`],
      warnings: []
    };
  }
}

/**
 * Comprehensive validation for all scripts
 */
export function validateScriptEnvironment(options: {
  requiredEnvVars?: string[];
  requiredFiles?: string[];
  requiredDirs?: string[];
  requiredDependencies?: string[];
  checkNodeVersion?: boolean;
  checkNpmVersion?: boolean;
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check Node.js version
  if (options.checkNodeVersion !== false) {
    const nodeCheck = validateNodeVersion();
    if (!nodeCheck.valid) {
      errors.push(...nodeCheck.errors);
    }
  }
  
  // Check npm version
  if (options.checkNpmVersion !== false) {
    const npmCheck = validateNpmVersion();
    if (!npmCheck.valid) {
      errors.push(...npmCheck.errors);
    }
  }
  
  // Check environment variables
  if (options.requiredEnvVars) {
    const envCheck = validateEnvironmentVariables(options.requiredEnvVars);
    if (!envCheck.valid) {
      errors.push(...envCheck.errors);
    }
    warnings.push(...envCheck.warnings);
  }
  
  // Check required files
  if (options.requiredFiles) {
    for (const file of options.requiredFiles) {
      const fileCheck = validateFileExists(file);
      if (!fileCheck.valid) {
        errors.push(...fileCheck.errors);
      }
    }
  }
  
  // Check required directories
  if (options.requiredDirs) {
    for (const dir of options.requiredDirs) {
      const dirCheck = validateDirectoryExists(dir);
      if (!dirCheck.valid) {
        errors.push(...dirCheck.errors);
      }
    }
  }
  
  // Check dependencies
  if (options.requiredDependencies) {
    const depCheck = validateDependencies(options.requiredDependencies);
    if (!depCheck.valid) {
      errors.push(...depCheck.errors);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Display validation results in a user-friendly format
 */
export function displayValidationResults(result: ValidationResult, scriptName: string): void {
  console.log(`\n🔍 Validation results for ${scriptName}:`);
  
  if (result.valid) {
    console.log('✅ All validations passed');
  } else {
    console.log('❌ Validation failed');
  }
  
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    result.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  if (!result.valid) {
    console.log('\n💡 Please fix the errors above and try again');
  }
}
