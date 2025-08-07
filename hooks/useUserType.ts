import { useAuth } from '@/components/auth/AuthProvider'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useUserType() {
  const { user } = useAuth()
  const [userType, setUserType] = useState<'author' | 'reader' | 'both' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setUserType(null)
      setLoading(false)
      return
    }

    async function fetchUserType() {
      try {
        if (!supabase) return
        
        const { data, error } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setUserType(data.user_type as 'author' | 'reader' | 'both')
      } catch (error) {
        console.error('Error fetching user type:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserType()
  }, [user])

  return { userType, loading }
}
