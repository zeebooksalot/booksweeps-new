'use client'

import { useState } from 'react'
import { useApiClient } from '@/hooks/use-api-client'
import { useApiErrorHandler } from '@/hooks/use-api-error-handler'
import { LoadingState, SkeletonLoading, AsyncContent, LoadingButton } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, Plus, Trash2, Edit } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  description: string
}

export function EnhancedApiExample() {
  const [books, setBooks] = useState<Book[]>([])
  const [newBook, setNewBook] = useState({ title: '', author: '', description: '' })

  // Example 1: Using the comprehensive API client
  const apiClient = useApiClient({
    baseURL: '/api',
    timeout: 10000,
    retries: 3,
    showToast: true
  })

  // Example 2: Using the error handler hook
  const errorHandler = useApiErrorHandler({
    showToast: true,
    maxRetries: 3,
    onError: (error) => console.error('API Error:', error),
    onSuccess: () => console.log('Operation successful')
  })

  // Fetch books with error handling
  const fetchBooks = async () => {
    const result = await apiClient.get<Book[]>('/books')
    if (result) {
      setBooks(result)
    }
  }

  // Create book with error handling
  const createBook = async () => {
    const result = await apiClient.post<Book>('/books', newBook)
    if (result) {
      setBooks(prev => [...prev, result])
      setNewBook({ title: '', author: '', description: '' })
    }
  }

  // Delete book with error handling
  const deleteBook = async (id: string) => {
    const result = await apiClient.delete(`/books/${id}`)
    if (result) {
      setBooks(prev => prev.filter(book => book.id !== id))
    }
  }

  // Example of using the error handler directly
  const handleDirectError = async () => {
    await errorHandler.executeWithErrorHandling(async () => {
      // Simulate an API call that might fail
      const response = await fetch('/api/simulate-error')
      if (!response.ok) {
        throw new Error('Simulated error for demonstration')
      }
      return response.json()
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced API Error Handling Examples</CardTitle>
          <CardDescription>
            Demonstrating improved error handling, loading states, and retry mechanisms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Example 1: Loading State with Skeleton */}
          <div>
            <h3 className="text-lg font-semibold mb-4">1. Loading States with Skeletons</h3>
            <LoadingState
              isLoading={apiClient.isLoading}
              error={apiClient.error}
              onRetry={fetchBooks}
              fallback={<SkeletonLoading count={3} variant="card" />}
              errorFallback={
                <ErrorState
                  title="Failed to load books"
                  message="Unable to fetch books from the server"
                  onRetry={fetchBooks}
                />
              }
            >
              <div className="grid gap-4">
                {books.map(book => (
                  <Card key={book.id}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold">{book.title}</h4>
                      <p className="text-sm text-gray-600">by {book.author}</p>
                      <p className="text-sm mt-2">{book.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </LoadingState>
          </div>

          {/* Example 2: Async Content Component */}
          <div>
            <h3 className="text-lg font-semibold mb-4">2. Async Content with Error Handling</h3>
            <AsyncContent
              data={books}
              isLoading={apiClient.isLoading}
              error={apiClient.error}
              onRetry={fetchBooks}
              fallback={<SkeletonLoading count={2} variant="list" />}
              errorFallback={
                <ErrorState
                  title="Books unavailable"
                  message="Could not load books"
                  onRetry={fetchBooks}
                  variant="compact"
                />
              }
            >
              {(data) => (
                <div className="space-y-2">
                  {data.map(book => (
                    <div key={book.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{book.title}</h4>
                        <p className="text-sm text-gray-600">by {book.author}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBook(book.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </AsyncContent>
          </div>

          {/* Example 3: Loading Buttons */}
          <div>
            <h3 className="text-lg font-semibold mb-4">3. Loading Buttons with Retry</h3>
            <div className="flex gap-4">
              <LoadingButton
                isLoading={apiClient.isLoading}
                loadingText="Loading books..."
                onClick={fetchBooks}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Books
              </LoadingButton>

              <LoadingButton
                isLoading={errorHandler.isLoading}
                loadingText="Testing error..."
                onClick={handleDirectError}
                variant="outline"
              >
                Test Error Handling
              </LoadingButton>
            </div>
          </div>

          {/* Example 4: Form with Error Handling */}
          <div>
            <h3 className="text-lg font-semibold mb-4">4. Form with Comprehensive Error Handling</h3>
            <div className="grid gap-4">
              <Input
                placeholder="Book title"
                value={newBook.title}
                onChange={(e) => setNewBook(prev => ({ ...prev, title: e.target.value }))}
              />
              <Input
                placeholder="Author"
                value={newBook.author}
                onChange={(e) => setNewBook(prev => ({ ...prev, author: e.target.value }))}
              />
              <Input
                placeholder="Description"
                value={newBook.description}
                onChange={(e) => setNewBook(prev => ({ ...prev, description: e.target.value }))}
              />
              <LoadingButton
                isLoading={apiClient.isLoading}
                loadingText="Creating book..."
                onClick={createBook}
                disabled={!newBook.title || !newBook.author}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Book
              </LoadingButton>
            </div>
          </div>

          {/* Example 5: Retry Mechanism */}
          <div>
            <h3 className="text-lg font-semibold mb-4">5. Retry Mechanism</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Retry count: {apiClient.retryCount} / 3
              </p>
              <p className="text-sm text-gray-600">
                Can retry: {apiClient.canRetry ? 'Yes' : 'No'}
              </p>
              {apiClient.hasError && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => apiClient.retry(fetchBooks)}
                    disabled={!apiClient.canRetry}
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry ({apiClient.retryCount}/3)
                  </Button>
                  <Button
                    onClick={apiClient.clearError}
                    variant="outline"
                  >
                    Clear Error
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Example 6: Cache Management */}
          <div>
            <h3 className="text-lg font-semibold mb-4">6. Cache Management</h3>
            <div className="flex gap-2">
              <Button
                onClick={() => apiClient.invalidateCache('/books')}
                variant="outline"
                size="sm"
              >
                Invalidate Books Cache
              </Button>
              <Button
                onClick={apiClient.clearCache}
                variant="outline"
                size="sm"
              >
                Clear All Cache
              </Button>
              <span className="text-sm text-gray-600 self-center">
                Cache size: {apiClient.cacheSize}
              </span>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
