// Dynamic color extraction and manipulation utilities

export interface ColorRGB {
  r: number
  g: number
  b: number
}

export interface ColorHSL {
  h: number
  s: number
  l: number
}

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): ColorHSL {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): ColorRGB {
  h /= 360
  s /= 100
  l /= 100

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

// Darken a color by a percentage
export function darkenColor(color: ColorRGB, amount: number): ColorRGB {
  const hsl = rgbToHsl(color.r, color.g, color.b)
  const darkenedHsl = { ...hsl, l: Math.max(0, hsl.l - (hsl.l * amount)) }
  return hslToRgb(darkenedHsl.h, darkenedHsl.s, darkenedHsl.l)
}

// Lighten a color by a percentage
export function lightenColor(color: ColorRGB, amount: number): ColorRGB {
  const hsl = rgbToHsl(color.r, color.g, color.b)
  const lightenedHsl = { ...hsl, l: Math.min(100, hsl.l + (hsl.l * amount)) }
  return hslToRgb(lightenedHsl.h, lightenedHsl.s, lightenedHsl.l)
}

// Get dominant color from image data
export function getDominantColor(imageData: Uint8ClampedArray): ColorRGB {
  const pixels = imageData
  const colorCounts: { [key: string]: number } = {}
  
  // Sample every 4th pixel for performance
  for (let i = 0; i < pixels.length; i += 16) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    
    // Skip transparent pixels
    if (pixels[i + 3] < 128) continue
    
    // Round to nearest 10 for color grouping
    const roundedR = Math.round(r / 10) * 10
    const roundedG = Math.round(g / 10) * 10
    const roundedB = Math.round(b / 10) * 10
    
    const colorKey = `${roundedR},${roundedG},${roundedB}`
    colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1
  }
  
  // Find most common color
  let maxCount = 0
  let dominantColor = { r: 0, g: 0, b: 0 }
  
  for (const [colorKey, count] of Object.entries(colorCounts)) {
    if (count > maxCount) {
      maxCount = count
      const [r, g, b] = colorKey.split(',').map(Number)
      dominantColor = { r, g, b }
    }
  }
  
  return dominantColor
}

// Extract color from image
export async function extractColorFromImage(imageSrc: string): Promise<ColorRGB | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      resolve(null)
      return
    }
    
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        // Set canvas size to image size
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0)
        
        // Sample the top-right corner where badge will be (20% of width/height)
        const sampleWidth = Math.max(20, Math.floor(img.width * 0.2))
        const sampleHeight = Math.max(20, Math.floor(img.height * 0.2))
        const startX = img.width - sampleWidth
        const startY = 0
        
        // Get image data from the sample area
        const imageData = ctx.getImageData(startX, startY, sampleWidth, sampleHeight)
        const dominantColor = getDominantColor(imageData.data)
        
        resolve(dominantColor)
      } catch (error) {
        console.warn('Error extracting color from image:', error)
        resolve(null)
      }
    }
    
    img.onerror = () => {
      resolve(null)
    }
    
    img.src = imageSrc
  })
}

// Get gradient colors for predefined gradients
export function getGradientColors(genre: string): ColorRGB | null {
  const gradientMap: { [key: string]: ColorRGB } = {
    fantasy: { r: 34, g: 197, b: 94 }, // green-500
    romance: { r: 236, g: 72, b: 153 }, // pink-500
    scifi: { r: 59, g: 130, b: 246 }, // blue-500
    mystery: { r: 245, g: 158, b: 11 }, // amber-500
    thriller: { r: 37, g: 99, b: 235 }, // blue-600
    horror: { r: 75, g: 85, b: 99 }, // gray-600
    adventure: { r: 234, g: 179, b: 8 }, // yellow-500
    historical: { r: 168, g: 162, b: 158 }, // stone-500
    urban: { r: 147, g: 51, b: 234 }, // purple-600
    default: { r: 156, g: 163, b: 175 } // gray-400
  }
  
  return gradientMap[genre] || gradientMap.default
}

// Convert RGB to CSS color string
export function rgbToCss(rgb: ColorRGB): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

// Convert RGB to CSS color string with opacity
export function rgbToCssWithOpacity(rgb: ColorRGB, opacity: number): string {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}
