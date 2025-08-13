#!/bin/bash

# Security and Logging Environment Setup Script
# This script helps set up environment variables for enhanced security and logging features

echo "🔒 Setting up Security and Logging Environment Variables"
echo "========================================================"

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    touch .env.local
fi

# Function to add environment variable if not already present
add_env_var() {
    local var_name=$1
    local var_value=$2
    local description=$3
    
    if ! grep -q "^${var_name}=" .env.local; then
        echo "" >> .env.local
        echo "# ${description}" >> .env.local
        echo "${var_name}=${var_value}" >> .env.local
        echo "✅ Added ${var_name}"
    else
        echo "⚠️  ${var_name} already exists in .env.local"
    fi
}

echo ""
echo "📝 Adding Security Configuration Variables..."

# Security configuration
add_env_var "SECURITY_ENABLE_AUDIT_LOGGING" "true" "Enable comprehensive audit logging"
add_env_var "SECURITY_ENABLE_RATE_LIMITING" "true" "Enable rate limiting for API endpoints"
add_env_var "SECURITY_ENABLE_TOKEN_VALIDATION" "true" "Enable access token validation"
add_env_var "SECURITY_ENABLE_FILE_ACCESS_CONTROL" "true" "Enable file access control"
add_env_var "SECURITY_ENABLE_FILE_SCANNING" "true" "Enable file content scanning"
add_env_var "SECURITY_ENABLE_VIRUS_SCANNING" "false" "Enable virus scanning (requires external service)"
add_env_var "SECURITY_MAX_FILE_SIZE_FOR_SCANNING_MB" "10" "Maximum file size for security scanning"

echo ""
echo "📊 Adding Rate Limiting Configuration..."

# Rate limiting
add_env_var "RATE_LIMIT_MAX_REQUESTS_PER_MINUTE" "100" "Maximum API requests per minute per IP"
add_env_var "RATE_LIMIT_MAX_DOWNLOADS_PER_HOUR" "20" "Maximum downloads per hour per user"
add_env_var "RATE_LIMIT_MAX_DOWNLOADS_PER_DAY" "100" "Maximum downloads per day per user"

echo ""
echo "📁 Adding Download Configuration..."

# Download settings
add_env_var "DOWNLOAD_EXPIRY_HOURS" "24" "Download link expiry time in hours"
add_env_var "DOWNLOAD_MAX_FILE_SIZE_MB" "100" "Maximum file size for downloads"
add_env_var "DOWNLOAD_ENABLE_DUPLICATE_PREVENTION" "true" "Prevent duplicate downloads"

echo ""
echo "🔧 Adding Feature Flags..."

# Feature flags
add_env_var "FEATURE_ENABLE_ACCESS_TOKENS" "true" "Enable secure access tokens"
add_env_var "FEATURE_ENABLE_FILE_SECURITY" "true" "Enable enhanced file security"
add_env_var "FEATURE_ENABLE_PERFORMANCE_MONITORING" "true" "Enable performance monitoring"
add_env_var "FEATURE_ENABLE_SECURITY_MONITORING" "true" "Enable security event monitoring"

echo ""
echo "📈 Adding Monitoring Configuration..."

# Monitoring
add_env_var "MONITORING_ENABLE_CONSOLE_LOGGING" "true" "Enable console logging"
add_env_var "MONITORING_ENABLE_PERFORMANCE_TRACKING" "true" "Enable performance tracking"
add_env_var "MONITORING_ENABLE_SECURITY_ALERTS" "true" "Enable security alerts"

echo ""
echo "🔗 Adding External Logging Service Configuration..."
echo "Note: These are optional. Set to 'true' and add your API keys to enable."

# External logging services
add_env_var "NEXT_PUBLIC_SENTRY_DSN" "" "Sentry DSN for error tracking (optional)"
add_env_var "SENTRY_ENVIRONMENT" "development" "Sentry environment (development/staging/production)"
add_env_var "SENTRY_TRACES_SAMPLE_RATE" "0.1" "Sentry traces sample rate (0.0-1.0)"
add_env_var "SENTRY_PROFILES_SAMPLE_RATE" "0.1" "Sentry profiles sample rate (0.0-1.0)"

add_env_var "LOGROCKET_APP_ID" "" "LogRocket app ID for session replay (optional)"
add_env_var "LOGROCKET_ENABLE" "false" "Enable LogRocket integration"

add_env_var "DATADOG_API_KEY" "" "Datadog API key for metrics (optional)"
add_env_var "DATADOG_ENABLE" "false" "Enable Datadog integration"
add_env_var "DATADOG_SERVICE" "booksweeps" "Datadog service name"

add_env_var "NEW_RELIC_LICENSE_KEY" "" "New Relic license key (optional)"
add_env_var "NEW_RELIC_ENABLE" "false" "Enable New Relic integration"
add_env_var "NEW_RELIC_APP_NAME" "booksweeps" "New Relic application name"

echo ""
echo "🌐 Adding Cross-Domain Configuration..."

# Cross-domain
add_env_var "CROSS_DOMAIN_AUTH_ENABLED" "true" "Enable cross-domain authentication"
add_env_var "CROSS_DOMAIN_ALLOWED_ORIGINS" "http://localhost:3000,https://booksweeps.com,https://www.booksweeps.com" "Comma-separated list of allowed origins"

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review .env.local and update values as needed"
echo "2. Add your external service API keys if you want to use them"
echo "3. Run 'npm run dev' to test the configuration"
echo ""
echo "🔍 To validate your configuration, run:"
echo "npm run validate-config"
echo ""
echo "📚 For more information, see:"
echo "- md/SECURITY_AND_PERFORMANCE.md"
echo "- md/DEVELOPMENT_GUIDELINES.md"
