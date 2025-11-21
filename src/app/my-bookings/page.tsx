'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Booking {
  id: string
  created_at: string
  status: string
  spot: {
    id: string
    address: string
    neighborhood: string
    price_per_day: number
  }
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/bookings/my-bookings')

        if (!response.ok) {
          throw new Error('Failed to fetch your bookings')
        }

        const data = await response.json()
        setBookings(data.bookings || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load your bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchMyBookings()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-gray-600">
            View your parking spot reservations
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading your bookings...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && bookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-6">
              You haven't booked any spots yet
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
            >
              Browse Available Spots
            </Link>
          </div>
        )}

        {/* Bookings Grid */}
        {!loading && !error && bookings.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                {/* Neighborhood Badge and Status */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {booking.spot.neighborhood}
                  </span>
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    Confirmed
                  </span>
                </div>

                {/* Address */}
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  {booking.spot.address}
                </h3>

                {/* Price */}
                <p className="mb-3 text-2xl font-bold text-blue-600">
                  ${booking.spot.price_per_day}/day
                </p>

                {/* Booking Date */}
                <p className="text-sm text-gray-600">
                  Booked on {formatDate(booking.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
