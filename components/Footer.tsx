import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer 
      className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-12 transition-colors"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6 text-orange-500" aria-hidden="true" />
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">BookSweeps</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Connecting readers with amazing books through author giveaways.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">For Readers</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/free-books" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded">
                  Free Books
                </Link>
              </li>
              <li>
                <Link href="/giveaways" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded">
                  Browse Giveaways
                </Link>
              </li>
              <li>
                <Link href="/authors" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded">
                  Authors
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded">
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">For Authors</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/campaigns/create" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded">
                  Create Campaign
                </Link>
              </li>
              <li>
                <Link href="/author-tools" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded">
                  Author Tools
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/help" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2025 BookSweeps. All rights reserved. Built with ❤️ for book lovers.</p>
        </div>
      </div>
    </footer>
  );
}
