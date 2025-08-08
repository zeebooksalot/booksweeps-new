export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-md w-full rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page not found</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">We couldn’t find what you’re looking for.</p>
        <a href="/" className="h-10 px-4 inline-flex items-center rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">
          Back to home
        </a>
      </div>
    </div>
  )
}