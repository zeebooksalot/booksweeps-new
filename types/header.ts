export interface NavigationItem {
  label: string
  href: string
  dropdownItems?: DropdownItem[]
}

export interface DropdownItem {
  label: string
  href: string
}

export interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  isMobileView: boolean
  className?: string
}

export interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  placeholder?: string
  className?: string
  showMobileToggle?: boolean
  onMobileToggle?: (show: boolean) => void
  isMobileSearchOpen?: boolean
}

export interface NavigationProps {
  className?: string
}

export interface UserActionsProps {
  className?: string
}

export interface MobileMenuProps {
  className?: string
}
