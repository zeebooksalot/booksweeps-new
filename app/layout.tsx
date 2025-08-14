import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/AuthProvider"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "BookSweeps - Discover Amazing Books & Authors",
    template: "%s | BookSweeps"
  },
  description: "Join BookSweeps to discover trending books, vote on your favorites, and enter author giveaways. Find your next great read today!",
  keywords: [
    "books", "authors", "giveaways", "reading", "book discovery", 
    "free books", "book recommendations", "author interviews", 
    "book community", "reading list", "book voting"
  ],
  authors: [{ name: "BookSweeps Team" }],
  creator: "BookSweeps",
  publisher: "BookSweeps",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://booksweeps.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://booksweeps.com",
    title: "BookSweeps - Discover Amazing Books & Authors",
    description: "Join BookSweeps to discover trending books, vote on your favorites, and enter author giveaways. Find your next great read today!",
    siteName: "BookSweeps",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BookSweeps - Discover Amazing Books",
        type: "image/jpeg",
      },
      {
        url: "/og-image-square.jpg",
        width: 600,
        height: 600,
        alt: "BookSweeps Logo",
        type: "image/jpeg",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BookSweeps - Discover Amazing Books & Authors",
    description: "Join BookSweeps to discover trending books, vote on your favorites, and enter author giveaways.",
    images: ["/og-image.jpg"],
    creator: "@booksweeps",
    site: "@booksweeps",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_CODE,
    yandex: process.env.YANDEX_VERIFICATION_CODE,
    yahoo: process.env.YAHOO_VERIFICATION_CODE,
  },
  category: "books",
  classification: "book discovery platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BookSweeps",
    "description": "Discover amazing books and authors through giveaways",
    "url": "https://booksweeps.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://booksweeps.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "BookSweeps",
      "logo": {
        "@type": "ImageObject",
        "url": "https://booksweeps.com/logo.png"
      }
    },
    "sameAs": [
      "https://twitter.com/booksweeps",
      "https://facebook.com/booksweeps"
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
        <meta name="msapplication-TileColor" content="#f97316" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            <ThemeProvider defaultTheme="system">
              {children}
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
