'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProfileForm } from '@/hooks/useProfileForm'
import { USER_TYPE_OPTIONS, GENRE_OPTIONS } from '@/constants/auth'
import { User } from 'lucide-react'

interface ProfileFormProps {
  user: {
    id: string
    email?: string
    user_metadata?: Record<string, unknown>
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const {
    formData,
    isUpdating,
    error,
    handleFieldChange,
    handleGenreToggle,
    handleSubmit,
  } = useProfileForm()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleFieldChange('first_name', e.target.value)}
              placeholder="Enter your first name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => handleFieldChange('last_name', e.target.value)}
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="display_name">Display Name</Label>
          <Input
            id="display_name"
            value={formData.display_name}
            onChange={(e) => handleFieldChange('display_name', e.target.value)}
            placeholder="Enter your display name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="user_type">User Type</Label>
          <Select
            value={formData.user_type}
            onValueChange={(value) => handleFieldChange('user_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              {USER_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Favorite Genres</Label>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((genre) => (
              <Badge
                key={genre}
                variant={formData.favorite_genres.includes(genre) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleGenreToggle(genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSubmit} 
            disabled={isUpdating}
            className="min-w-[120px]"
          >
            {isUpdating ? 'Updating...' : 'Update Profile'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
