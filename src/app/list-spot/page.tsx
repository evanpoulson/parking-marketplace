'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const NEIGHBORHOODS = [
  'Downtown',
  '17th Avenue',
  'Beltline',
  'Inglewood',
  'Kensington',
  'Mission',
  'East Village',
  'Bridgeland',
]

export default function ListSpotPage() {
  const [neighborhood, setNeighborhood] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [pricePerDay, setPricePerDay] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validate required fields
    if (!neighborhood || !address || !pricePerDay) {
      setError('Please fill in all required fields')
      return
    }

    const price = parseFloat(pricePerDay)
    if (isNaN(price) || price < 5) {
      setError('Price must be at least $5')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/spots/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          neighborhood,
          address,
          description,
          pricePerDay: price,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create listing')
      }

      // Success
      setSuccess(true)

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/my-spots')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white px-6 py-8 shadow sm:rounded-lg">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">
            List Your Parking Spot
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Neighborhood */}
            <div>
              <label
                htmlFor="neighborhood"
                className="block text-sm font-medium text-gray-700"
              >
                Neighborhood <span className="text-red-500">*</span>
              </label>
              <select
                id="neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                disabled={loading || success}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
              >
                <option value="">Select a neighborhood</option>
                {NEIGHBORHOODS.map((hood) => (
                  <option key={hood} value={hood}>
                    {hood}
                  </option>
                ))}
              </select>
            </div>

            {/* Street Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={loading || success}
                required
                placeholder="123 Main St SW"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                disabled={loading || success}
                maxLength={500}
                rows={4}
                placeholder="Describe your parking spot..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                {description.length}/500
              </p>
            </div>

            {/* Price per Day */}
            <div>
              <label
                htmlFor="pricePerDay"
                className="block text-sm font-medium text-gray-700"
              >
                Price per Day <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  id="pricePerDay"
                  type="number"
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  disabled={loading || success}
                  required
                  min={5}
                  step={5}
                  placeholder="20"
                  className="block w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Minimum $5, increments of $5
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-800">
                  Spot created! Redirecting to your spots...
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || success}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Listing...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
