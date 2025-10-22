import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuthorNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Author Not Found
      </h1>
      <p className="text-gray-600 mb-8">
        The author you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link href="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
