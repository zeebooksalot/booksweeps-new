# Constants System Documentation

## 📋 Overview

The constants system is a well-organized, type-safe, and maintainable structure for managing all application constants. This documentation explains how the system works, how to use it, and how to extend it.

## 🏗️ Architecture

### File Structure

```
constants/
├── index.ts          # Main entry point - re-exports all constants
├── shared.ts        # Common constants used across multiple features
├── filters.ts         # Filter-related constants
├── api.ts            # API configuration constants
├── ui.ts             # UI configuration constants
├── messages.ts       # Error/success message constants
├── giveaways.ts      # Giveaway-specific constants
├── auth.ts           # Authentication constants
├── dashboard.ts      # Dashboard constants
├── feed.ts           # Feed constants
├── reader-magnets.ts # Reader magnet constants
└── README.md         # This documentation

lib/
└── mock-data.ts      # Centralized mock data
```

### Design Principles

1. **Single Source of Truth**: Each constant is defined in exactly one place
2. **Type Safety**: All constants have proper TypeScript interfaces
3. **Modularity**: Constants are organized by feature/concern
4. **Reusability**: Common constants are shared across features
5. **Maintainability**: Clear file structure and naming conventions

## 🚀 Quick Start

```typescript
// Import all constants from the main entry point
import { 
  FILTER_OPTIONS, 
  API_CONFIG, 
  UI_CONFIG, 
  ERROR_MESSAGES 
} from '@/constants'

// Or import from specific files
import { SHARED_GENRES } from '@/constants/shared'
import { API_CONFIG } from '@/constants/api'
```

## 🎯 Common Usage Patterns

### Filter Components
```typescript
import { FILTER_OPTIONS, DEFAULT_FILTER_STATE } from '@/constants'

const FilterComponent = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTER_STATE)
  
  return (
    <select>
      {FILTER_OPTIONS.genres.map(genre => (
        <option key={genre} value={genre}>{genre}</option>
      ))}
    </select>
  )
}
```

### API Configuration
```typescript
import { API_CONFIG } from '@/constants'

const fetchBooks = async () => {
  const response = await fetch(`/api/books?limit=${API_CONFIG.defaultLimit}`)
  return response.json()
}
```

### Error Handling
```typescript
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants'

const handleError = (error: Error) => {
  toast.error(ERROR_MESSAGES.fetchFailed)
}

const handleSuccess = () => {
  toast.success(SUCCESS_MESSAGES.downloadSuccess)
}
```

### UI Configuration
```typescript
import { UI_CONFIG, PLACEHOLDER_IMAGES } from '@/constants'

const isMobile = window.innerWidth < UI_CONFIG.mobileBreakpoint
const bookImage = book.cover || PLACEHOLDER_IMAGES.book
```

## 🔧 Type Safety

```typescript
// All constants are fully typed
const genre: typeof SHARED_GENRES[number] = SHARED_GENRES[0]
const config: typeof API_CONFIG = API_CONFIG

// TypeScript will catch type errors
const invalidGenre = "InvalidGenre" // ❌ Not in SHARED_GENRES
const validGenre = "Fantasy" // ✅ Valid
```

## 🔧 File Descriptions

### `index.ts` - Main Entry Point

**Purpose**: Central re-export file that provides access to all constants.

**Key Features**:
- Re-exports all constants from organized modules
- Maintains backward compatibility
- Single import point for all constants

**Usage**:
```typescript
import { FILTER_OPTIONS, API_CONFIG, UI_CONFIG } from '@/constants'
```

### `shared.ts` - Common Constants

**Purpose**: Contains constants used across multiple features.

**Contents**:
- `SHARED_GENRES` - Common genre list
- `SHARED_DATE_RANGES` - Date range options
- `SHARED_SORT_OPTIONS` - Sort options
- `SHARED_RATING_OPTIONS` - Rating options
- `SHARED_PRIZE_TYPES` - Prize type options
- `SHARED_STATUS_OPTIONS` - Status options
- `SHARED_TAB_OPTIONS` - Tab options

**Usage**:
```typescript
import { SHARED_GENRES, SHARED_SORT_OPTIONS } from '@/constants/shared'

// Use in components
const genreOptions = SHARED_GENRES.map(genre => ({ value: genre, label: genre }))
const sortOptions = Object.keys(SHARED_SORT_OPTIONS)
```

### `filters.ts` - Filter Constants

**Purpose**: Contains all filter-related constants and configurations.

**Contents**:
- `FILTER_OPTIONS` - Main filter options object
- `TAB_OPTIONS` - Tab navigation options
- `SORT_OPTIONS` - Sort configuration
- `DATE_RANGE_OPTIONS` - Date range filters
- `DEFAULT_FILTER_STATE` - Default filter state
- `ADVANCED_FILTER_OPTIONS` - Advanced filter options

**Usage**:
```typescript
import { FILTER_OPTIONS, DEFAULT_FILTER_STATE } from '@/constants/filters'

// Initialize filter state
const [filters, setFilters] = useState(DEFAULT_FILTER_STATE)

// Use filter options
const genreOptions = FILTER_OPTIONS.genres
const sortOptions = FILTER_OPTIONS.sortOptions
```

### `api.ts` - API Configuration

**Purpose**: Contains API-related configuration constants.

**Contents**:
- `API_CONFIG` - API configuration object
  - `defaultLimit` - Default pagination limit
  - `maxLimit` - Maximum allowed limit
  - `defaultPage` - Default page number
  - `retryAttempts` - Number of retry attempts
  - `retryDelay` - Delay between retries
  - `timeout` - Request timeout

**Usage**:
```typescript
import { API_CONFIG } from '@/constants/api'

// Use in API calls
const response = await fetch(`/api/books?limit=${API_CONFIG.defaultLimit}`)
```

### `ui.ts` - UI Configuration

**Purpose**: Contains UI-related configuration constants.

**Contents**:
- `UI_CONFIG` - UI configuration object
  - `debounceDelay` - Search debounce delay
  - `mobileBreakpoint` - Mobile breakpoint
  - `tabletBreakpoint` - Tablet breakpoint
  - `desktopBreakpoint` - Desktop breakpoint
  - `maxSearchLength` - Maximum search length
  - `maxDescriptionLength` - Maximum description length
- `DATE_FORMAT_OPTIONS` - Date formatting options
- `PLACEHOLDER_IMAGES` - Placeholder image URLs
- `ANIMATION_CONFIG` - Animation configuration

**Usage**:
```typescript
import { UI_CONFIG, PLACEHOLDER_IMAGES } from '@/constants/ui'

// Use in components
const isMobile = window.innerWidth < UI_CONFIG.mobileBreakpoint
const placeholderImage = PLACEHOLDER_IMAGES.book
```

### `messages.ts` - Message Constants

**Purpose**: Contains all user-facing messages and error handling.

**Contents**:
- `ERROR_MESSAGES` - Error message constants
- `SUCCESS_MESSAGES` - Success message constants
- `LOADING_MESSAGES` - Loading message constants
- `EMPTY_STATE_MESSAGES` - Empty state messages
- `VALIDATION_MESSAGES` - Form validation messages

**Usage**:
```typescript
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/messages'

// Use in error handling
if (error) {
  toast.error(ERROR_MESSAGES.fetchFailed)
}

// Use in success handling
if (success) {
  toast.success(SUCCESS_MESSAGES.downloadSuccess)
}
```

### `lib/mock-data.ts` - Mock Data

**Purpose**: Centralized mock data for development and testing.

**Contents**:
- `FALLBACK_DATA` - Fallback data object
  - `books` - Mock book data
  - `authors` - Mock author data
  - `giveaways` - Mock giveaway data

**Usage**:
```typescript
import { FALLBACK_DATA } from '@/lib/mock-data'

// Use as fallback data
const books = data?.books || FALLBACK_DATA.books
```

## 🔧 Adding New Constants

1. **Determine the appropriate file**:
   - Common constants → `shared.ts`
   - Filter-related → `filters.ts`
   - API-related → `api.ts`
   - UI-related → `ui.ts`
   - Messages → `messages.ts`

2. **Add the constant with proper typing**:
```typescript
// In the appropriate file
export const NEW_CONSTANT = {
  option1: "value1",
  option2: "value2"
} as const

// Add type definition
export type NewConstant = typeof NEW_CONSTANT
```

3. **Re-export from main index.ts**:
```typescript
// In constants/index.ts
export * from './filters'
export * from './api'
// ... other exports
```

## 🎯 Best Practices

### 1. Use Type-Safe Constants

```typescript
// ✅ Good - Type-safe
const genre: string = SHARED_GENRES[0]

// ❌ Avoid - Magic strings
const genre: string = "Fantasy"
```

### 2. Import What You Need

```typescript
// ✅ Good - Specific imports
import { SHARED_GENRES } from '@/constants/shared'

// ❌ Avoid - Importing everything
import * as Constants from '@/constants'
```

### 3. Use Constants in Components

```typescript
// ✅ Good - Using constants
const FilterComponent = () => {
  const [selectedGenre, setSelectedGenre] = useState(SHARED_GENRES[0])
  
  return (
    <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
      {SHARED_GENRES.map(genre => (
        <option key={genre} value={genre}>{genre}</option>
      ))}
    </select>
  )
}
```

### 4. Maintain Consistency

```typescript
// ✅ Good - Consistent naming
export const SHARED_GENRES = ["Fantasy", "Romance", "Mystery"] as const
export const SHARED_SORT_OPTIONS = { newest: "newest", trending: "trending" } as const

// ❌ Avoid - Inconsistent naming
export const genres = ["Fantasy", "Romance", "Mystery"]
export const SORT_OPTIONS = { newest: "newest", trending: "trending" }
```

## 🚀 Advanced Usage

### Custom Hooks with Constants

```typescript
import { useMemo } from 'react'
import { SHARED_GENRES, FILTER_OPTIONS } from '@/constants'

export const useFilterOptions = () => {
  return useMemo(() => ({
    genres: SHARED_GENRES.map(genre => ({ value: genre, label: genre })),
    sortOptions: Object.keys(FILTER_OPTIONS.sortOptions),
    // ... other options
  }), [])
}
```

### Environment-Specific Constants

```typescript
// In constants/api.ts
export const API_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.booksweeps.com' 
    : 'http://localhost:3000/api',
  timeout: 10000,
  retryAttempts: 3
} as const
```

### Dynamic Constants

```typescript
// In constants/ui.ts
export const getResponsiveConfig = (screenSize: 'mobile' | 'tablet' | 'desktop') => {
  const configs = {
    mobile: { columns: 1, itemsPerPage: 10 },
    tablet: { columns: 2, itemsPerPage: 20 },
    desktop: { columns: 3, itemsPerPage: 30 }
  }
  return configs[screenSize]
}
```

## 🧪 Testing Constants

### Unit Tests

```typescript
import { SHARED_GENRES, API_CONFIG } from '@/constants'

describe('Constants', () => {
  test('SHARED_GENRES should contain expected genres', () => {
    expect(SHARED_GENRES).toContain('Fantasy')
    expect(SHARED_GENRES).toContain('Romance')
  })

  test('API_CONFIG should have valid configuration', () => {
    expect(API_CONFIG.defaultLimit).toBeGreaterThan(0)
    expect(API_CONFIG.maxLimit).toBeGreaterThan(API_CONFIG.defaultLimit)
  })
})
```

### Integration Tests

```typescript
import { render, screen } from '@testing-library/react'
import { FILTER_OPTIONS } from '@/constants'
import FilterComponent from './FilterComponent'

test('FilterComponent should render all genre options', () => {
  render(<FilterComponent />)
  
  FILTER_OPTIONS.genres.forEach(genre => {
    expect(screen.getByText(genre)).toBeInTheDocument()
  })
})
```

## 🔍 Troubleshooting

### Common Issues

1. **Import Errors**:
   ```typescript
   // ❌ Error: Module not found
   import { SHARED_GENRES } from '@/constants/shared'
   
   // ✅ Solution: Check file path and export
   import { SHARED_GENRES } from '@/constants'
   ```

2. **Type Errors**:
   ```typescript
   // ❌ Error: Type mismatch
   const genre: string = SHARED_GENRES[0] // SHARED_GENRES is readonly
   
   // ✅ Solution: Use proper typing
   const genre: typeof SHARED_GENRES[number] = SHARED_GENRES[0]
   ```

3. **Circular Dependencies**:
   ```typescript
   // ❌ Avoid: Circular imports
   // constants/shared.ts imports from constants/filters.ts
   // constants/filters.ts imports from constants/shared.ts
   
   // ✅ Solution: Use shared constants in shared.ts
   // Import shared constants in other files
   ```

## 📈 Performance Considerations

### Bundle Size Optimization

- Constants are tree-shakeable
- Import only what you need
- Use `as const` for better TypeScript inference

### Runtime Performance

- Constants are evaluated at build time
- No runtime overhead for constant access
- Use `useMemo` for derived constants

## 🔮 Future Enhancements

### Planned Features

1. **Environment-Specific Constants**
   - Development, staging, production configs
   - Feature flags
   - A/B testing constants

2. **Dynamic Constants**
   - Runtime configuration
   - User preferences
   - Localization constants

3. **Validation**
   - Runtime validation with Zod
   - Type guards
   - Constant validation utilities

## 🎨 Best Practices

- ✅ Use constants instead of magic strings
- ✅ Import only what you need
- ✅ Use proper TypeScript typing with `as const`
- ✅ Keep constants immutable
- ❌ Don't modify constants at runtime
- ❌ Don't create circular dependencies
- ❌ Don't use magic strings instead of constants

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Import error | Check file path and export |
| Type error | Use proper typing with `as const` |
| Circular dependency | Use shared constants in `shared.ts` |
| Missing constant | Check if it's re-exported in `index.ts` |

## 📈 Performance

- Constants are tree-shakeable
- Import only what you need
- Use `as const` for better TypeScript inference
- No runtime overhead for constant access

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Status**: Production Ready ✅
