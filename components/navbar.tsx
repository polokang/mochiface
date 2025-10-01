'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [credits, setCredits] = useState<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm hover:text-primary">
                  {user.username}
                </Link>
                {credits !== null && (
                  <Link href="/rewards" className="text-sm text-muted-foreground hover:text-primary">
                    Credits: {credits}
                  </Link>
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-4 space-y-3">
              {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="block text-sm hover:text-primary py-2"
                    onClick={closeMobileMenu}
                  >
                    {user.username}
                  </Link>
                  {credits !== null && (
                    <Link 
                      href="/rewards" 
                      className="block text-sm text-muted-foreground hover:text-primary py-2"
                      onClick={closeMobileMenu}
                    >
                      Credits: {credits}
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSignOut}
                    className="w-full justify-start"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMobileMenu}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={closeMobileMenu}>
                    <Button size="sm" className="w-full">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div className="h-16" />
    </>
  )
}
