'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettingsForm } from '@/hooks/useSettingsForm'
import { THEME_OPTIONS, FONT_OPTIONS, LANGUAGE_OPTIONS, TIMEZONE_OPTIONS } from '@/constants/auth'
import { Settings } from 'lucide-react'

export function SettingsForm() {
  const {
    formData,
    isUpdating,
    error,
    handleFieldChange,
    handleToggle,
    handleSubmit,
  } = useSettingsForm()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Account Settings
        </CardTitle>
        <CardDescription>
          Customize your account preferences and notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Appearance Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Appearance</h3>
          
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={formData.theme}
              onValueChange={(value) => handleFieldChange('theme', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                {THEME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="font">Font</Label>
            <Select
              value={formData.font}
              onValueChange={(value) => handleFieldChange('font', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Notifications</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive email notifications about your account</p>
            </div>
            <Switch
              checked={formData.email_notifications}
              onCheckedChange={() => handleToggle('email_notifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Emails</Label>
              <p className="text-sm text-gray-500">Receive promotional emails and updates</p>
            </div>
            <Switch
              checked={formData.marketing_emails}
              onCheckedChange={() => handleToggle('marketing_emails')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Reports</Label>
              <p className="text-sm text-gray-500">Receive weekly activity summaries</p>
            </div>
            <Switch
              checked={formData.weekly_reports}
              onCheckedChange={() => handleToggle('weekly_reports')}
            />
          </div>
        </div>

        {/* Regional Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Regional</h3>
          
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => handleFieldChange('language', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) => handleFieldChange('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSubmit} 
            disabled={isUpdating}
            className="min-w-[120px]"
          >
            {isUpdating ? 'Updating...' : 'Update Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
