'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { useToast } from '@/components/ui/use-toast'
import { BookOpen, Users, PenTool, ArrowRight } from 'lucide-react'

interface AuthorChoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onChoice: (userType: 'reader' | 'author' | 'both') => void
}

export function AuthorChoiceModal({ isOpen, onClose, onChoice }: AuthorChoiceModalProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Create Supabase client using the SSR-compatible client
  const supabase = createClientComponentClient()

  const handleChoice = async (userType: 'reader' | 'author' | 'both') => {
    setLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No user found')
      }

      // Update user type in database
      const { error } = await supabase
        .from('users')
        .update({ user_type: userType })
        .eq('id', user.id)

      if (error) {
        throw error
      }

      toast({
        title: 'Profile updated',
        description: `You've been set up as a ${userType}.`,
      })

      onChoice(userType)
      onClose()
    } catch (error) {
      console.error('Error updating user type:', error)
      toast({
        title: 'Error',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const choices = [
    {
      id: 'reader' as const,
      title: 'Reader',
      description: 'Discover and read books, enter giveaways, and build your reading list.',
      icon: BookOpen,
      features: ['Browse books', 'Enter giveaways', 'Track reading', 'Get recommendations'],
      color: 'bg-blue-50 border-blue-200 text-blue-700',
    },
    {
      id: 'author' as const,
      title: 'Author',
      description: 'Publish your books, run giveaways, and connect with readers.',
      icon: PenTool,
      features: ['Publish books', 'Run giveaways', 'Track analytics', 'Connect with readers'],
      color: 'bg-green-50 border-green-200 text-green-700',
    },
    {
      id: 'both' as const,
      title: 'Reader & Author',
      description: 'Enjoy the best of both worlds - read and write.',
      icon: Users,
      features: ['All reader features', 'All author features', 'Seamless switching'],
      color: 'bg-purple-50 border-purple-200 text-purple-700',
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Experience
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            How would you like to use BookSweeps?
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {choices.map((choice) => (
            <Card
              key={choice.id}
              className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${choice.color}`}
              onClick={() => !loading && handleChoice(choice.id)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-white/50">
                  <choice.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">{choice.title}</CardTitle>
                <CardDescription className="text-sm">
                  {choice.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {choice.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <ArrowRight className="h-4 w-4 mr-2 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full mt-4"
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleChoice(choice.id)
                  }}
                >
                  {loading ? 'Setting up...' : `Choose ${choice.title}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>You can change this later in your profile settings.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
