'use client'

import { useState, useEffect } from 'react'
import { validatePassword, getPasswordStrengthText, getPasswordStrengthColor } from '@/lib/validation'

interface PasswordStrengthProps {
  password: string
  email?: string
  showIndicator?: boolean
  className?: string
}

export function PasswordStrength({ 
  password, 
  email, 
  showIndicator = true, 
  className = '' 
}: PasswordStrengthProps) {
  const [strength, setStrength] = useState<'weak' | 'medium' | 'strong' | 'very-strong'>('weak')
  const [score, setScore] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (password) {
      const validation = validatePassword(password, email)
      setStrength(validation.strength)
      setScore(validation.score)
      setErrors(validation.errors)
    } else {
      setStrength('weak')
      setScore(0)
      setErrors([])
    }
  }, [password, email])

  if (!showIndicator || !password) {
    return null
  }

  const getProgressColor = () => {
    switch (strength) {
      case 'very-strong':
        return 'bg-green-500'
      case 'strong':
        return 'bg-blue-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'weak':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  const getProgressWidth = () => {
    return `${score}%`
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: getProgressWidth() }}
        />
      </div>
      
      {/* Strength text */}
      <div className="flex items-center justify-between text-sm">
        <span className={`font-medium ${getPasswordStrengthColor(strength)}`}>
          {getPasswordStrengthText(strength)}
        </span>
        <span className="text-gray-500">
          {score}/100
        </span>
      </div>
      
      {/* Error messages */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="text-sm text-red-600 flex items-center gap-1">
              <span className="text-red-500">•</span>
              {error}
            </div>
          ))}
        </div>
      )}
      
      {/* Requirements checklist */}
      {password && (
        <div className="space-y-1 text-xs text-gray-600">
          <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
            <span>{password.length >= 8 ? '✓' : '○'}</span>
            At least 8 characters
          </div>
          <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
            <span>{/[A-Z]/.test(password) ? '✓' : '○'}</span>
            One uppercase letter
          </div>
          <div className={`flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
            <span>{/[a-z]/.test(password) ? '✓' : '○'}</span>
            One lowercase letter
          </div>
          <div className={`flex items-center gap-1 ${/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
            <span>{/\d/.test(password) ? '✓' : '○'}</span>
            One number
          </div>
          <div className={`flex items-center gap-1 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
            <span>{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? '✓' : '○'}</span>
            One special character
          </div>
        </div>
      )}
    </div>
  )
}
