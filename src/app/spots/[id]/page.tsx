'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Spot {
  id: string
  address: string
  neighborhood: string
  description: string
  price_per_day: number
  owner: {
    name: string
  }
}

export default function SpotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Unwrap params using React.use()
  const { id } = use(params)

  const [spot, setSpot] = useState<Spot | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch spot details
        const spotResponse = await fetch(`/api/spots/${id}`)
        if (!spotResponse.ok) {
          throw new Error('Failed to fetch spot details')
        }
        const spotData = await spotResponse.json()
        setSpot(spotData.spot)

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load spot')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, supabase.auth])

  const handleBookClick = () => {
    if (!user) {
      router.push('/auth')
    } else {
      setShowDialog(true)
    }
  }

  const handleConfirmBooking = async () => {
    if (!spot) return

    setBookingLoading(true)
    setBookingError('')

    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spotId: spot.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      // Success!
      setBookingSuccess(true)

      // Redirect to My Bookings after 1 second
      setTimeout(() => {
        router.push('/my-bookings')
      }, 1000)
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Failed to create booking')
      setBookingLoading(false)
    }
  }

  const handleCancelBooking = () => {
    setShowDialog(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-800 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-600">Loading spot details...</p>
        </div>
      </div>
    )
  }

  if (error || !spot) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="animate-slide-in rounded-lg border-l-4 border-red-500 bg-red-50 p-6">
          <p className="font-medium text-red-800">{error || 'Spot not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="animate-scale-in overflow-hidden rounded-lg border-l-4 border-yellow-400 bg-white shadow-xl">
          <div className="px-8 py-10">
            {/* Neighborhood Badge */}
            <div className="mb-6 flex items-center justify-between">
              <span className="inline-block rounded-md bg-blue-800 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white">
                {spot.neighborhood}
              </span>
              <span className="text-4xl">🅿️</span>
            </div>

            {/* Address */}
            <h1 className="mb-8 text-5xl font-bold tracking-tight text-gray-900">
              {spot.address}
            </h1>

            {/* Description */}
            {spot.description && (
              <div className="mb-8 rounded-lg bg-gray-50 p-6">
                <h2 className="mb-3 text-lg font-bold text-gray-900">
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{spot.description}</p>
              </div>
            )}

            {/* Owner */}
            <div className="mb-8">
              <p className="text-sm text-gray-600">
                Listed by <span className="font-bold text-blue-800">{spot.owner.name}</span>
              </p>
            </div>

            {/* Price */}
            <div className="mb-8 rounded-lg border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 p-8">
              <p className="font-mono text-6xl font-bold text-gray-900">
                ${spot.price_per_day}
                <span className="text-2xl text-gray-600">/day</span>
              </p>
            </div>

            {/* Book Button */}
            <button
              onClick={handleBookClick}
              className="btn-accent w-full text-xl font-bold uppercase tracking-wide shadow-xl"
            >
              {user ? '🅿️ Book This Spot' : 'Log In to Book'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4 backdrop-blur-sm">
          <div className="animate-scale-in w-full max-w-md rounded-lg border-l-4 border-yellow-400 bg-white p-8 shadow-2xl">
            <h3 className="mb-6 text-2xl font-bold text-gray-900">
              Confirm Booking
            </h3>

            {bookingSuccess ? (
              <div className="animate-slide-in rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
                <p className="font-semibold text-green-800">
                  ✓ Booking confirmed! Redirecting...
                </p>
              </div>
            ) : (
              <>
                <p className="mb-6 text-lg text-gray-700">
                  Book this spot for <span className="font-bold text-yellow-600">${spot.price_per_day}/day</span>?
                </p>

                {bookingError && (
                  <div className="animate-slide-in mb-4 rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-800">{bookingError}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={handleConfirmBooking}
                    disabled={bookingLoading}
                    className="btn-accent flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingLoading ? 'Booking...' : '✓ Confirm Booking'}
                  </button>
                  <button
                    onClick={handleCancelBooking}
                    disabled={bookingLoading}
                    className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
