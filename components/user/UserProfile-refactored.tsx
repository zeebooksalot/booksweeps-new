'use client'

import { useAuth } from '@/components/auth/AuthProvider-refactored'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/ui/loading'
import { ErrorState } from '@/components/ui/error-state'
import { ProfileHeader } from './ProfileHeader'
import { ProfileForm } from './ProfileForm'
import { SettingsForm } from './SettingsForm'

export function UserProfile() {
  const { user, userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user || !userProfile) {
    return (
      <ErrorState
        title="Authentication Required"
        message="Please sign in to view your profile."
        variant="compact"
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <ProfileHeader userProfile={userProfile} userEmail={user.email || ''} />

      {/* Profile Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileForm user={user} />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
