'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import SearchBar from './SearchBar'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const supabase = createClient()

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
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
      <header
        className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
          isScrolled ? 'py-3 shadow-md' : 'py-6 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-8 relative flex items-center">

          {/* Logo - Absolute Left */}
          <Link
            href="/"
            className={`absolute left-8 font-bold tracking-tight transition-all duration-300 ${
              isScrolled ? 'text-2xl' : 'text-3xl'
            }`}
          >
            <span className="text-blue-600">Park</span>
            <span className="text-yellow-400">YYC</span>
          </Link>

          {/* Search - Centered */}
          <div className="flex-1 flex justify-center">
            {!isScrolled ? (
              <div className="w-full max-w-3xl">
                <SearchBar mode="full" />
              </div>
            ) : (
              <button
                onClick={() => setShowSearchModal(true)}
                className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
              >
                <span className="text-sm font-semibold text-gray-700">Calgary</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm font-semibold text-gray-700">Any week</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">Add guests</span>
                <div className="ml-1 bg-yellow-400 p-2 rounded-full">
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

          {/* User Menu - Absolute Right */}
          <div className={`absolute right-8 flex items-center gap-3 transition-all duration-300 ${
            isScrolled ? 'text-sm' : ''
          }`}>
            {user ? (
              <>
                <span className="hidden md:inline text-gray-700">
                  Hi, <span className="font-semibold text-blue-800">
                    {user.user_metadata?.name?.split(' ')[0] || 'there'}
                  </span>
                </span>

                <div className={`rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md transition-all duration-300 ${
                  isScrolled ? 'w-9 h-9' : 'w-10 h-10'
                }`}>
                  <span className={`font-bold text-white transition-all duration-300 ${
                    isScrolled ? 'text-xs' : 'text-sm'
                  }`}>
                    {getUserInitials()}
                  </span>
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
      </header>

      {/* Search Modal (when compact search is clicked) */}
      {showSearchModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-[100]"
            onClick={() => setShowSearchModal(false)}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-24 px-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 relative animate-slide-in">
              {/* Close Button */}
              <button
                onClick={() => setShowSearchModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close search"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Full Search Bar */}
              <SearchBar mode="full" />
            </div>
          </div>
        </>
      )}
    </>
  )
}
