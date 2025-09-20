# Real Data Integration Guide

## 🎯 Overview

This guide explains how to integrate the staging site with real author data from the author platform API.

## 🔧 Configuration

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Author Platform API
NEXT_PUBLIC_AUTHOR_API_URL=https://app.booksweeps.com/functions/v1/public-author

# Base URL for local development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 2. Author Configuration

Update `lib/authorConfig.ts` with real author IDs:

```typescript
export const AUTHOR_CONFIG = {
  // ... other config
  KNOWN_AUTHOR_IDS: [
    'real-author-id-1',
    'real-author-id-2',
    'real-author-id-3',
    // Add more real author IDs here
  ],
};
```

## 🧪 Testing the Integration

### 1. Test the Author Platform API

Run the test script to verify the API connection:

```bash
npx tsx scripts/test-author-api.ts
```

This will:
- Test each author ID against the real API
- Verify the staging site API endpoint
- Show success/failure for each test

### 2. Test Individual Author Pages

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit individual author pages:
   - `http://localhost:3000/authors/real-author-id-1`
   - `http://localhost:3000/authors/real-author-id-2`
   - etc.

3. Verify that:
   - Author data loads correctly
   - Books and campaigns display
   - Social links work
   - SEO meta tags are generated

### 3. Test Author Directory

1. Visit `http://localhost:3000/authors`
2. Verify that:
   - All authors are listed
   - Search functionality works
   - Filtering by genre works
   - Sorting works
   - Pagination works (if needed)

## 🔄 Data Flow

```
Author Platform (app.booksweeps.com)
    ↓ (CORS-enabled API)
Staging Site API (/api/authors)
    ↓ (Processes and filters data)
Author Directory (/authors)
    ↓ (Individual author links)
Author Profile Pages (/authors/[id])
```

## 🛠️ Implementation Details

### API Integration

The system uses a two-tier approach:

1. **Direct API calls** for individual author pages
2. **Staging site API** for the author directory (with caching and filtering)

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
