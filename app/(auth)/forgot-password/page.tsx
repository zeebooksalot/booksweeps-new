'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address')
      }

      if (!supabase) throw new Error('Supabase client not initialized')
      const redirectTo = `${window.location.origin}/update-password`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (resetError) throw resetError
      setSent(true)
      toast({ title: 'Email sent', description: 'Check your inbox for a reset link.' })
    } catch (err) {
      const message = (err as Error).message || 'Failed to send reset email'
      setError(message)
      toast({ title: 'Failed to send email', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Forgot your password?</h1>
            <p className="mt-2 text-14 text-gray-600 dark:text-gray-400">Enter your email to receive a reset link.</p>
          </div>

          {sent ? (
            <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-700">
              If an account exists for {email}, a reset link has been sent. Please check your inbox.
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="h-11 w-full rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-gray-700 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-orange-500"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-full bg-orange-500 text-white text-14 font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}