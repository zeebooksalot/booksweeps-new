#!/bin/bash

# Setup script for real data integration
echo "🚀 Setting up real data integration for BookSweeps staging site"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Author Platform API
NEXT_PUBLIC_AUTHOR_API_URL=https://app.booksweeps.com/functions/v1/public-author

# Base URL for local development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google Analytics (replace with your actual GA ID)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google Search Console Verification
GOOGLE_VERIFICATION_CODE=your_google_verification_code

# Yandex Verification
YANDEX_VERIFICATION_CODE=your_yandex_verification_code

# Yahoo Verification
YAHOO_VERIFICATION_CODE=your_yahoo_verification_code
EOF
    echo "✅ Created .env.local file"
else
    echo "⚠️  .env.local already exists, skipping creation"
fi

echo ""
echo "🔧 Next steps:"
echo "1. Update KNOWN_AUTHOR_IDS in lib/authorConfig.ts with real author IDs"
echo "2. Update NEXT_PUBLIC_GA_ID in .env.local with your Google Analytics ID"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Run 'npx tsx scripts/test-author-api.ts' to test the API integration"
echo "5. Visit http://localhost:3000/authors to see the author directory"
echo ""
echo "📚 See REAL_DATA_INTEGRATION.md for detailed instructions"
echo ""
echo "🎉 Setup complete!"
