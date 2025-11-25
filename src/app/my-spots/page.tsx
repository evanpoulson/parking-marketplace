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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [spotToDelete, setSpotToDelete] = useState<Spot | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deleteSuccess, setDeleteSuccess] = useState(false)

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

  const handleDeleteClick = (spot: Spot) => {
    setSpotToDelete(spot)
    setShowDeleteDialog(true)
    setDeleteError('')
  }

  const handleConfirmDelete = async () => {
    if (!spotToDelete) return

    setDeleteLoading(true)
    setDeleteError('')

    try {
      const response = await fetch(`/api/spots/${spotToDelete.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete spot')
      }

      // Success!
      setDeleteSuccess(true)

      // Remove the deleted spot from the list
      setSpots(spots.filter(s => s.id !== spotToDelete.id))

      // Close dialog after a brief delay
      setTimeout(() => {
        setShowDeleteDialog(false)
        setDeleteSuccess(false)
        setSpotToDelete(null)
      }, 1500)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete spot')
      setDeleteLoading(false)
    }
  }

  const handleCloseDeleteDialog = () => {
    if (!deleteLoading) {
      setShowDeleteDialog(false)
      setDeleteError('')
      setSpotToDelete(null)
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">My Spots</h1>
          <div className="mx-auto mt-2 h-1 w-24 bg-yellow-400"></div>
          <p className="mt-4 text-gray-700">
            Manage your parking spot listings
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
                <div className="animate-shimmer h-4 w-full rounded"></div>
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
        {!loading && !error && spots.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
              <span className="text-5xl">🅿️</span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              No Spots Listed Yet
            </h3>
            <p className="mb-6 text-gray-700">
              Start earning by listing your parking spot
            </p>
            <Link
              href="/list-spot"
              className="inline-block rounded-lg bg-yellow-400 px-6 py-3 font-bold text-gray-900 transition-all hover:bg-yellow-300 hover:shadow-lg"
            >
              List Your First Spot
            </Link>
          </div>
        )}

        {/* Spots Grid */}
        {!loading && !error && spots.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {spots.map((spot, index) => (
              <div
                key={spot.id}
                className="card-lift card-depth rounded-lg border-l-4 border-yellow-400 bg-white p-6 shadow-lg"
                style={{
                  animation: `scaleIn 0.4s ease-out ${index * 0.1}s forwards`,
                  opacity: 0
                }}
              >
                {/* Neighborhood Badge */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="animate-pulse-badge inline-block rounded-md bg-blue-800 px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-white shadow-md">
                    {spot.neighborhood}
                  </span>
                  {/* Availability Badge */}
                  {spot.is_available ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-green-100 px-3 py-1.5 text-sm font-bold text-green-800 shadow-sm">
                      <span>✓</span> Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-yellow-100 px-3 py-1.5 text-sm font-bold text-yellow-800 shadow-sm">
                      <span>⏱</span> Booked
                    </span>
                  )}
                </div>

                {/* Address with icon */}
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <span className="text-base">📍</span>
                  {spot.address}
                </h3>

                {/* Price - More prominent */}
                <div className="mb-3 rounded-lg bg-yellow-50 px-4 py-3 border-l-4 border-yellow-400">
                  <p className="font-mono text-3xl font-bold text-yellow-600">
                    ${spot.price_per_day}<span className="text-lg text-gray-600">/day</span>
                  </p>
                </div>

                {/* Description */}
                {spot.description && (
                  <p className="mb-4 text-sm leading-relaxed text-gray-700 line-clamp-2">
                    {spot.description}
                  </p>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteClick(spot)}
                  className="btn-press mt-4 w-full rounded-lg border-2 border-red-300 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition-all hover:bg-red-50 hover:border-red-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  🗑️ Delete Spot
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && spotToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Delete Spot
            </h3>

            {deleteSuccess ? (
              <div className="mb-6 rounded-md bg-green-50 p-4">
                <p className="text-sm font-medium text-green-800">
                  ✓ Spot deleted successfully!
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="mb-2 text-gray-700">
                    Are you sure you want to delete this listing?
                  </p>
                  <div className="rounded-lg bg-gray-50 p-3 mb-3">
                    <p className="font-semibold text-gray-900">{spotToDelete.address}</p>
                    <p className="text-sm text-gray-600">{spotToDelete.neighborhood}</p>
                  </div>
                  {!spotToDelete.is_available && (
                    <div className="rounded-lg bg-yellow-50 border-l-4 border-yellow-400 p-3">
                      <p className="text-sm font-medium text-yellow-800">
                        ⚠️ This spot has an active booking. Deleting it will cancel the booking.
                      </p>
                    </div>
                  )}
                  <p className="mt-3 text-sm text-gray-600">
                    This action cannot be undone.
                  </p>
                </div>

                {deleteError && (
                  <div className="mb-4 rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{deleteError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deleteLoading}
                    className="flex-1 rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed"
                  >
                    {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    onClick={handleCloseDeleteDialog}
                    disabled={deleteLoading}
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
