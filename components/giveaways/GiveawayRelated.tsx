"use client"

import { RelatedGiveawayCard } from "./RelatedGiveawayCard"
import { useIsMobile } from "@/hooks/use-mobile"

const giveaways = [
  {
    title: "Midnight's Promise",
    author: "Sarah Blake",
    genre: "Fantasy Romance",
    daysLeft: "3 days left",
    cover: "/midnights-promise-cover.jpg",
    description: "A dark fantasy romance where ancient magic meets forbidden love in a world on the brink of war.",
  },
  {
    title: "The Dragon's Heart",
    author: "Michael Chen",
    genre: "Epic Fantasy",
    daysLeft: "7 days left",
    cover: "/dragons-heart-cover.jpg",
    description: "An epic tale of dragons, destiny, and the warrior who must unite the realms to save them all.",
  },
  {
    title: "Whispers of Magic",
    author: "Luna Martinez",
    genre: "Urban Fantasy",
    daysLeft: "12 days left",
    cover: "/whispers-of-magic-cover.jpg",
    description: "Modern magic hidden in plain sight as a young witch discovers her true power in the city.",
  },
]

export function GiveawayRelated() {
  const isMobile = useIsMobile()

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-6">Active Book Giveaways You Might Like</h2>
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
        {giveaways.map((book, index) => (
          <RelatedGiveawayCard key={index} {...book} />
        ))}
      </div>
    </div>
  )
}
