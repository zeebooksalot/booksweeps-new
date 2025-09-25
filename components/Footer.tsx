import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer 
      className="bg-background border-t border-border py-12 transition-colors"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-6xl px-4 lg:px-0">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-8 w-full">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6 text-accent" aria-hidden="true" />
              <span className="text-lg font-bold text-foreground">BookSweeps</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Connecting readers with amazing books through author giveaways since 2016.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">For Readers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/free-ebooks" className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background rounded">
                  Free Ebooks
                </Link>
              </li>
              <li>
                <Link href="/giveaways" className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background rounded">
                  Browse Giveaways
                </Link>
              </li>
              <li>
                <Link href="/authors" className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background rounded">
                  Authors
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background rounded">
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">For Authors</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/campaigns/create" className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background rounded">
                  Create Campaign
                </Link>
              </li>
              <li>
                <Link href="/author-tools" className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background rounded">
                  Author Tools
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background rounded">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/help" className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background rounded">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background rounded">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background rounded">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Our Brands</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background rounded">
                  BookSweeps
                </Link>
              </li>
              <li>
                <Link href="https://authorletters.com" className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background rounded">
                  AuthorLetters
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 BookSweeps. All rights reserved. Built with ❤️ for book lovers.</p>
        </div>
      </div>
    </footer>
  );
}
