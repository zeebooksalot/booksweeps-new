# Local Development Setup Guide

## 🎯 Overview

This guide explains how to set up the BookSweeps staging site for local development. The system now uses direct Supabase integration for author data.

## 🔧 Configuration

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Base URL for local development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google Search Console Verification
GOOGLE_VERIFICATION_CODE=your_google_verification_code

# Yandex Verification
YANDEX_VERIFICATION_CODE=your_yandex_verification_code

# Yahoo Verification
YAHOO_VERIFICATION_CODE=your_yahoo_verification_code
```

### 2. Database Integration

The system automatically connects to Supabase using the existing configuration:
- Author data is fetched directly from the `pen_names` table
- Books and campaigns are joined from their respective tables
- No external API configuration needed

## 🧪 Testing the Integration

### 1. Test the Local API

Run the test script to verify the local API connection:

```bash
npx tsx scripts/test-author-api.ts
```

This will:
- Test the authors list API endpoint
- Test individual author API endpoints with slug-based URLs
- Show success/failure for each test

### 2. Test Individual Author Pages

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit individual author pages:
   - `http://localhost:3000/authors/clarissa-bright`
   - `http://localhost:3000/authors/jane-austen`
   - `http://localhost:3000/authors/franz-kafka`
   - `http://localhost:3000/authors/bob-brink`

3. Verify that:
   - Author data loads correctly
   - Books and campaigns display
   - Social links work
   - SEO meta tags are generated
   - URLs use slug-based format

### 3. Test Author Directory

1. Visit `http://localhost:3000/authors`
2. Verify that:
   - All authors are listed
   - Search functionality works
   - Filtering by genre works
   - Sorting works
   - Pagination works (if needed)
   - Links use slug-based URLs

## 🔄 Data Flow

```
Supabase Database (pen_names, books, campaigns tables)
    ↓ (Direct queries with joins)
Staging Site API (/api/authors)
    ↓ (Processes and filters data)
Author Directory (/authors)
    ↓ (Individual author links with slugs)
Author Profile Pages (/authors/[slug])
```

## 🛠️ Implementation Details

### Database Integration

The system uses direct Supabase integration:

1. **Service role client** for public API access (bypasses RLS)
2. **Direct database queries** with joins to books and campaigns tables
3. **Slug-based URLs** for SEO-friendly author pages

### Caching Strategy

- **Client-side caching**: 5 minutes for individual author data
- **Server-side caching**: 1 hour revalidation
- **No fallback**: System will show proper error messages if real API fails

### Error Handling

- **404 errors**: Show "Author Not Found" page
- **Rate limiting**: Show appropriate error message
- **Network errors**: Show error message with retry option
- **API failures**: Show specific error messages based on failure type
- **Configuration errors**: Show helpful error messages for setup issues

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure the author platform has CORS configured for `staging.booksweeps.com`
   - Check browser console for CORS-related errors

2. **404 Errors**
   - Verify author IDs exist in the author platform
   - Check that the API endpoint is correct
   - Ensure authors have public profiles enabled

3. **Rate Limiting**
   - The system handles rate limiting gracefully
   - Consider implementing exponential backoff for production

4. **Data Format Issues**
   - Ensure the API returns data in the expected format
   - Check TypeScript interfaces match the API response

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will show detailed logs in the console.

## 📊 Performance Considerations

### Optimization Strategies

1. **Batch API calls** for the author directory
2. **Implement pagination** for large author lists
3. **Use ISR** (Incremental Static Regeneration) for popular authors
4. **Cache frequently accessed data**

### Monitoring

Monitor the following metrics:
- API response times
- Error rates
- Cache hit rates
- User engagement with author pages

## 🔮 Future Enhancements

### Planned Features

1. **Real-time updates** when authors add new books/campaigns
2. **Author search** integration with the main search
3. **Author following** system
4. **Analytics integration** for author page views
5. **Pre-generation** of popular author pages

### API Improvements

1. **Bulk author endpoint** for better performance
2. **Author search endpoint** for advanced filtering
3. **Webhook support** for real-time updates
4. **GraphQL API** for more efficient data fetching

## ✅ Checklist

Before going live with real data:

- [ ] Environment variables configured
- [ ] Real author IDs added to configuration
- [ ] API endpoints tested and working
- [ ] CORS properly configured
- [ ] Error handling tested
- [ ] Performance optimized
- [ ] SEO meta tags working
- [ ] Mobile responsiveness verified
- [ ] Analytics integration working
- [ ] Error handling tested (no mock data fallback)

## 🆘 Support

If you encounter issues:

1. Check the browser console for errors
2. Run the test script to verify API connectivity
3. Check the author platform API documentation
4. Verify CORS configuration
5. Test with a known working author ID

---

**Status**: Ready for real data integration  
**Last Updated**: December 2024
