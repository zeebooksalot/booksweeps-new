# BookSweeps Platform

A modern book discovery and voting platform built with Next.js 14, TypeScript, and Supabase.

## 🚀 Features

- **Book Discovery**: Browse and discover new books and authors
- **Voting System**: Vote on books and pen names
- **Reader Magnets**: Secure download system with rate limiting
- **Giveaway Campaigns**: Complete campaign management system
- **SSR-Compatible Authentication**: Robust auth system with cookie + localStorage support
- **CSRF Protection**: Comprehensive Cross-Site Request Forgery protection for all state-changing operations
- **Cross-Domain Authentication**: Seamless auth across subdomains
- **Responsive Design**: Mobile-first approach with beautiful UI
- **Real-time Updates**: Powered by Supabase
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Built with shadcn/ui components
- **Enterprise Security**: Rate limiting, validation, duplicate prevention, comprehensive input sanitization

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Authentication**: Supabase Auth with SSR-compatible clients and CSRF protection
- **Deployment**: Netlify
- **State Management**: React hooks
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zeebooksalot/booksweeps-new.git
   cd booksweeps-new
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

1. **Create Supabase project** at [supabase.com](https://supabase.com)
2. **Run the voting migration** in your Supabase SQL Editor:
   ```sql
   -- Copy the contents of supabase/migrations/006_voting_system.sql
   ```
3. **Set up environment variables** with your Supabase credentials

## 🔒 Security Features

The platform includes comprehensive security measures:

- **SSR-Compatible Authentication**: Cookie + localStorage session management
- **CSRF Protection**: Comprehensive Cross-Site Request Forgery protection with user-specific tokens
- **Input Validation**: Comprehensive validation with XSS, SQL injection, and path traversal detection
- **Rate Limiting**: Multi-layer rate limiting for API endpoints and downloads
- **File Security**: File type validation, content analysis, and secure download URLs
- **Security Headers**: CSP, HSTS, X-Frame-Options, and other security headers
- **Row Level Security**: Database-level access control with RLS policies
- **Error Handling**: Sanitized error responses and comprehensive logging

## 🚀 Deployment

### Netlify Deployment

1. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18

3. **Set environment variables**
   In Netlify dashboard → Site settings → Environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Deploy**
   - Netlify will automatically deploy on every push to main
   - Your site will be available at `https://your-site-name.netlify.app`

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Vercel: `vercel --prod`
   - Netlify CLI: `netlify deploy --prod`
   - Or upload the `.next` folder to your hosting provider

## �� Project Structure

```
booksweeps-new/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── author-card.tsx   # Author card component
│   └── book-card.tsx     # Book card component
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client
│   ├── rate-limiter.ts   # Rate limiting system
│   ├── validation.ts     # Input validation
│   └── error-handler.ts  # Error handling
├── md/                   # Documentation
│   ├── README.md         # Main documentation
│   ├── SECURITY_AND_PERFORMANCE.md # Security & performance details
│   ├── DATABASE_SCHEMA.md # Database documentation
│   └── PROJECT_VISION.md # Project vision
├── public/               # Static assets
├── scripts/              # Build and migration scripts
└── styles/               # Additional styles
```

## 📚 Documentation

- **[README.md](md/README.md)** - Main project documentation
- **[Security & Performance](md/SECURITY_AND_PERFORMANCE.md)** - Security features and performance optimizations
- **[Database Schema](md/DATABASE_SCHEMA.md)** - Complete database documentation
- **[Project Vision](md/PROJECT_VISION.md)** - Long-term project goals and architecture

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run migrate:voting` - Run voting system migration
- `npm run validate:config` - Validate environment configuration

### API Endpoints

- `GET /api/books` - Get all books
- `POST /api/books` - Create a book
- `GET /api/authors` - Get all authors
- `POST /api/authors` - Create an author
- `POST /api/votes` - Vote on books/authors
- `GET /api/campaigns` - Get campaigns
- `POST /api/entries` - Submit campaign entry
- `GET /api/reader-magnets` - Get reader magnets
- `POST /api/reader-magnets/downloads` - Download books (rate-limited)
- `POST /api/auth/upgrade-user-type` - Upgrade user type

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/zeebooksalot/booksweeps-new/issues) page
2. Create a new issue with detailed information
3. Include your environment and steps to reproduce

## 🎯 Roadmap

- [x] User authentication (✅ Complete)
- [x] Cross-domain authentication (✅ Complete)
- [x] Rate limiting and security (✅ Complete)
- [x] Performance optimization (✅ Complete)
- [x] Duplicate download prevention (✅ Complete)
- [ ] Email notifications
- [ ] Book recommendations
- [ ] Social sharing
- [ ] Admin dashboard
- [ ] Advanced analytics
- [ ] Mobile app

---

Built with ❤️ by the BookSweeps team
