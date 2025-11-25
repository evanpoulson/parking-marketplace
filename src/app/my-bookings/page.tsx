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
    description: string
    price_per_day: number
  }
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [cancelSuccess, setCancelSuccess] = useState(false)

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

  const truncateDescription = (text: string, maxLength: number) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId)
    setShowCancelDialog(true)
    setCancelError('')
  }

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return

    setCancelLoading(true)
    setCancelError('')

    try {
      const response = await fetch(`/api/bookings/${bookingToCancel}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking')
      }

      // Success!
      setCancelSuccess(true)

      // Remove the cancelled booking from the list
      setBookings(bookings.filter(b => b.id !== bookingToCancel))

      // Close dialog after a brief delay
      setTimeout(() => {
        setShowCancelDialog(false)
        setCancelSuccess(false)
        setBookingToCancel(null)
      }, 1500)
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Failed to cancel booking')
      setCancelLoading(false)
    }
  }

  const handleCloseCancelDialog = () => {
    if (!cancelLoading) {
      setShowCancelDialog(false)
      setCancelError('')
      setBookingToCancel(null)
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">My Bookings</h1>
          <div className="mx-auto mt-2 h-1 w-24 bg-yellow-400"></div>
          <p className="mt-4 text-gray-700">
            View your parking spot reservations
          </p>
        </div>

        {/* Loading State - Skeleton Loaders */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <div className="animate-shimmer h-8 w-32 rounded-md"></div>
                  <div className="animate-shimmer h-8 w-24 rounded-full"></div>
                </div>
                <div className="animate-shimmer mb-3 h-6 w-3/4 rounded"></div>
                <div className="animate-shimmer mb-4 h-10 w-32 rounded"></div>
                <div className="space-y-2">
                  <div className="animate-shimmer h-4 w-full rounded"></div>
                  <div className="animate-shimmer h-4 w-2/3 rounded"></div>
                </div>
                <div className="animate-shimmer mt-4 h-10 w-full rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="animate-slide-in rounded-lg border-l-4 border-red-500 bg-red-50 p-6">
            <p className="font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
              <span className="text-5xl">🅿️</span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              No Bookings Yet
            </h3>
            <p className="mb-6 text-gray-700">
              Book a parking spot to see it here
            </p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-yellow-400 px-6 py-3 font-bold text-gray-900 transition-all hover:bg-yellow-300 hover:shadow-lg"
            >
              Browse Available Spots
            </Link>
          </div>
        )}

        {/* Bookings Grid */}
        {!loading && !error && bookings.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking, index) => (
              <div
                key={booking.id}
                className="card-lift card-depth rounded-lg border-l-4 border-green-400 bg-white p-6 shadow-lg"
                style={{
                  animation: `scaleIn 0.4s ease-out ${index * 0.1}s forwards`,
                  opacity: 0
                }}
              >
                {/* Neighborhood Badge and Status */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="animate-pulse-badge inline-block rounded-md bg-blue-800 px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-white shadow-md">
                    {booking.spot.neighborhood}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-green-100 px-3 py-1.5 text-sm font-bold text-green-800 shadow-sm">
                    <span>✓</span> Confirmed
                  </span>
                </div>

                {/* Address with icon */}
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <span className="text-base">📍</span>
                  {booking.spot.address}
                </h3>

                {/* Price - More prominent */}
                <div className="mb-3 rounded-lg bg-yellow-50 px-4 py-3 border-l-4 border-yellow-400">
                  <p className="font-mono text-3xl font-bold text-yellow-600">
                    ${booking.spot.price_per_day}<span className="text-lg text-gray-600">/day</span>
                  </p>
                </div>

                {/* Description */}
                {booking.spot.description && (
                  <p className="mb-3 text-sm leading-relaxed text-gray-700">
                    {truncateDescription(booking.spot.description, 150)}
                  </p>
                )}

                {/* Booking Date */}
                <p className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-600">
                  <span>📅</span> Booked on {formatDate(booking.created_at)}
                </p>

                {/* Cancel Booking Button */}
                <button
                  onClick={() => handleCancelClick(booking.id)}
                  className="btn-press w-full rounded-lg border-2 border-red-300 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition-all hover:bg-red-50 hover:border-red-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Cancel Booking
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Cancel Booking
            </h3>

            {cancelSuccess ? (
              <div className="mb-6 rounded-md bg-green-50 p-4">
                <p className="text-sm font-medium text-green-800">
                  Booking cancelled successfully!
                </p>
              </div>
            ) : (
              <>
                <p className="mb-6 text-gray-700">
                  Are you sure you want to cancel this booking?
                </p>

                {cancelError && (
                  <div className="mb-4 rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{cancelError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmCancel}
                    disabled={cancelLoading}
                    className="flex-1 rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed"
                  >
                    {cancelLoading ? 'Cancelling...' : 'Confirm'}
                  </button>
                  <button
                    onClick={handleCloseCancelDialog}
                    disabled={cancelLoading}
                    className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
