'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Spot {
  id: string
  address: string
  neighborhood: string
  description: string
  price_per_day: number
  owner_id: string
  owner: {
    name: string
  }
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [spots, setSpots] = useState<Spot[]>([])
  const [spotsLoading, setSpotsLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createClient()

  // Fetch user
  useEffect(() => {
    const getUser = async () => {
      try {
        setUserLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } finally {
        setUserLoading(false)
      }
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

  // Fetch spots - only when user data is ready
  useEffect(() => {
    // Don't fetch spots until we know if user is logged in
    if (userLoading) return

    const fetchSpots = async () => {
      try {
        setSpotsLoading(true)
        const response = await fetch('/api/spots', {
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch spots')
        }

        const data = await response.json()
        const allSpots = data.spots || []

        // Filter out the current user's own spots
        const filteredSpots = user
          ? allSpots.filter((spot: Spot) => spot.owner_id !== user.id)
          : allSpots

        setSpots(filteredSpots)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load parking spots')
      } finally {
        setSpotsLoading(false)
      }
    }

    fetchSpots()
  }, [user, userLoading])

  const truncateDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero-grid-light relative overflow-hidden bg-white border-b-4 border-yellow-400 py-24">
        {/* Diagonal accent stripe */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-yellow-400/5 to-transparent"></div>

        {/* Parking sign accent */}
        <div className="absolute left-8 top-8 text-6xl opacity-10">🅿️</div>
        <div className="absolute right-16 bottom-12 text-6xl opacity-10">🅿️</div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
              Find Your Perfect<br />Parking Spot in Calgary
            </h1>
            <p className="animate-fade-in-delay mx-auto mt-6 max-w-2xl text-xl text-gray-700">
              Connect with local parking spot owners. Simple. Fast. Reliable.
            </p>

            <div className="mt-10">
              {user ? (
                <p className="animate-fade-in-delay text-2xl font-bold text-gray-900">
                  Welcome back, <span className="text-blue-800">{user.user_metadata?.name || 'there'}</span>!
                </p>
              ) : (
                <Link
                  href="/auth"
                  className="animate-float inline-block rounded-lg bg-yellow-400 px-8 py-4 text-lg font-bold text-gray-900 shadow-lg transition-all hover:bg-yellow-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Available Spots Section - Only show when user is logged in */}
      {user && (
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Available Parking Spots
            </h2>
            <div className="mx-auto mt-2 h-1 w-24 bg-yellow-400"></div>
          </div>

          {/* Loading State - Skeleton Loaders */}
          {(userLoading || spotsLoading) && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-8 w-32 rounded-md bg-gray-200"></div>
                    <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                  </div>
                  <div className="mb-3 h-6 w-3/4 rounded bg-gray-200"></div>
                  <div className="mb-4 h-10 w-32 rounded bg-gray-200"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-gray-200"></div>
                    <div className="h-4 w-5/6 rounded bg-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!userLoading && !spotsLoading && error && (
            <div className="animate-slide-in rounded-lg border-l-4 border-red-500 bg-red-50 p-6">
              <p className="text-center font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!userLoading && !spotsLoading && !error && spots.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                <span className="text-5xl">🅿️</span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                No Parking Spots Available
              </h3>
              <p className="text-gray-600">
                Be the first to list a spot in your neighborhood!
              </p>
              <Link
                href="/list-spot"
                className="mt-6 inline-block rounded-lg bg-yellow-400 px-6 py-3 font-bold text-gray-900 transition-all hover:bg-yellow-300 hover:shadow-lg"
              >
                List Your First Spot
              </Link>
            </div>
          )}

          {/* Spots Grid */}
          {!userLoading && !spotsLoading && !error && spots.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {spots.map((spot, index) => (
                <Link
                  key={spot.id}
                  href={`/spots/${spot.id}`}
                  className="card-lift border-accent-hover group cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-md"
                  style={{
                    animation: `scaleIn 0.4s ease-out ${index * 0.1}s forwards`,
                    opacity: 0
                  }}
                >
                  {/* Neighborhood Badge */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="inline-block rounded-md bg-blue-800 px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-white">
                      {spot.neighborhood}
                    </span>
                    <span className="text-2xl">🅿️</span>
                  </div>

                  {/* Address */}
                  <h3 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-blue-800 transition-colors">
                    {spot.address}
                  </h3>

                  {/* Price */}
                  <p className="mb-4 font-mono text-3xl font-bold text-yellow-600">
                    ${spot.price_per_day}<span className="text-lg text-gray-700">/day</span>
                  </p>

                  {/* Description */}
                  {spot.description && (
                    <p className="text-sm leading-relaxed text-gray-700">
                      {truncateDescription(spot.description, 100)}
                    </p>
                  )}

                  {/* Hover indicator */}
                  <div className="mt-4 flex items-center text-sm font-semibold text-blue-800 opacity-0 transition-opacity group-hover:opacity-100">
                    <span>View Details</span>
                    <span className="ml-1">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
