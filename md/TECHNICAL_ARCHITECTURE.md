# Technical Architecture

## 🏗️ System Overview

BookSweeps is built as a modern, scalable web application using Next.js 14 with App Router, Supabase for backend services, and a microservices architecture designed for cross-domain functionality.

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom Components
- **State Management**: React Hooks + Context
- **Forms**: React Hook Form + Zod validation

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Edge Functions**: Supabase Edge Functions

### Infrastructure
- **Hosting**: Vercel (Frontend) + Supabase (Backend)
- **CDN**: Vercel Edge Network
- **Domain Management**: Custom domains with subdomains
- **Monitoring**: Vercel Analytics + Supabase Logs

## 🌐 Cross-Domain Architecture

### Domain Structure
```
app.booksweeps.com    → Author Platform
booksweeps.com        → Reader Hub (Public)
read.booksweeps.com   → Reading App
```

### Authentication Strategy
- **Single Supabase Project**: All domains share the same Supabase project
- **Shared Sessions**: User sessions work across all subdomains
- **CORS Configuration**: Properly configured for cross-domain requests
- **Session Persistence**: Local storage + cookies for seamless navigation

### Database Schema
```sql
-- Core user table with dual account support
users (
  id: uuid,
  email: text,
  user_type: 'author' | 'reader' | 'both',
  -- ... other fields
)

-- Platform-specific data
books, campaigns, reader_library, etc.
```

## 📁 Project Structure

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
│   └── forms/            # Form components
├── lib/                   # Utility functions
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Helper functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
└── public/               # Static assets
```

## 🔐 Security Architecture

### Authentication & Authorization
- **Row Level Security (RLS)**: Database-level security policies
- **JWT Tokens**: Secure session management
- **Role-based Access**: User type determines permissions
- **API Security**: Rate limiting and input validation

### Data Protection
- **Encryption**: Sensitive data encrypted at rest
- **File Security**: Virus scanning for uploads
- **Privacy**: GDPR-compliant data handling
- **Audit Logs**: Track all user actions

### CORS Configuration
```typescript
// Supabase configuration for cross-domain
const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}
```

## 📊 Database Design

### Core Tables
1. **users** - User accounts with dual functionality
2. **books** - Book metadata and content
3. **campaigns** - Giveaway campaigns
4. **reader_entries** - Campaign entries
5. **reader_library** - User's book collection
6. **reading_progress** - Reading tracking

### Key Relationships
```sql
-- User owns books and campaigns
books.user_id → users.id
campaigns.user_id → users.id

-- Readers interact with content
reader_entries.user_id → users.id
reader_library.reader_id → users.id

-- Books are delivered to readers
reader_deliveries.book_id → books.id
reader_deliveries.reader_id → users.id
```

## 🚀 Deployment Strategy

### Environment Configuration
```bash
# Production
NEXT_PUBLIC_SUPABASE_URL=https://yomnitxefrkuvnbnbhut.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Development
NEXT_PUBLIC_SUPABASE_URL=https://yomnitxefrkuvnbnbhut.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_dev_anon_key
```

### Deployment Pipeline
1. **Development**: Local development with Supabase CLI
2. **Staging**: Vercel preview deployments
3. **Production**: Automated deployment from main branch

### Domain Configuration
```nginx
# Nginx configuration for subdomains
server {
    listen 80;
    server_name app.booksweeps.com;
    # Author platform
}

server {
    listen 80;
    server_name booksweeps.com;
    # Reader hub
}

server {
    listen 80;
    server_name read.booksweeps.com;
    # Reading app
}
```

## 🔄 Data Flow

### Author Platform Flow
```
1. Author uploads book → Supabase Storage
2. Creates campaign → Database
3. Shares link → booksweeps.com/m/[slug]
4. Reader enters → Email captured
5. Book delivered → Reader library
6. Analytics tracked → Author dashboard
```

### Reader Platform Flow
```
1. Reader discovers book → booksweeps.com
2. Enters giveaway → Database entry
3. Wins/downloads → File delivery
4. Added to library → read.booksweeps.com
5. Reads book → Progress tracked
6. Syncs across devices → Real-time updates
```

## 📱 Mobile Strategy

### Progressive Web App (PWA)
- **Offline Support**: Cache essential resources
- **Installable**: Add to home screen
- **Push Notifications**: Campaign updates
- **Background Sync**: Progress synchronization

### Responsive Design
- **Mobile-First**: Optimized for mobile reading
- **Touch-Friendly**: Large touch targets
- **Fast Loading**: Optimized images and assets
- **Accessibility**: WCAG 2.1 compliance

## 🔧 Development Patterns

### Component Architecture
```typescript
// Reusable component pattern
interface BookCardProps {
  book: Book;
  variant?: 'default' | 'compact' | 'featured';
  onAction?: (book: Book) => void;
}

export function BookCard({ book, variant = 'default', onAction }: BookCardProps) {
  // Component implementation
}
```

### API Route Pattern
```typescript
// API route with error handling
export async function POST(request: Request) {
  try {
    const { data, error } = await supabase
      .from('books')
      .insert(bookData);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
}
```

### Database Query Pattern
```typescript
// Optimized query with proper error handling
export async function getBooksByAuthor(userId: string) {
  const { data, error } = await supabase
    .from('books')
    .select(`
      *,
      pen_names(name, bio),
      campaigns(count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
```

## 🧪 Testing Strategy

### Unit Testing
- **Components**: React Testing Library
- **Functions**: Jest
- **API Routes**: Supertest

### Integration Testing
- **Database**: Supabase test environment
- **Authentication**: Mock auth flows
- **File Uploads**: Test storage operations

### E2E Testing
- **User Flows**: Playwright
- **Cross-Domain**: Test subdomain navigation
- **Mobile**: Responsive testing

## 📈 Performance Optimization

### Frontend Optimization
- **Code Splitting**: Route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: Static generation where possible

### Backend Optimization
- **Database Indexes**: Optimized queries
- **Connection Pooling**: Efficient database connections
- **CDN**: Global content delivery
- **Caching**: Redis for frequently accessed data

## 🔍 Monitoring & Analytics

### Application Monitoring
- **Error Tracking**: Sentry integration
- **Performance**: Vercel Analytics
- **Uptime**: Status page monitoring
- **Logs**: Centralized logging

### Business Analytics
- **User Behavior**: Custom analytics
- **Conversion Tracking**: Campaign performance
- **Revenue Metrics**: Subscription tracking
- **A/B Testing**: Feature experimentation

## 🔄 CI/CD Pipeline

### Development Workflow
```yaml
# GitHub Actions workflow
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
```

### Quality Gates
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Testing**: Automated test suite
- **Security**: Dependency scanning

## 🚀 Scaling Strategy

### Horizontal Scaling
- **Load Balancing**: Multiple server instances
- **Database**: Read replicas for analytics
- **CDN**: Global content distribution
- **Caching**: Redis cluster

### Vertical Scaling
- **Database**: Upgrade instance sizes
- **Storage**: Increase storage capacity
- **Bandwidth**: Higher bandwidth limits
- **Compute**: More powerful servers

## 🔮 Future Technical Considerations

### Microservices Evolution
- **API Gateway**: Centralized API management
- **Service Mesh**: Inter-service communication
- **Event Sourcing**: CQRS pattern implementation
- **Message Queues**: Asynchronous processing

### Advanced Features
- **Real-time Collaboration**: WebSocket connections
- **AI Integration**: Machine learning features
- **Blockchain**: Digital rights management
- **IoT Integration**: Smart device connectivity

---

*This technical architecture document serves as the foundation for all development decisions and system design choices.* 