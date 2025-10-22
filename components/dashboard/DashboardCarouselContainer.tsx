"use client"

import { useRef, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CarouselContainerProps {
  children: ReactNode
}

export function DashboardCarouselContainer({ children }: CarouselContainerProps) {
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 400
      const container = carouselRef.current
      const maxScroll = container.scrollWidth - container.clientWidth

      if (direction === "right") {
        // If near the end, loop back to start
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: "smooth" })
        } else {
          container.scrollTo({ left: container.scrollLeft + scrollAmount, behavior: "smooth" })
        }
      } else {
        // If near the beginning, loop to end
        if (container.scrollLeft <= 10) {
          container.scrollTo({ left: maxScroll, behavior: "smooth" })
        } else {
          container.scrollTo({ left: container.scrollLeft - scrollAmount, behavior: "smooth" })
        }
      }
    }
  }

  return (
    <div className="relative group">
      {/* Left Arrow */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -left-12 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={() => scrollCarousel("left")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory p-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>

      {/* Right Arrow */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-12 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={() => scrollCarousel("right")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
