"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Giveaway } from "@/types/giveaways"

interface GiveawayBookInfoProps {
  giveaway: Giveaway
}

export function GiveawayBookInfo({ giveaway }: GiveawayBookInfoProps) {
  return (
    <div className="lg:col-span-2">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex gap-6 mb-6">
          <Image
            src={giveaway.book.cover_image_url}
            alt={giveaway.book.title}
            width={160}
            height={200}
            className="rounded-lg shadow-lg"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {giveaway.book.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
              by {giveaway.author.name}
            </p>
            <Badge variant="secondary" className="mb-4">
              {giveaway.book.genre}
            </Badge>
            <p className="text-gray-600 dark:text-gray-400">
              {giveaway.book.description}
            </p>
          </div>
        </div>

        {/* Author Info */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center gap-4">
            <Image
              src={giveaway.author.avatar_url}
              alt={giveaway.author.name}
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {giveaway.author.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {giveaway.author.bio}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
