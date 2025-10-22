'use client'

import { EnhancedAvatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { UserProfile } from '@/types/auth'

interface ProfileHeaderProps {
  userProfile: UserProfile
  userEmail: string
}

export function ProfileHeader({ userProfile, userEmail }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <EnhancedAvatar
        src={userProfile.avatar_url}
        email={userEmail}
        name={userProfile.display_name || `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || undefined}
        size={64}
        alt={userProfile.display_name || userEmail}
      />
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {userProfile.display_name || userEmail}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {userProfile.first_name && userProfile.last_name 
            ? `${userProfile.first_name} ${userProfile.last_name}`
            : userEmail
          }
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary">{userProfile.user_type}</Badge>
          <span className="text-sm text-gray-500">
            Member since {new Date(userProfile.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}
