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
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-yellow-400 shadow-md">
      <div className="max-w-7xl mx-auto px-8">

        {/* Top Row */}
        <div className="flex items-center justify-between py-4">

          {/* Left - Empty */}
          <div className="flex-1" />

          {/* Center - Logo */}
          <div className="flex-1 text-center">
            <Link href="/" className="inline-block">
              <span className="text-3xl font-bold tracking-tighter text-blue-800 transition-colors hover:text-blue-900">
                Park<span className="text-yellow-500">YYC</span>
              </span>
            </Link>
          </div>

          {/* Right - Auth */}
          <div className="flex-1 flex justify-end items-center">
            {user ? (
              <>
                <span className="text-gray-700 font-medium mr-6">
                  Hi, <span className="font-bold text-blue-800">{user.user_metadata?.name || 'there'}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-blue-800 px-5 py-2.5 font-semibold text-white transition-all hover:bg-blue-900 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="rounded-lg bg-blue-800 px-5 py-2.5 font-semibold text-white transition-all hover:bg-blue-900 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
              className="group relative mx-6 py-1 text-gray-700 font-semibold transition-colors hover:text-blue-800"
            >
              Browse
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/list-spot"
              className="group relative mx-6 py-1 text-gray-700 font-semibold transition-colors hover:text-blue-800"
            >
              List a Spot
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/my-spots"
              className="group relative mx-6 py-1 text-gray-700 font-semibold transition-colors hover:text-blue-800"
            >
              My Spots
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/my-bookings"
              className="group relative mx-6 py-1 text-gray-700 font-semibold transition-colors hover:text-blue-800"
            >
              My Bookings
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
        )}

      </div>
    </nav>
  )
}
