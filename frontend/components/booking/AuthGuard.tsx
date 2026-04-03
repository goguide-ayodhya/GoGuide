'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AuthGuardProps {
  children: ReactNode
  onNavigate: (redirectUrl: string) => void
  redirectUrl: string
}

export function AuthGuard({ children, onNavigate, redirectUrl }: AuthGuardProps) {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
    } else {
      onNavigate(redirectUrl)
      router.push(redirectUrl)
    }
  }

  return <div onClick={handleClick}>{children}</div>
}
