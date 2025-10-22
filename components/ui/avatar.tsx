"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"
import { getGravatarUrl, getInitials, getColorFallback } from "@/lib/gravatar"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// Enhanced Avatar component with Gravatar support
interface EnhancedAvatarProps {
  src?: string | null
  alt?: string
  email?: string
  name?: string
  size?: number
  className?: string
}

const EnhancedAvatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  EnhancedAvatarProps
>(({ src, alt, email, name, size = 40, className, ...props }, ref) => {
  const displayName = name || email || 'User'
  const initials = getInitials(displayName)
  const colorClass = getColorFallback(displayName)
  
  // Priority: custom src > Gravatar > color fallback
  const avatarSrc = src || (email ? getGravatarUrl(email, size) : null)
  
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        className
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      {avatarSrc && (
        <AvatarPrimitive.Image
          src={avatarSrc}
          alt={alt || displayName}
          className="aspect-square h-full w-full object-cover"
        />
      )}
      <AvatarPrimitive.Fallback
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full text-white font-medium text-sm",
          colorClass
        )}
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
})
EnhancedAvatar.displayName = "EnhancedAvatar"

export { Avatar, AvatarImage, AvatarFallback, EnhancedAvatar }
