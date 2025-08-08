'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // On this page, Supabase should set a temporary session via the recovery link
    // No-op here, but we could verify params if needed
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      const msg = 'Password must be at least 8 characters long'
      setError(msg)
      toast({ title: 'Invalid password', description: msg, variant: 'destructive' })
      return
    }

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match'
      setError(msg)
      toast({ title: 'Mismatch', description: msg, variant: 'destructive' })
      return
    }

    setLoading(true)

    try {
      if (!supabase) throw new Error('Supabase client not initialized')
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setSuccess(true)
      toast({ title: 'Password updated', description: 'Redirecting to login...' })
      setTimeout(() => router.push('/login'), 1200)
    } catch (err) {
      const msg = (err as Error).message || 'Failed to update password'
      setError(msg)
      toast({ title: 'Update failed', description: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Set a new password</h1>
            <p className="mt-2 text-14 text-gray-600 dark:text-gray-400">Enter and confirm your new password below.</p>
          </div>

          {success ? (
            <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-700">
              Password updated. Redirecting to login...
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="sr-only">New Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="h-11 w-full rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-gray-700 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-orange-500"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="sr-only">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="h-11 w-full rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-gray-700 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-orange-500"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}