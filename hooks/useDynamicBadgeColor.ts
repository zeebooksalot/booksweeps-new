import { useState, useEffect } from 'react'
import { extractColorFromImage, getGradientColors, darkenColor, lightenColor, rgbToCssWithOpacity, ColorRGB } from '@/lib/color-extractor'

// Simple cache to prevent re-processing the same images
const colorCache = new Map<string, BadgeColors>()

interface BadgeColors {
  background: string
  border: string
  text: string
  isLoading: boolean
}

const FALLBACK_COLORS: BadgeColors = {
  background: 'rgba(234, 179, 8, 0.5)', // yellow-500/50
  border: 'rgba(234, 179, 8, 0.6)', // yellow-500/60
  text: 'rgb(161, 98, 7)', // yellow-700 - lighter text
  isLoading: false
}

export function useDynamicBadgeColor(coverImage: string | undefined): BadgeColors {
  const [colors, setColors] = useState<BadgeColors>(() => {
    // For gradients, we can calculate colors immediately
    if (coverImage?.startsWith('gradient:')) {
      const genre = coverImage.replace('gradient:', '')
      const dominantColor = getGradientColors(genre)
      if (dominantColor) {
        const darkerColor = darkenColor(dominantColor, 0.4)
        const lighterColor = lightenColor(dominantColor, 0.3)
        return {
          background: rgbToCssWithOpacity(darkerColor, 0.5),
          border: rgbToCssWithOpacity(darkerColor, 0.6),
          text: `rgb(${lighterColor.r}, ${lighterColor.g}, ${lighterColor.b})`,
          isLoading: false
        }
      }
    }
    // For images, start with loading state
    return { ...FALLBACK_COLORS, isLoading: true }
  })

  useEffect(() => {
    if (!coverImage) {
      setColors(FALLBACK_COLORS)
      return
    }

    // Skip processing for gradients since we already calculated them in useState
    if (coverImage.startsWith('gradient:')) {
      return
    }

    // Check cache first
    if (colorCache.has(coverImage)) {
      setColors(colorCache.get(coverImage)!)
      return
    }

    const extractColors = async () => {
      try {
        let dominantColor: ColorRGB | null = null

        if (coverImage.startsWith('http') || coverImage.startsWith('/')) {
          // Handle actual images
          dominantColor = await extractColorFromImage(coverImage)
        }

        if (dominantColor) {
          // Create darker version for badge background
          const darkerColor = darkenColor(dominantColor, 0.4)
          
          // Create lighter version for text
          const lighterColor = lightenColor(dominantColor, 0.3)
          
          // Generate badge colors
          const badgeColors: BadgeColors = {
            background: rgbToCssWithOpacity(darkerColor, 0.5),
            border: rgbToCssWithOpacity(darkerColor, 0.6),
            text: `rgb(${lighterColor.r}, ${lighterColor.g}, ${lighterColor.b})`,
            isLoading: false
          }
          
          // Cache the result
          colorCache.set(coverImage, badgeColors)
          setColors(badgeColors)
        } else {
          setColors(FALLBACK_COLORS)
        }
      } catch (error) {
        console.warn('Error extracting badge colors:', error)
        setColors(FALLBACK_COLORS)
      }
    }

    extractColors()
  }, [coverImage])

  return colors
}
