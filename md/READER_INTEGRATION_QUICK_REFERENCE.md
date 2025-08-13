# Reader Integration - Quick Reference Guide

## 🚀 Quick Start

### For Main Site Developers (staging.booksweeps.com)

**What's Already Done:**
- ✅ Download API returns access tokens
- ✅ Token validation API created
- ✅ CORS configured for reader subdomain
- ✅ "Read in Browser" button added to download page

**API Endpoints:**
```typescript
// Download API - returns access token
POST /api/reader-magnets/downloads
Response: { success: true, download_url: string, access_token: string }

// Token Validation API - validates tokens from reader
POST /api/reader/validate-token
Request: { token: string }
Response: { success: true, book: BookData, delivery: DeliveryData }
```

**Testing:**
```bash
# Test download flow
curl -X POST /api/reader-magnets/downloads \
  -H "Content-Type: application/json" \
  -d '{"delivery_method_id": "uuid", "email": "test@example.com", "name": "Test User"}'

# Test token validation
curl -X POST /api/reader/validate-token \
  -H "Content-Type: application/json" \
  -d '{"token": "uuid-token"}'
```

### For Reader Site Developers (read.booksweeps.com)

**What You Need to Implement:**

1. **Token Extraction:**
```typescript
// Extract token from URL
const urlParams = new URLSearchParams(window.location.search)
const token = urlParams.get('token')
```

2. **Token Validation:**
```typescript
// Call main site API
const response = await fetch('https://staging.booksweeps.com/api/reader/validate-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token })
})
```

3. **Library Integration:**
```typescript
// Add book to existing library system
await addBookToLibrary(bookData, 'access_token')
```

## 🔧 Implementation Checklist

### Main Site (Already Complete)
- [x] Download API returns access tokens
- [x] Token validation API created
- [x] CORS headers configured
- [x] Frontend button added
- [x] Error handling implemented
- [x] Rate limiting configured

### Reader Site (To Do)
- [ ] Extract token from URL parameters
- [ ] Call main site validation API
- [ ] Handle API responses and errors
- [ ] Add books to existing library system
- [ ] Redirect to existing reading interface
- [ ] Test complete user flow

## 📊 Data Flow Summary

```
1. User downloads book → Main site generates access token
2. User clicks "Read in Browser" → Redirects to reader with token
3. Reader extracts token → Calls main site validation API
4. Main site validates token → Returns book data
5. Reader adds book to library → Uses existing reading interface
```

## 🔐 Security Notes

- **Tokens expire** after 24 hours
- **CORS restricted** to `https://read.booksweeps.com`
- **Rate limiting** on all endpoints
- **Tokens are UUIDs** with automatic cleanup

## 🐛 Common Issues

**Token Validation Fails:**
- Check token format (should be UUID)
- Verify token hasn't expired
- Ensure CORS headers are set correctly

**Book Not Added to Library:**
- Verify API response structure
- Check existing library integration
- Ensure acquisition method is 'access_token'

**CORS Errors:**
- Verify origin is `https://read.booksweeps.com`
- Check OPTIONS method handling
- Ensure all response headers are set

## 📞 Support

**Main Site Issues:**
- Check `/api/reader/validate-token` logs
- Verify database access token columns
- Test with curl commands above

**Reader Site Issues:**
- Check browser network tab for API calls
- Verify URL parameter extraction
- Test with existing library functions

## 🎯 Success Criteria

**User Experience:**
- User downloads book → sees "Read in Browser" button
- Clicks button → opens reader in new tab
- Book appears in library → can read immediately
- All existing reader features work normally

**Technical:**
- Token validation succeeds
- Books added to library correctly
- Reading progress tracks normally
- Error handling works gracefully
