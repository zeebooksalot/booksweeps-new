# BookSweeps Platform

A modern, secure platform for authors and readers to discover and share books, with comprehensive security features and multi-domain support.

## 🚀 Features

- **Enhanced Security**: Multi-layer protection including CSRF protection, failed login tracking, and comprehensive input validation
- **Failed Login Tracking**: Enterprise-grade brute force protection with dual rate limiting (email + IP-based)
- **CSRF Protection**: Comprehensive Cross-Site Request Forgery protection for all state-changing operations
- **SSR-Compatible Authentication**: Robust auth system with cookie + localStorage support
- **Multi-Domain Support**: Seamless operation across main domain and subdomains
- **Real-time Giveaways**: Live giveaway management with instant updates
- **Reader Magnets**: Secure download system with access control
- **Author Dashboard**: Comprehensive author tools and analytics
- **Mobile-First Design**: Responsive design optimized for all devices
- **Performance Optimized**: Fast loading with optimized queries and caching

## 🔒 Security Features

- **Failed Login Tracking**: Dual rate limiting (5 email attempts, 10 IP attempts) with 15-minute lockouts
- **CSRF Protection**: Comprehensive Cross-Site Request Forgery protection with user-specific tokens
- **Input Validation**: Comprehensive XSS, SQL injection, and path traversal protection
- **Rate Limiting**: IP-based and user-based rate limits for API endpoints
- **Row Level Security**: Database-level authorization policies
- **Security Headers**: Comprehensive security headers including CSP, HSTS, and XSS protection
- **Session Management**: Secure cookie-based sessions with automatic refresh
- **Audit Logging**: Comprehensive security event logging and monitoring

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with SSR-compatible clients and CSRF protection
- **Styling**: Tailwind CSS with shadcn/ui components
- **Type Safety**: TypeScript throughout
- **Deployment**: Netlify with automatic builds
- **Security**: Comprehensive validation, rate limiting, and failed login tracking

## 📁 Project Structure

```
booksweeps-new/
├── app/                    # Next.js App Router pages
├── components/            # Reusable React components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── supabase/             # Database migrations and schema
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd booksweeps-new
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Configure your Supabase and other environment variables
   ```

4. **Run database migrations**
   ```bash
   npx supabase db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Development

- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Type Check**: `npm run type-check`

## 📊 Security Status

- ✅ **Failed Login Tracking**: Production ready with dual rate limiting
- ✅ **CSRF Protection**: Active and integrated across all state-changing operations
- ✅ **SSR Authentication**: Fully compatible with middleware and server components
- ✅ **Input Validation**: Comprehensive protection against common attacks
- ✅ **Rate Limiting**: IP and user-based limits implemented
- ✅ **Security Headers**: All critical headers configured

## 🌐 Multi-Domain Support

The platform is designed to work seamlessly across:
- Main domain (booksweeps.com)
- Author subdomain (authors.booksweeps.com)
- Reader subdomain (readers.booksweeps.com)

All security features work consistently across all domains with proper session management and CSRF protection.

## 📈 Performance

- **Build Time**: Optimized for fast builds
- **Runtime**: Efficient queries with proper indexing
- **Security**: Minimal overhead with comprehensive protection
- **Scalability**: Designed for high-traffic scenarios

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

---

**Last Updated**: December 2024  
**Security Status**: Production Ready with Enterprise-Grade Protection
