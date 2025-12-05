'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import SearchBar from './SearchBar'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const supabase = createClient()

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Get user auth state
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

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

  const getUserInitials = () => {
    if (!user?.user_metadata?.name) return 'U'
    return user.user_metadata.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* LEFT - Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <span className="text-2xl font-bold tracking-tight">
                Park<span className="text-yellow-400">YYC</span>
              </span>
            </Link>

            {/* CENTER - Search Bar */}
            <div className="flex-1 flex justify-center mx-8">
              {!isScrolled || searchExpanded ? (
                <div className="w-full max-w-3xl">
                  <SearchBar mode="full" onCollapse={() => setSearchExpanded(false)} />
                </div>
              ) : (
                <button
                  onClick={() => setSearchExpanded(true)}
                  className="flex items-center gap-3 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-full shadow-sm hover:shadow-md transition-all"
                >
                  <span className="text-sm font-semibold text-gray-700">Calgary</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm font-semibold text-gray-700">Any week</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-500">Add guests</span>
                  <div className="ml-2 bg-yellow-400 p-2 rounded-full">
                    <svg
                      className="w-4 h-4 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </button>
              )}
            </div>

            {/* RIGHT - User Menu */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {user ? (
                <>
                  {/* Navigation Links */}
                  <nav className="hidden lg:flex items-center gap-6 mr-4">
                    <Link
                      href="/"
                      className="text-sm font-medium text-gray-700 hover:text-blue-800 transition-colors"
                    >
                      Browse
                    </Link>
                    <Link
                      href="/list-spot"
                      className="text-sm font-medium text-gray-700 hover:text-blue-800 transition-colors"
                    >
                      List a Spot
                    </Link>
                    <Link
                      href="/my-spots"
                      className="text-sm font-medium text-gray-700 hover:text-blue-800 transition-colors"
                    >
                      My Spots
                    </Link>
                    <Link
                      href="/my-bookings"
                      className="text-sm font-medium text-gray-700 hover:text-blue-800 transition-colors"
                    >
                      My Bookings
                    </Link>
                  </nav>

                  <span className="hidden md:inline text-sm text-gray-700">
                    Hi, <span className="font-semibold text-blue-800">{user.user_metadata?.name?.split(' ')[0] || 'there'}</span>
                  </span>

                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
                    <span className="text-sm font-bold text-white">{getUserInitials()}</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="hidden md:inline-block text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Log In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Full Screen Search Overlay when expanded while scrolled */}
      {isScrolled && searchExpanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-[55]"
            onClick={() => setSearchExpanded(false)}
          />

          {/* Search Modal */}
          <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl z-[60] px-4">
            <div className="bg-white rounded-3xl shadow-2xl p-6 animate-slide-in">
              <SearchBar mode="full" onCollapse={() => setSearchExpanded(false)} />
            </div>
          </div>
        </>
      )}
    </>
  )
}
