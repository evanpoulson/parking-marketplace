'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold hover:text-blue-100">
              ParkYYC
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    href="/"
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-700"
                  >
                    Browse
                  </Link>
                  <Link
                    href="/list-spot"
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-700"
                  >
                    List a Spot
                  </Link>
                  <Link
                    href="/my-spots"
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-700"
                  >
                    My Spots
                  </Link>
                  <Link
                    href="/my-bookings"
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-700"
                  >
                    My Bookings
                  </Link>
                  <span className="px-3 py-2 text-sm">
                    Hi, {user.user_metadata?.name || 'there'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium hover:bg-blue-800"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium hover:bg-blue-800"
                >
                  Log In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              {!mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {user ? (
              <>
                <div className="px-3 py-2 text-sm font-medium">
                  Hi, {user.user_metadata?.name || 'there'}
                </div>
                <Link
                  href="/"
                  className="block rounded-md px-3 py-2 text-base font-medium hover:bg-blue-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse
                </Link>
                <Link
                  href="/list-spot"
                  className="block rounded-md px-3 py-2 text-base font-medium hover:bg-blue-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  List a Spot
                </Link>
                <Link
                  href="/my-spots"
                  className="block rounded-md px-3 py-2 text-base font-medium hover:bg-blue-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Spots
                </Link>
                <Link
                  href="/my-bookings"
                  className="block rounded-md px-3 py-2 text-base font-medium hover:bg-blue-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Bookings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-md px-3 py-2 text-left text-base font-medium hover:bg-blue-700"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="block rounded-md px-3 py-2 text-base font-medium hover:bg-blue-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
