// Utility for generating gradient book covers
export interface GradientBookCover {
  gradient: string
  textColor: string
  genre: string
}

export const GRADIENT_COVERS: Record<string, GradientBookCover> = {
  fantasy: {
    gradient: "from-green-400 to-emerald-600",
    textColor: "text-white",
    genre: "Fantasy"
  },
  romance: {
    gradient: "from-pink-400 to-rose-600", 
    textColor: "text-white",
    genre: "Romance"
  },
  scifi: {
    gradient: "from-blue-400 to-purple-600",
    textColor: "text-white", 
    genre: "Sci-Fi"
  },
  mystery: {
    gradient: "from-amber-400 to-orange-600",
    textColor: "text-white",
    genre: "Mystery"
  },
  thriller: {
    gradient: "from-blue-400 to-blue-600",
    textColor: "text-white",
    genre: "Thriller"
  },
  horror: {
    gradient: "from-gray-600 to-black",
    textColor: "text-white",
    genre: "Horror"
  },
  adventure: {
    gradient: "from-yellow-400 to-orange-600",
    textColor: "text-white",
    genre: "Adventure"
  },
  historical: {
    gradient: "from-stone-500 to-amber-700",
    textColor: "text-white",
    genre: "Historical"
  },
  urban: {
    gradient: "from-purple-600 to-indigo-800",
    textColor: "text-white",
    genre: "Urban Fantasy"
  },
  author: {
    gradient: "from-indigo-400 to-purple-600",
    textColor: "text-white",
    genre: "Author"
  },
  default: {
    gradient: "from-gray-400 to-gray-600",
    textColor: "text-white",
    genre: "Book"
  }
}

export function getGradientCover(genre: string): GradientBookCover {
  const normalizedGenre = genre.toLowerCase().replace(/\s+/g, '')
  
  // Try exact match first
  if (GRADIENT_COVERS[normalizedGenre]) {
    return GRADIENT_COVERS[normalizedGenre]
  }
  
  // Try partial matches
  for (const [key, cover] of Object.entries(GRADIENT_COVERS)) {
    if (normalizedGenre.includes(key) || key.includes(normalizedGenre)) {
      return cover
    }
  }
  
  // Return default if no match
  return GRADIENT_COVERS.default
}

export function generateGradientCover(genre: string, title: string): string {
  const cover = getGradientCover(genre)
  return `bg-gradient-to-br ${cover.gradient}`
}
