# Token Validation API Migration to Reader Repo

## 📋 Overview

Moving the token validation API from the main site to the reader repo to simplify the architecture and eliminate cross-site API calls.

## 🏗️ Current Architecture

### **Before (Cross-Site API Calls)**
```
Main Site (staging.booksweeps.com)
├── /api/reader/validate-token ← API endpoint
└── Database access

Reader Site (read.booksweeps.com)
├── Receives token from URL
├── Calls main site API ← Cross-site request
└── Processes response
```

### **After (Self-Contained)**
```
Reader Site (read.booksweeps.com)
├── /api/reader/validate-token ← API endpoint
├── Direct database access
└── Self-contained token processing
```

## 📁 Files to Move

### **1. API Endpoint**
**Source**: `app/api/reader/validate-token/route.ts`  
**Destination**: `reader-repo/app/api/reader/validate-token/route.ts`

**Key Changes**:
- Remove CORS headers (no longer needed)
- Keep core validation logic
- Maintain error handling

### **2. Access Token Library**
**Source**: `lib/access-token.ts`  
**Destination**: `reader-repo/lib/access-token.ts`

**Functions Included**:
- `validateAccessToken()` - Core token validation
- `updateTokenUsage()` - Track token usage
- Type definitions for `AccessTokenData` and `TokenValidationResult`

### **3. Error Handler Library**
**Source**: `lib/error-handler.ts`  
**Destination**: `reader-repo/lib/error-handler.ts`

**Functions Included**:
- `extractErrorContext()` - Request context extraction
- `sanitizeError()` - Error sanitization for client
- `createErrorResponse()` - Standardized error responses

### **4. Validation Library**
**Source**: `lib/validation.ts`  
**Destination**: `reader-repo/lib/validation.ts`

**Functions Included**:
- `isValidUUID()` - UUID format validation

### **5. Supabase Client**
**Source**: `lib/supabase.ts`  
**Destination**: `reader-repo/lib/supabase.ts`

**Content**: Basic Supabase client setup

## 🔄 Updated User Flow

### **Step 1: Download**
1. User visits download page on main site
2. Fills out form (name, email)
3. Receives access token in response

### **Step 2: Read in Browser**
1. User clicks "Read in Browser" button
2. Opens: `https://read.booksweeps.com/library?token=[token]`
3. Reader site validates token directly
4. Book is added to user's library
5. User is redirected to reading page

## 🛠️ Implementation Steps

### **Phase 1: Reader Repo Setup**
1. Create file structure in reader repo
2. Copy all required files
3. Update imports and paths
4. Test API endpoint locally

### **Phase 2: Integration Testing**
1. Test token validation with real tokens
2. Verify book addition to library
3. Test error handling scenarios
4. Validate user flow end-to-end

### **Phase 3: Deployment**
1. Deploy updated reader site
2. Test production flow
3. Monitor for any issues
4. Remove old API from main site (optional)

## 📊 Benefits

### **Performance**
- ✅ Eliminates cross-site API calls
- ✅ Reduces latency
- ✅ Direct database access

### **Architecture**
- ✅ Simpler, self-contained design
- ✅ Reduced dependencies
- ✅ Easier debugging

### **Security**
- ✅ No cross-site CORS concerns
- ✅ Direct database validation
- ✅ Maintained security measures

### **Maintenance**
- ✅ Single codebase for token logic
- ✅ Easier to update and maintain
- ✅ Reduced complexity

## 🔧 Technical Details

### **API Endpoint**
```typescript
POST /api/reader/validate-token
Content-Type: application/json

Body: { "token": "uuid-string" }

Response: {
  success: true,
  delivery: { ... },
  book: { ... },
  delivery_method: { ... }
}
```

### **Database Tables Required**
- `reader_deliveries` - Token storage and validation
- `book_delivery_methods` - Delivery method information
- `books` - Book details
- `book_files` - File information
- `reader_library` - User's book library

### **Environment Variables**
- `NEXT_PUBLIC_SUPABASE_URL` - Database connection
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Database access key

## 🚨 Considerations

### **Dependencies**
- Ensure reader repo has Supabase client setup
- Verify database connection configuration
- Check authentication requirements

### **Error Handling**
- Maintain comprehensive error logging
- Provide user-friendly error messages
- Handle edge cases (expired tokens, invalid formats)

### **Testing**
- Test with various token states (valid, expired, invalid)
- Verify rate limiting behavior
- Test concurrent requests

## 📝 Migration Checklist

- [ ] Copy API endpoint to reader repo
- [ ] Copy required library files
- [ ] Update file imports and paths
- [ ] Test API endpoint locally
- [ ] Verify database connectivity
- [ ] Test token validation flow
- [ ] Deploy to reader site
- [ ] Test production integration
- [ ] Monitor for issues
- [ ] Remove old API (optional)

## 🎯 Success Criteria

1. **Token validation works** without cross-site API calls
2. **Books are added** to user library correctly
3. **Error handling** provides clear feedback
4. **Performance** is improved (faster response times)
5. **User experience** is seamless

---

*This migration simplifies the architecture while maintaining all security and functionality requirements.*
