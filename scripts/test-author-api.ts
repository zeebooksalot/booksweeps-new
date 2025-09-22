#!/usr/bin/env tsx

/**
 * Test script for local author API integration
 * Run with: npx tsx scripts/test-author-api.ts
 */

async function testAuthorAPI() {
  console.log('🧪 Testing Local Author API Integration\n');
  
  // Test the authors list API
  console.log('🌐 Testing Authors List API (/api/authors)');
  try {
    const response = await fetch('http://localhost:3000/api/authors');
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Success: ${data.authors?.length || 0} authors returned`);
      console.log(`   - Pagination: Page ${data.pagination?.page || 1} of ${data.pagination?.totalPages || 1}`);
      
      // Test individual author pages if we have authors
      if (data.authors && data.authors.length > 0) {
        const firstAuthor = data.authors[0];
        console.log(`\n🔍 Testing individual author: ${firstAuthor.slug}`);
        
        try {
          const authorResponse = await fetch(`http://localhost:3000/api/authors/${firstAuthor.slug}`);
          if (authorResponse.ok) {
            const authorData = await authorResponse.json();
            console.log(`✅ Individual author success: ${authorData.author?.name || 'Unknown'}`);
            console.log(`   - Books: ${authorData.author?.books?.length || 0}`);
            console.log(`   - Campaigns: ${authorData.author?.campaigns?.length || 0}`);
          } else {
            console.log(`❌ Individual author failed: ${authorResponse.status}`);
          }
        } catch (error) {
          console.log(`❌ Individual author error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } else {
      console.log(`❌ Failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.log('   Make sure the development server is running (npm run dev)');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Test individual author pages at /authors/[slug]');
  console.log('2. Test author directory at /authors');
  console.log('3. Verify slug-based URLs are working correctly');
  console.log('4. Check that all author data is displaying properly');
}

// Run the test
testAuthorAPI().catch(console.error);
