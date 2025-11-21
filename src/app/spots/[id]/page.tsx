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

  const handleConfirmBooking = () => {
    // TODO: Implement actual booking logic
    setShowDialog(false)
    // For now, just close the dialog
  }

  const handleCancelBooking = () => {
    setShowDialog(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 pt-16">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    )
  }

  if (error || !spot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pt-16">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error || 'Spot not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-6 py-8">
            {/* Neighborhood Badge */}
            <div className="mb-4">
              <span className="inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
                {spot.neighborhood}
              </span>
            </div>

            {/* Address */}
            <h1 className="mb-6 text-4xl font-bold text-gray-900">
              {spot.address}
            </h1>

            {/* Description */}
            {spot.description && (
              <div className="mb-6">
                <h2 className="mb-2 text-lg font-semibold text-gray-900">
                  Description
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">{spot.description}</p>
              </div>
            )}

            {/* Owner */}
            <div className="mb-8">
              <p className="text-sm text-gray-600">
                Listed by <span className="font-medium">{spot.owner.name}</span>
              </p>
            </div>

            {/* Price */}
            <div className="mb-8 rounded-lg bg-blue-50 p-6">
              <p className="text-5xl font-bold text-blue-600">
                ${spot.price_per_day}
                <span className="text-2xl text-gray-600">/day</span>
              </p>
            </div>

            {/* Book Button */}
            <button
              onClick={handleBookClick}
              className="w-full rounded-md bg-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {user ? 'Book This Spot' : 'Log In to Book'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Confirm Booking
            </h3>
            <p className="mb-6 text-gray-700">
              Book this spot for ${spot.price_per_day}/day?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmBooking}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Confirm Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
