# Development Guidelines

## 🎯 Overview

This document outlines the development standards, best practices, and workflows for the BookSweeps project. Following these guidelines ensures code quality, maintainability, and team collaboration.

## 📋 Table of Contents

- [Code Standards](#code-standards)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Security Best Practices](#security-best-practices)
- [Performance Guidelines](#performance-guidelines)
- [Documentation Standards](#documentation-standards)

## 💻 Code Standards

### TypeScript Guidelines

#### Type Definitions
```typescript
// ✅ Good: Explicit interfaces
interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  created_at: string;
}

// ❌ Bad: Implicit any types
const book = {
  id: "123",
  title: "Book Title"
  // Missing type safety
}
```

#### Component Patterns
```typescript
// ✅ Good: Proper component structure
interface BookCardProps {
  book: Book;
  variant?: 'default' | 'compact';
  onAction?: (book: Book) => void;
}

export function BookCard({ book, variant = 'default', onAction }: BookCardProps) {
  const handleClick = () => {
    onAction?.(book);
  };

  return (
    <div className="book-card" onClick={handleClick}>
      <h3>{book.title}</h3>
      <p>{book.author}</p>
    </div>
  );
}
```

### React Best Practices

#### Hooks Usage
```typescript
// ✅ Good: Custom hooks for reusable logic
export function useBooks(userId: string) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('user_id', userId);
        
        if (error) throw error;
        setBooks(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [userId]);

  return { books, loading, error };
}
```

#### State Management
```typescript
// ✅ Good: Context for global state
interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AppContext.Provider value={{ user, setUser }}>
      {children}
    </AppContext.Provider>
  );
}
```

### CSS/Styling Guidelines

#### Tailwind CSS Usage
```typescript
// ✅ Good: Consistent class ordering
<div className="
  flex items-center justify-between
  p-4 bg-white rounded-lg shadow-md
  hover:shadow-lg transition-shadow duration-200
  dark:bg-gray-800 dark:text-white
">
  {/* Content */}
</div>

// ✅ Good: Component variants
const buttonVariants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
  danger: "bg-red-600 hover:bg-red-700 text-white"
} as const;
```

## 📁 Project Structure

### File Organization
```
booksweeps-new/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Author dashboard
│   ├── books/            # Book management
│   ├── campaigns/        # Campaign management
│   └── api/              # API routes
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                   # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── utils.ts          # Helper functions
│   └── validations.ts    # Zod schemas
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
├── styles/                # Global styles
└── public/               # Static assets
```

### Naming Conventions

#### Files and Folders
```
✅ Good:
- components/ui/Button.tsx
- hooks/useBooks.ts
- lib/supabase.ts
- types/book.ts

❌ Bad:
- components/button.tsx
- hooks/use-books.ts
- lib/Supabase.ts
- types/Book.ts
```

#### Functions and Variables
```typescript
// ✅ Good: Descriptive names
const getUserBooks = async (userId: string) => { /* ... */ };
const isBookAvailable = (book: Book) => book.status === 'active';
const handleBookUpload = (file: File) => { /* ... */ };

// ❌ Bad: Unclear names
const getBooks = async (id: string) => { /* ... */ };
const checkBook = (b: Book) => b.status === 'active';
const upload = (f: File) => { /* ... */ };
```

## 🔄 Development Workflow

### Git Workflow

#### Branch Naming
```
✅ Good:
- feature/add-book-upload
- bugfix/fix-campaign-creation
- hotfix/security-patch
- refactor/improve-performance

❌ Bad:
- feature/new-feature
- bugfix/fix
- update
- changes
```

#### Commit Messages
```
✅ Good:
feat: add book upload functionality
fix: resolve campaign creation error
docs: update API documentation
refactor: improve component performance

❌ Bad:
added stuff
fixed bug
updated docs
changed things
```

### Code Review Process

#### Review Checklist
- [ ] Code follows TypeScript guidelines
- [ ] Components are properly typed
- [ ] Error handling is implemented
- [ ] Tests are included for new features
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Accessibility considerations are met
- [ ] Performance implications are considered

#### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## 🧪 Testing Guidelines

### Unit Testing

#### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { BookCard } from './BookCard';

describe('BookCard', () => {
  const mockBook = {
    id: '1',
    title: 'Test Book',
    author: 'Test Author',
    description: 'Test description'
  };

  it('renders book information correctly', () => {
    render(<BookCard book={mockBook} />);
    
    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('calls onAction when clicked', () => {
    const mockOnAction = jest.fn();
    render(<BookCard book={mockBook} onAction={mockOnAction} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnAction).toHaveBeenCalledWith(mockBook);
  });
});
```

#### Hook Testing
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useBooks } from './useBooks';

describe('useBooks', () => {
  it('fetches books successfully', async () => {
    const { result } = renderHook(() => useBooks('user-123'));
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.books).toHaveLength(2);
  });
});
```

### Integration Testing

#### API Route Testing
```typescript
import { createMocks } from 'node-mocks-http';
import handler from './api/books';

describe('/api/books', () => {
  it('creates a book successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        title: 'Test Book',
        author: 'Test Author'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toMatchObject({
      success: true,
      data: {
        title: 'Test Book',
        author: 'Test Author'
      }
    });
  });
});
```

### E2E Testing

#### User Flow Testing
```typescript
import { test, expect } from '@playwright/test';

test('author can create and publish a book', async ({ page }) => {
  // Login as author
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'author@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login-button"]');

  // Navigate to book creation
  await page.goto('/dashboard/books/new');
  
  // Fill book form
  await page.fill('[data-testid="book-title"]', 'My New Book');
  await page.fill('[data-testid="book-author"]', 'Author Name');
  await page.fill('[data-testid="book-description"]', 'Book description');
  
  // Submit form
  await page.click('[data-testid="submit-button"]');
  
  // Verify success
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

## 🔒 Security Best Practices

### Authentication & Authorization

#### User Input Validation
```typescript
// ✅ Good: Server-side validation
import { z } from 'zod';

const bookSchema = z.object({
  title: z.string().min(1).max(200),
  author: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  genre: z.enum(['Fantasy', 'Romance', 'Mystery', 'Sci-Fi']),
  page_count: z.number().positive().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = bookSchema.parse(body);
    
    // Process validated data
    const { data, error } = await supabase
      .from('books')
      .insert(validatedData);
      
    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid input data' },
      { status: 400 }
    );
  }
}
```

#### Row Level Security
```sql
-- ✅ Good: RLS policies
CREATE POLICY "Users can only access their own books" ON books
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own books" ON books
  FOR UPDATE USING (auth.uid() = user_id);
```

### File Upload Security

#### File Validation
```typescript
// ✅ Good: File type and size validation
const ALLOWED_FILE_TYPES = ['application/epub+zip', 'application/pdf'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function validateFile(file: File): string | null {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return 'Invalid file type. Only EPUB and PDF files are allowed.';
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return 'File too large. Maximum size is 50MB.';
  }
  
  return null;
}
```

## ⚡ Performance Guidelines

### Frontend Optimization

#### Code Splitting
```typescript
// ✅ Good: Lazy loading components
import dynamic from 'next/dynamic';

const BookReader = dynamic(() => import('./BookReader'), {
  loading: () => <div>Loading reader...</div>,
  ssr: false
});

const Analytics = dynamic(() => import('./Analytics'), {
  loading: () => <div>Loading analytics...</div>
});
```

#### Image Optimization
```typescript
// ✅ Good: Next.js Image component
import Image from 'next/image';

export function BookCover({ book }: { book: Book }) {
  return (
    <Image
      src={book.cover_image_url}
      alt={`Cover for ${book.title}`}
      width={200}
      height={300}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  );
}
```

### Database Optimization

#### Query Optimization
```typescript
// ✅ Good: Efficient queries with proper joins
const { data: books } = await supabase
  .from('books')
  .select(`
    *,
    pen_names(name, bio),
    campaigns(count)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(20);

// ❌ Bad: N+1 query problem
const books = await getBooks(userId);
for (const book of books) {
  book.pen_name = await getPenName(book.pen_name_id);
}
```

#### Caching Strategy
```typescript
// ✅ Good: React Query for caching
import { useQuery } from '@tanstack/react-query';

export function useBooks(userId: string) {
  return useQuery({
    queryKey: ['books', userId],
    queryFn: () => fetchBooks(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

## 📚 Documentation Standards

### Code Documentation

#### Function Documentation
```typescript
/**
 * Fetches books for a specific user with optional filtering
 * @param userId - The ID of the user to fetch books for
 * @param options - Optional filtering and pagination options
 * @returns Promise resolving to an array of books
 * @throws {Error} When user is not found or database error occurs
 */
export async function getUserBooks(
  userId: string,
  options?: {
    status?: 'active' | 'draft' | 'archived';
    limit?: number;
    offset?: number;
  }
): Promise<Book[]> {
  // Implementation
}
```

#### Component Documentation
```typescript
/**
 * Displays a book card with cover image, title, and author
 * 
 * @example
 * ```tsx
 * <BookCard
 *   book={book}
 *   variant="featured"
 *   onAction={(book) => console.log('Book clicked:', book)}
 * />
 * ```
 */
interface BookCardProps {
  /** The book data to display */
  book: Book;
  /** Visual variant of the card */
  variant?: 'default' | 'compact' | 'featured';
  /** Callback when card is clicked */
  onAction?: (book: Book) => void;
}
```

### README Standards

#### Project README Structure
```markdown
# BookSweeps

Brief description of the project.

## Features

- Feature 1
- Feature 2
- Feature 3

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run linter

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) for details.
```

## 🚀 Deployment Guidelines

### Environment Configuration

#### Environment Variables
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Optional
NEXT_PUBLIC_SITE_URL=https://booksweeps.com
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

#### Deployment Checklist
- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] File storage configured
- [ ] Domain settings updated
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup strategy in place

### Monitoring & Debugging

#### Error Tracking
```typescript
// ✅ Good: Structured error logging
import * as Sentry from '@sentry/nextjs';

export function logError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
    tags: {
      component: 'BookUpload',
      user_id: context?.userId
    }
  });
}
```

#### Performance Monitoring
```typescript
// ✅ Good: Performance tracking
export function trackBookUpload(duration: number, fileSize: number) {
  analytics.track('book_upload_completed', {
    duration,
    file_size: fileSize,
    timestamp: new Date().toISOString()
  });
}
```

---

*These guidelines ensure consistent, maintainable, and high-quality code across the BookSweeps project.* 