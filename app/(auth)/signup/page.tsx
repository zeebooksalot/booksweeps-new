'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import { validateEmail, validatePassword, detectMaliciousInput } from '@/lib/validation'
import { PasswordStrength } from '@/components/ui/password-strength'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { signUp } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    
    // Comprehensive input validation
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setErrorMessage(emailValidation.errors[0])
      return
    }
    
    const passwordValidation = validatePassword(password, email)
    if (!passwordValidation.valid) {
      setErrorMessage(passwordValidation.errors[0])
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      return
    }
    
    // Security check for malicious input
    const emailThreats = detectMaliciousInput(email)
    const passwordThreats = detectMaliciousInput(password, true) // Allow special characters in passwords
    
    if (emailThreats.malicious || passwordThreats.malicious) {
      console.warn('Malicious input detected during signup:', { 
        email: emailThreats.threats, 
        password: passwordThreats.threats 
      })
      setErrorMessage('Invalid input detected. Please check your information.')
      return
    }
    
    setLoading(true)
    
    try {
      // Sign up with reader as default user type using sanitized input
      await signUp(emailValidation.sanitized!, passwordValidation.sanitized!, { user_type: 'reader' })
      toast({ title: 'Account created', description: 'Welcome to BookSweeps!' })
      router.push('/dashboard')
    } catch (error) {
      const message = (error as Error).message || 'Signup failed'
      setErrorMessage(message)
      toast({ title: 'Signup failed', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Create your account</h1>
            <p className="mt-2 text-14 text-gray-600 dark:text-gray-400">Join BookSweeps and start exploring</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} aria-labelledby="signup-title">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="h-11 w-full rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-gray-700 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:border-orange-500"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-describedby={errorMessage ? "error-message" : undefined}
                aria-invalid={!!errorMessage}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="h-11 w-full rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-gray-700 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:border-orange-500"
                placeholder="Create a password (minimum 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby={errorMessage ? "error-message" : "password-requirements"}
                aria-invalid={!!errorMessage}
              />
              <PasswordStrength 
                password={password} 
                email={email} 
                className="mt-2"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="h-11 w-full rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-gray-700 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:border-orange-500"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-describedby={errorMessage ? "error-message" : undefined}
                aria-invalid={!!errorMessage}
              />
            </div>

            {errorMessage && (
              <div 
                id="error-message"
                className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200" 
                role="alert" 
                aria-live="polite"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-full bg-orange-500 text-white text-14 font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              aria-describedby={errorMessage ? "error-message" : undefined}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <div className="text-center text-14 text-gray-600 dark:text-gray-400">
              <span>Already have an account? </span>
              <Link href="/login" className="text-orange-600 hover:text-orange-700 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 