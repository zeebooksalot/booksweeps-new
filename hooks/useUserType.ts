import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useUserType(userId: string | null) {
  const [userType, setUserType] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create Supabase client using the SSR-compatible client
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!userId) {
      setUserType(null)
      return
    }

    const fetchUserType = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', userId)
          .single()

        if (error) {
          console.error('Error fetching user type:', error)
          setError(error.message)
          return
        }

        setUserType(data.user_type)
      } catch (err) {
        console.error('Error fetching user type:', err)
        setError('Failed to fetch user type')
      } finally {
        setLoading(false)
      }
    }

    fetchUserType()
  }, [userId, supabase])

  return { userType, loading, error }
}
