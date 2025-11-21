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
      <div className="max-w-7xl mx-auto px-8">

        {/* Top Row */}
        <div className="flex items-center justify-between py-4">

          {/* Left - Empty */}
          <div className="flex-1" />

          {/* Center - Logo */}
          <div className="flex-1 text-center">
            <span className="text-2xl font-bold text-gray-900">
              ParkYYC
            </span>
          </div>

          {/* Right - Auth */}
          <div className="flex-1 flex justify-end items-center">
            {user ? (
              <>
                <span className="text-gray-700 font-medium mr-6">
                  Hi, {user.user_metadata?.name || 'there'}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
              >
                Log In
              </Link>
            )}
          </div>

        </div>

        {/* Bottom Row - Navigation Links (only when logged in) */}
        {user && (
          <div className="flex justify-center items-center py-3 border-t border-gray-100">
            <Link
              href="/"
              className="mx-6 text-gray-700 hover:text-blue-600 font-medium"
            >
              Browse
            </Link>
            <Link
              href="/list-spot"
              className="mx-6 text-gray-700 hover:text-blue-600 font-medium"
            >
              List a Spot
            </Link>
            <Link
              href="/my-spots"
              className="mx-6 text-gray-700 hover:text-blue-600 font-medium"
            >
              My Spots
            </Link>
            <Link
              href="/my-bookings"
              className="mx-6 text-gray-700 hover:text-blue-600 font-medium"
            >
              My Bookings
            </Link>
          </div>
        )}

      </div>
    </nav>
  )
}
