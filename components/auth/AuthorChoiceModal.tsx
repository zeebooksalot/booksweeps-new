'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface AuthorChoiceModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
  redirectTo?: string
}

export function AuthorChoiceModal({ 
  isOpen, 
  onClose, 
  user, 
  redirectTo = '/dashboard' 
}: AuthorChoiceModalProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const authorSiteButtonRef = useRef<HTMLButtonElement>(null)
  const upgradeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && authorSiteButtonRef.current) {
      // Focus the first button when modal opens
      setTimeout(() => {
        authorSiteButtonRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Tab') {
      // Ensure focus stays within modal
      const focusableElements = [
        authorSiteButtonRef.current,
        upgradeButtonRef.current
      ].filter(Boolean) as HTMLElement[]
      
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }

  const handleAuthorSite = () => {
    console.log('=== AUTHOR SITE REDIRECT ===')
    const authorUrl = process.env.NEXT_PUBLIC_AUTHOR_URL || 'https://app.booksweeps.com'
    
    console.log('Author site redirect initiated:', {
      authorUrl,
      userEmail: user.email,
      userId: user.id
    })
    
    // Validate URL format
    try {
      new URL(authorUrl)
    } catch (error) {
      console.error('Invalid author URL:', authorUrl)
      toast({ 
        title: 'Configuration Error', 
        description: 'Please contact support.', 
        variant: 'destructive' 
      })
      return
    }
    
    // Announce to screen readers
    const announcement = `Redirecting to author site at ${authorUrl}`
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    liveRegion.textContent = announcement
    document.body.appendChild(liveRegion)
    
    // Remove announcement after a delay
    setTimeout(() => {
      document.body.removeChild(liveRegion)
    }, 1000)
    
    // Redirect to author site
    const redirectUrl = `${authorUrl}/login?email=${encodeURIComponent(user.email || '')}`
    console.log('Redirecting to:', redirectUrl)
    window.location.href = redirectUrl
  }

  const handleUpgradeToReader = async () => {
    console.log('=== USER TYPE UPGRADE START ===')
    setLoading(true)
    
    try {
      console.log('Calling upgrade API...')
      // Call API to upgrade user type
      const response = await fetch('/api/auth/upgrade-user-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          new_user_type: 'both',
          upgrade_reason: 'author_to_reader_upgrade',
          domain_referrer: window.location.hostname
        })
      })

      console.log('Upgrade API response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Upgrade API error:', errorText)
        throw new Error('Failed to upgrade account')
      }

      const data = await response.json()
      console.log('Upgrade API success:', data)
      
      // Clear any cached user type data
      if (data.cache_invalidated) {
        console.log('Dispatching cache invalidation event')
        // Dispatch a custom event to notify other components to clear cache
        window.dispatchEvent(new CustomEvent('userTypeUpgraded', {
          detail: { userId: user.id, newUserType: data.new_user_type }
        }))
      }
      
      toast({ 
        title: 'Account upgraded!', 
        description: 'You now have access to both author and reader features.' 
      })

      // Close modal and redirect
      console.log('Closing modal and redirecting to:', redirectTo)
      onClose()
      router.push(redirectTo)
      
    } catch (error) {
      console.error('Upgrade error:', {
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
      toast({ 
        title: 'Upgrade failed', 
        description: 'Please try again or contact support.', 
        variant: 'destructive' 
      })
    } finally {
      setLoading(false)
      console.log('=== USER TYPE UPGRADE END ===')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md"
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-labelledby="author-choice-title"
        aria-describedby="author-choice-description"
      >
        <DialogHeader>
          <DialogTitle id="author-choice-title">Welcome back, Author!</DialogTitle>
          <DialogDescription id="author-choice-description">
            We detected you have an author account. How would you like to proceed?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <Button 
              ref={authorSiteButtonRef}
              onClick={handleAuthorSite}
              className="w-full justify-start"
              variant="outline"
              aria-describedby="author-site-description"
            >
              <div className="text-left">
                <div className="font-semibold">Go to Author Site</div>
                <div className="text-sm text-muted-foreground">
                  Continue to app.booksweeps.com to manage your books and campaigns
                </div>
              </div>
            </Button>
            <div id="author-site-description" className="sr-only">
              Navigate to the author platform to manage your books and campaigns
            </div>
            
            <Button 
              ref={upgradeButtonRef}
              onClick={handleUpgradeToReader}
              disabled={loading}
              className="w-full justify-start"
              aria-describedby="upgrade-description"
              aria-busy={loading}
            >
              <div className="text-left">
                <div className="font-semibold">
                  {loading ? 'Upgrading...' : 'Upgrade to Reader Account'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Get access to reader features while keeping your author account
                </div>
              </div>
            </Button>
            <div id="upgrade-description" className="sr-only">
              Upgrade your account to access both author and reader features
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground text-center" role="note">
            You can always switch between author and reader features later
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
