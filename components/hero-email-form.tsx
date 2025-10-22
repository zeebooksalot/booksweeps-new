"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"

export function HeroEmailForm() {
  return (
    <div className="space-y-4">
      {/* Email subscription form */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
        <div className="flex gap-2 flex-1">
          <Input type="email" placeholder="Enter your email" className="flex-1 h-12 transition-all focus:scale-[1.02]" style={{ fontSize: 'var(--text-hero-primary)' }} />
          <Button className="bg-primary hover:bg-primary/90 px-6 h-12 transition-all hover:scale-105 hover:shadow-lg text-white" style={{ height: '48px', fontSize: 'var(--text-hero-primary)' }}>
            Subscribe
          </Button>
        </div>
        <Button
          variant="outline"
          className="border-primary text-primary hover:bg-primary/5 hover:text-primary bg-transparent !h-12 transition-all hover:scale-105 hover:shadow-md group"
          style={{ fontSize: 'var(--text-hero-secondary)' }}
        >
          Browse
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" style={{ marginLeft: '2px' }} />
        </Button>
      </div>

      {/* Category quick links and free messaging */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">100% Free • No Credit Card Required</span>
        </div>
        <div className="hidden sm:block w-px h-4 bg-border" />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Popular:</span>
           <Button
             variant="link"
             size="sm"
             className="h-auto p-0 text-black hover:text-black/80 transition-all hover:scale-105"
           >
             Fantasy
           </Button>
           <span className="text-muted-foreground">•</span>
           <Button
             variant="link"
             size="sm"
             className="h-auto p-0 text-black hover:text-black/80 transition-all hover:scale-105"
           >
             Romance
           </Button>
           <span className="text-muted-foreground">•</span>
           <Button
             variant="link"
             size="sm"
             className="h-auto p-0 text-black hover:text-black/80 transition-all hover:scale-105"
           >
             Mystery
           </Button>
        </div>
      </div>
    </div>
  )
}
