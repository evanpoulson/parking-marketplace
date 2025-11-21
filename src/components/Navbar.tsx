'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Side - Navigation Links (only when logged in) */}
          <div className="flex items-center space-x-1">
            {user ? (
              <>
                <Link
                  href="/"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  Browse
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  href="/list-spot"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  List a Spot
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  href="/my-spots"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  My Spots
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  href="/my-bookings"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  My Bookings
                </Link>
              </>
            ) : (
              <div className="w-12"></div> {/* Spacer for alignment */}
            )}
          </div>

          {/* Center - ParkYYC Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
              ParkYYC
            </Link>
          </div>

          {/* Right Side - User Info / Auth */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <span className="text-sm font-medium text-gray-700">
                  Hi, {user.user_metadata?.name || 'there'}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
