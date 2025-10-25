import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useGiveawayEntries(giveawayId: string) {
  const [entryCount, setEntryCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Fetch initial count
    const fetchCount = async () => {
      try {
        const { count } = await supabase
          .from('giveaway_entries')
          .select('*', { count: 'exact', head: true })
          .eq('giveaway_id', giveawayId)
        
        setEntryCount(count || 0)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching entry count:', error)
        setIsLoading(false)
      }
    }

    fetchCount()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`giveaway-entries-${giveawayId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'giveaway_entries',
          filter: `giveaway_id=eq.${giveawayId}`
        },
        () => {
          setEntryCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [giveawayId, supabase])

  return { entryCount, isLoading }
}
