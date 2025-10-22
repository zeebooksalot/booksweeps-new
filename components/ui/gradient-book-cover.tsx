import { getGradientCover } from "@/lib/gradient-covers"
import { cn } from "@/lib/utils"

interface GradientBookCoverProps {
  genre: string
  title?: string
  author?: string
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function GradientBookCover({ 
  genre, 
  title, 
  author, 
  className,
  size = "md",
  showText = true 
}: GradientBookCoverProps) {
  const cover = getGradientCover(genre)
  
  const sizeClasses = {
    sm: "w-16 h-24 text-xs",
    md: "w-20 h-32 text-sm", 
    lg: "w-32 h-48 text-base"
  }
  
  return (
    <div 
      className={cn(
        "rounded-lg shadow-lg flex flex-col items-center justify-center p-2",
        `bg-gradient-to-br ${cover.gradient}`,
        sizeClasses[size],
        className
      )}
    >
      {showText && (
        <div className="text-center">
          <div className={cn("font-bold", cover.textColor)}>
            {title || cover.genre}
          </div>
          {author && (
            <div className={cn("text-xs opacity-80", cover.textColor)}>
              {author}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
