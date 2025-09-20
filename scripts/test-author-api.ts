#!/usr/bin/env tsx

/**
 * Test script for author platform API integration
 * Run with: npx tsx scripts/test-author-api.ts
 */

import { AUTHOR_CONFIG } from '../lib/authorConfig';

async function testAuthorAPI() {
  console.log('🧪 Testing Author Platform API Integration\n');
  
  console.log(`📡 API Base URL: ${AUTHOR_CONFIG.API_BASE_URL}`);
  console.log(`📋 Known Author IDs: ${AUTHOR_CONFIG.KNOWN_AUTHOR_IDS.join(', ')}\n`);
  
  // Test individual author endpoints
  for (const authorId of AUTHOR_CONFIG.KNOWN_AUTHOR_IDS) {
    console.log(`🔍 Testing author: ${authorId}`);
    
    try {
      const response = await fetch(`${AUTHOR_CONFIG.API_BASE_URL}/${authorId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success: ${data.name || 'Unknown Author'}`);
        console.log(`   - Books: ${data.books?.length || 0}`);
        console.log(`   - Campaigns: ${data.campaigns?.length || 0}`);
        console.log(`   - Genre: ${data.genre || 'Not specified'}`);
      } else {
        console.log(`❌ Failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    console.log('');
  }
  
  // Test the staging site API
  console.log('🌐 Testing Staging Site API (/api/authors)');
  try {
    const response = await fetch('http://localhost:3000/api/authors');
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Success: ${data.authors?.length || 0} authors returned`);
      console.log(`   - Pagination: Page ${data.pagination?.page || 1} of ${data.pagination?.totalPages || 1}`);
    } else {
      console.log(`❌ Failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.log('   Make sure the development server is running (npm run dev)');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Update KNOWN_AUTHOR_IDS in lib/authorConfig.ts with real author IDs');
  console.log('2. Test individual author pages at /authors/[id]');
  console.log('3. Test author directory at /authors');
  console.log('4. Verify CORS is properly configured on the author platform');
  console.log('5. Note: No mock data fallback - system will show errors if API fails');
}

// Run the test
testAuthorAPI().catch(console.error);
