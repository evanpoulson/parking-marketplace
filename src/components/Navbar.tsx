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
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">

          {/* Left Section - Navigation Links */}
          <div className="flex-[2]">
            {user ? (
              <div className="flex gap-6">
                <Link
                  href="/"
                  className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium rounded hover:bg-gray-50 transition-colors"
                >
                  Browse
                </Link>
                <Link
                  href="/list-spot"
                  className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium rounded hover:bg-gray-50 transition-colors"
                >
                  List a Spot
                </Link>
                <Link
                  href="/my-spots"
                  className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium rounded hover:bg-gray-50 transition-colors"
                >
                  My Spots
                </Link>
                <Link
                  href="/my-bookings"
                  className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium rounded hover:bg-gray-50 transition-colors"
                >
                  My Bookings
                </Link>
              </div>
            ) : (
              <div />
            )}
          </div>

          {/* Center Section - Logo */}
          <div className="flex-1 text-center">
            <Link
              href="/"
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              ParkYYC
            </Link>
          </div>

          {/* Right Section - Auth */}
          <div className="flex-[1.5] flex justify-end">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium px-3 py-2">
                  Hi, {user.user_metadata?.name || 'there'}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-medium"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-medium"
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
