'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export function Navbar() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    if (user) {
      fetchCredits()
    }
  }, [user])

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/credits/me')
      if (response.ok) {
        const data = await response.json()
        setCredits(data.points)
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error)
    }
  }

  const handleSignOut = async () => {
    await logout()
    router.push('/')
  }

  if (loading) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
            <Image
              src="/logo.png"
              alt="MochiFace Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span>MochiFace</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
          <Image
            src="/logo.png"
            alt="MochiFace Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span>MochiFace</span>
        </Link>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/upload" className="text-sm hover:text-primary">
                Generate Avatar
              </Link>
              <Link href="/dashboard" className="text-sm hover:text-primary">
                My Works
              </Link>
              <Link href="/rewards" className="text-sm hover:text-primary">
                Get Credits
              </Link>
              {credits !== null && (
                <div className="text-sm text-muted-foreground">
                  Credits: {credits}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
