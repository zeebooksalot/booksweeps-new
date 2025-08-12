import { useState, useCallback } from "react"
import { FeedItem, MobileSwipeState } from "@/types"
import { FEED_CONFIG } from "@/constants/feed"

export function useFeedItem() {
  const [swipeState, setSwipeState] = useState<MobileSwipeState>({
    startX: 0,
    currentX: 0,
    isDragging: false,
    isVoting: false,
  })

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setSwipeState(prev => ({
      ...prev,
      startX: e.touches[0].clientX,
      isDragging: true,
    }))
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swipeState.isDragging) return
    
    setSwipeState(prev => ({
      ...prev,
      currentX: e.touches[0].clientX - prev.startX,
    }))
  }, [swipeState.isDragging])

  const handleTouchEnd = useCallback((
    itemId: string,
    onSwipeRight: (id: string) => void,
    onSwipeLeft: (id: string) => void
  ) => {
    if (!swipeState.isDragging) return

    if (swipeState.currentX > FEED_CONFIG.swipeThreshold) {
      setSwipeState(prev => ({ ...prev, isVoting: true }))
      onSwipeRight(itemId)
      setTimeout(() => {
        setSwipeState(prev => ({ ...prev, isVoting: false }))
      }, FEED_CONFIG.voteAnimationDuration)
    } else if (swipeState.currentX < -FEED_CONFIG.swipeThreshold) {
      onSwipeLeft(itemId)
    }

    setSwipeState(prev => ({
      ...prev,
      currentX: 0,
      isDragging: false,
    }))
  }, [swipeState.isDragging, swipeState.currentX])

  const resetSwipeState = useCallback(() => {
    setSwipeState({
      startX: 0,
      currentX: 0,
      isDragging: false,
      isVoting: false,
    })
  }, [])

  return {
    swipeState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetSwipeState,
  }
}
