'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading'
import { ErrorState } from '@/components/ui/error-state'
import { User, Settings, BookOpen, Heart, Bell, Globe } from 'lucide-react'

export function UserProfile() {
  const { user, userProfile, userSettings, updateProfile, updateSettings, loading } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [profileForm, setProfileForm] = useState({
    first_name: userProfile?.first_name || '',
    last_name: userProfile?.last_name || '',
    display_name: userProfile?.display_name || '',
    user_type: userProfile?.user_type || 'reader',
    favorite_genres: userProfile?.favorite_genres || [],
  })

  const [settingsForm, setSettingsForm] = useState<{
    theme: 'light' | 'dark' | 'auto'
    font: string
    email_notifications: boolean
    marketing_emails: boolean
    weekly_reports: boolean
    language: string
    timezone: string
  }>({
    theme: userSettings?.theme || 'auto',
    font: userSettings?.font || 'Inter',
    email_notifications: userSettings?.email_notifications ?? true,
    marketing_emails: userSettings?.marketing_emails ?? true,
    weekly_reports: userSettings?.weekly_reports ?? false,
    language: userSettings?.language || 'en',
    timezone: userSettings?.timezone || 'UTC',
  })

  const handleProfileUpdate = async () => {
    if (!user) return

    setIsUpdating(true)
    setError(null)

    try {
      await updateProfile(profileForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSettingsUpdate = async () => {
    if (!user) return

    setIsUpdating(true)
    setError(null)

    try {
      await updateSettings(settingsForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
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
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={userProfile?.avatar_url || undefined} />
          <AvatarFallback>
            {userProfile?.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{userProfile?.display_name || 'User Profile'}</h1>
          <p className="text-gray-600">{user.email}</p>
          <Badge variant="secondary">{userProfile?.user_type || 'reader'}</Badge>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Update Failed"
          message={error}
          onRetry={() => setError(null)}
          variant="compact"
        />
      )}

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, first_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={profileForm.display_name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, display_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="user_type">User Type</Label>
                <Select
                  value={profileForm.user_type}
                  onValueChange={(value) => setProfileForm(prev => ({ ...prev, user_type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reader">Reader</SelectItem>
                    <SelectItem value="author">Author</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleProfileUpdate} disabled={isUpdating}>
                {isUpdating ? <LoadingSpinner size="sm" /> : 'Update Profile'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Reading Preferences</CardTitle>
              <CardDescription>Customize your reading experience and notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <Label htmlFor="email_notifications">Email Notifications</Label>
                  </div>
                  <Switch
                    id="email_notifications"
                    checked={settingsForm.email_notifications}
                    onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, email_notifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <Label htmlFor="marketing_emails">Marketing Emails</Label>
                  </div>
                  <Switch
                    id="marketing_emails"
                    checked={settingsForm.marketing_emails}
                    onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, marketing_emails: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <Label htmlFor="weekly_reports">Weekly Reports</Label>
                  </div>
                  <Switch
                    id="weekly_reports"
                    checked={settingsForm.weekly_reports}
                    onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, weekly_reports: checked }))}
                  />
                </div>
              </div>
              <Button onClick={handleSettingsUpdate} disabled={isUpdating}>
                {isUpdating ? <LoadingSpinner size="sm" /> : 'Update Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>App Settings</CardTitle>
              <CardDescription>Customize your app appearance and behavior.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={settingsForm.theme}
                    onValueChange={(value) => setSettingsForm(prev => ({ ...prev, theme: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settingsForm.language}
                    onValueChange={(value) => setSettingsForm(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSettingsUpdate} disabled={isUpdating}>
                {isUpdating ? <LoadingSpinner size="sm" /> : 'Update Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
