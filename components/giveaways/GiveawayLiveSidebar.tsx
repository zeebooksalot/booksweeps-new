"use client"

import { useState } from "react"
import { GiveawayBookDetailsModal } from "./GiveawayBookDetailsModal"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

interface GiveawayLiveSidebarProps {
  author?: {
    id: string
    name: string
    avatar_url?: string
  }
  book?: {
    title: string
    author: string
    cover_image_url?: string
  }
}

export function GiveawayLiveSidebar({ author, book }: GiveawayLiveSidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const authorData = author || {
    id: "1",
    name: "Elena Rodriguez",
    avatar_url: "/elena-rodriguez-logo.jpg"
  }

  const bookData = book || {
    title: "Ocean's Echo",
    author: "Elena Rodriguez",
    cover_image_url: "/fantasy-romance-book-cover-ocean-s-echo.jpg"
  }

  return (
    <>
      <div className="space-y-3">
        <div className="w-full mb-6 h-[120px] rounded-lg overflow-hidden shadow-md">
          <img src={authorData.avatar_url} alt={authorData.name} className="w-full h-full object-cover" />
        </div>

        <div className="w-full aspect-[2/3.25] rounded-lg overflow-hidden shadow-md">
          <img
            src={bookData.cover_image_url}
            alt={`${bookData.title} book cover`}
            className="w-full h-full object-cover"
          />
        </div>

        <button
          className="w-full bg-white/50 border border-border rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-white cursor-pointer transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          View Book Details
        </button>

        <div className="space-y-3 pt-2">
          <div className="bg-white/50 border rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              "An absolutely captivating read! The world-building is incredible and the characters stayed with me long
              after I finished."
            </p>
            <p className="text-xs font-medium">— Sarah M.</p>
          </div>

          <div className="bg-white/50 border rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              "One of the best fantasy romances I've read this year. The romance is swoon-worthy and the plot keeps you
              hooked!"
            </p>
            <p className="text-xs font-medium">— Jessica L.</p>
          </div>
        </div>
      </div>

      <GiveawayBookDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        book={bookData}
      />
    </>
  )
}
