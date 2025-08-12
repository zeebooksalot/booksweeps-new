'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAuth } from '@/components/auth/AuthProvider-refactored'
import { ProfileFormData } from '@/types/auth'
import { validateUserProfile, handleAuthError } from '@/lib/auth-utils'

export function useProfileForm() {
  const { userProfile, updateProfile } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: userProfile?.first_name || '',
    last_name: userProfile?.last_name || '',
    display_name: userProfile?.display_name || '',
    user_type: userProfile?.user_type || 'reader',
    favorite_genres: userProfile?.favorite_genres || [],
  })

  // Memoize form data initialization to prevent unnecessary re-renders
  const initialFormData = useMemo(() => ({
    first_name: userProfile?.first_name || '',
    last_name: userProfile?.last_name || '',
    display_name: userProfile?.display_name || '',
    user_type: userProfile?.user_type || 'reader',
    favorite_genres: userProfile?.favorite_genres || [],
  }), [userProfile?.first_name, userProfile?.last_name, userProfile?.display_name, userProfile?.user_type, userProfile?.favorite_genres])

  // Update form data when userProfile changes
  const updateFormData = useCallback(() => {
    if (userProfile) {
      setFormData(initialFormData)
    }
  }, [userProfile, initialFormData])

  // Synchronize form data when userProfile changes - optimized with useMemo
  useEffect(() => {
    updateFormData()
  }, [updateFormData])

  // Handle form field changes
  const handleFieldChange = useCallback((field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  // Handle genre toggle
  const handleGenreToggle = useCallback((genre: string) => {
    setFormData(prev => ({
      ...prev,
      favorite_genres: prev.favorite_genres.includes(genre)
        ? prev.favorite_genres.filter(g => g !== genre)
        : [...prev.favorite_genres, genre],
    }))
  }, [])

  // Memoize validation function to prevent unnecessary re-computations
  const validateForm = useCallback((data: ProfileFormData) => {
    const validation = validateUserProfile(data)
    return validation.errors
  }, [])

  // Memoize form validation result
  const formValidationErrors = useMemo(() => {
    return validateForm(formData)
  }, [formData, validateForm])

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!userProfile) return

    // Use memoized validation errors
    if (formValidationErrors.length > 0) {
      setError(formValidationErrors.join(', '))
      return
    }

    setIsUpdating(true)
    setError(null)

    try {
      await updateProfile(formData)
    } catch (err) {
      const authError = handleAuthError(err, 'profile update')
      setError(authError.message)
    } finally {
      setIsUpdating(false)
    }
  }, [formData, updateProfile, userProfile, formValidationErrors])

  // Reset form to current profile data
  const resetForm = useCallback(() => {
    updateFormData()
    setError(null)
  }, [updateFormData])

  return {
    formData,
    isUpdating,
    error,
    handleFieldChange,
    handleGenreToggle,
    handleSubmit,
    resetForm,
    updateFormData,
    // Expose validation errors for real-time feedback
    validationErrors: formValidationErrors,
  }
}
