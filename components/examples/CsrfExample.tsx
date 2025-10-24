'use client'

import { useState } from 'react'
import { useCsrf } from '@/hooks/useCsrf'

export function CsrfExample() {
  const { csrfToken, fetchWithCsrf, isLoading } = useCsrf()
  const [formData, setFormData] = useState({ title: '', description: '' })
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!csrfToken) {
      setSubmitStatus('error')
      return
    }

    setSubmitStatus('loading')

    try {
      const response = await fetchWithCsrf('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ title: '', description: '' })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
    }
  }

  if (isLoading) {
    return <div>Loading CSRF token...</div>
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create Book (CSRF Protected)</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={submitStatus === 'loading' || !csrfToken}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitStatus === 'loading' ? 'Creating...' : 'Create Book'}
        </button>
      </form>

      {submitStatus === 'success' && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
          Book created successfully!
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {!csrfToken ? 'CSRF token not available' : 'Failed to create book'}
        </div>
      )}

      {csrfToken && (
        <div className="mt-4 p-3 bg-gray-100 text-gray-600 rounded-md text-sm">
          <strong>CSRF Token:</strong> {csrfToken.substring(0, 16)}...
        </div>
      )}
    </div>
  )
}
