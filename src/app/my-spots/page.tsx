'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Spot {
  id: string
  address: string
  neighborhood: string
  description: string
  price_per_day: number
  is_available: boolean
  created_at: string
}

export default function MySpotsPage() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMySpots = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/spots/my-spots')

        if (!response.ok) {
          throw new Error('Failed to fetch your spots')
        }

        const data = await response.json()
        setSpots(data.spots || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load your spots')
      } finally {
        setLoading(false)
      }
    }

    fetchMySpots()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Spots</h1>
          <p className="mt-2 text-gray-600">
            Manage your parking spot listings
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading your spots...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && spots.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-6">
              You haven't listed any spots yet
            </p>
            <Link
              href="/list-spot"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
            >
              List Your First Spot
            </Link>
          </div>
        )}

        {/* Spots Grid */}
        {!loading && !error && spots.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {spots.map((spot) => (
              <div
                key={spot.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                {/* Neighborhood Badge */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {spot.neighborhood}
                  </span>
                  {/* Availability Badge */}
                  {spot.is_available ? (
                    <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                      Available
                    </span>
                  ) : (
                    <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                      Booked
                    </span>
                  )}
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
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {spot.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
