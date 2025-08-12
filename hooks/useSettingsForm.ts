'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAuth } from '@/components/auth/AuthProvider-refactored'
import { SettingsFormData } from '@/types/auth'
import { validateUserSettings, handleAuthError } from '@/lib/auth-utils'

export function useSettingsForm() {
  const { userSettings, updateSettings } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<SettingsFormData>({
    theme: userSettings?.theme || 'auto',
    font: userSettings?.font || 'inter',
    email_notifications: userSettings?.email_notifications || false,
    marketing_emails: userSettings?.marketing_emails || false,
    weekly_reports: userSettings?.weekly_reports || false,
    language: userSettings?.language || 'en',
    timezone: userSettings?.timezone || 'UTC',
  })

  // Memoize form data initialization to prevent unnecessary re-renders
  const initialFormData = useMemo(() => ({
    theme: userSettings?.theme || 'auto',
    font: userSettings?.font || 'inter',
    email_notifications: userSettings?.email_notifications || false,
    marketing_emails: userSettings?.marketing_emails || false,
    weekly_reports: userSettings?.weekly_reports || false,
    language: userSettings?.language || 'en',
    timezone: userSettings?.timezone || 'UTC',
  }), [userSettings?.theme, userSettings?.font, userSettings?.email_notifications, userSettings?.marketing_emails, userSettings?.weekly_reports, userSettings?.language, userSettings?.timezone])

  // Update form data when userSettings changes
  const updateFormData = useCallback(() => {
    if (userSettings) {
      setFormData(initialFormData)
    }
  }, [userSettings, initialFormData])

  // Synchronize form data when userSettings changes - optimized with useMemo
  useEffect(() => {
    updateFormData()
  }, [updateFormData])

  // Handle form field changes
  const handleFieldChange = useCallback((field: keyof SettingsFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  // Memoize validation function to prevent unnecessary re-computations
  const validateForm = useCallback((data: SettingsFormData) => {
    const validation = validateUserSettings(data)
    return validation.errors
  }, [])

  // Memoize form validation result
  const formValidationErrors = useMemo(() => {
    return validateForm(formData)
  }, [formData, validateForm])

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!userSettings) return

    // Use memoized validation errors
    if (formValidationErrors.length > 0) {
      setError(formValidationErrors.join(', '))
      return
    }

    setIsUpdating(true)
    setError(null)

    try {
      await updateSettings(formData)
    } catch (err) {
      const authError = handleAuthError(err, 'settings update')
      setError(authError.message)
    } finally {
      setIsUpdating(false)
    }
  }, [formData, updateSettings, userSettings, formValidationErrors])

  // Reset form to current settings data
  const resetForm = useCallback(() => {
    updateFormData()
    setError(null)
  }, [updateFormData])

  return {
    formData,
    isUpdating,
    error,
    handleFieldChange,
    handleSubmit,
    resetForm,
    updateFormData,
    // Expose validation errors for real-time feedback
    validationErrors: formValidationErrors,
  }
}
