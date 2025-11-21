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
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
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

  // Fetch spots
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/spots')

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
        setLoading(false)
      }
    }

    fetchSpots()
  }, [user])

  const truncateDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Find Your Perfect Parking Spot in Calgary
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
              Connect with local parking spot owners
            </p>

            <div className="mt-10">
              {user ? (
                <p className="text-2xl font-medium">
                  Welcome back, {user.user_metadata?.name || 'there'}!
                </p>
              ) : (
                <Link
                  href="/auth"
                  className="inline-block rounded-md bg-white px-8 py-3 text-lg font-medium text-blue-600 shadow-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
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
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Available Parking Spots
            </h2>
          </div>

          {/* Loading State */}
          {loading && (
            <p className="text-center text-lg text-gray-600">Loading spots...</p>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-center text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && spots.length === 0 && (
            <p className="text-center text-lg text-gray-600">
              No parking spots available yet
            </p>
          )}

          {/* Spots Grid */}
          {!loading && !error && spots.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {spots.map((spot) => (
                <Link
                  key={spot.id}
                  href={`/spots/${spot.id}`}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
                >
                  {/* Neighborhood Badge */}
                  <div className="mb-3">
                    <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                      {spot.neighborhood}
                    </span>
                  </div>

                  {/* Address */}
                  <h3 className="mb-2 text-lg font-bold text-gray-900">
                    {spot.address}
                  </h3>

                  {/* Price */}
                  <p className="mb-3 text-2xl font-bold text-blue-600">
                    ${spot.price_per_day}/day
                  </p>

                  {/* Description */}
                  {spot.description && (
                    <p className="text-sm text-gray-600">
                      {truncateDescription(spot.description, 100)}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
