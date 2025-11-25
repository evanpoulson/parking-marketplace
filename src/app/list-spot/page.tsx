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
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            List Your Parking Spot
          </h1>
          <div className="mx-auto mt-2 h-1 w-24 bg-yellow-400"></div>
          <p className="mt-4 text-gray-700">
            Start earning by renting out your parking space
          </p>
        </div>

        <div className="animate-scale-in rounded-lg border-l-4 border-yellow-400 bg-white px-8 py-10 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Neighborhood */}
            <div>
              <label
                htmlFor="neighborhood"
                className="block text-sm font-bold text-gray-900"
              >
                Neighborhood <span className="text-red-500">*</span>
              </label>
              <select
                id="neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                disabled={loading || success}
                required
                className="focus-glow mt-2 block w-full appearance-none rounded-lg border-2 border-gray-300 px-4 py-3 transition-all focus:border-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                className="block text-sm font-bold text-gray-900"
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
                className="focus-glow mt-2 block w-full appearance-none rounded-lg border-2 border-gray-300 px-4 py-3 placeholder-gray-400 transition-all focus:border-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-bold text-gray-900"
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
                placeholder="Describe your parking spot (e.g., covered, secure, EV charging available)..."
                className="focus-glow mt-2 block w-full appearance-none rounded-lg border-2 border-gray-300 px-4 py-3 placeholder-gray-400 transition-all focus:border-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="mt-2 text-sm text-gray-600">
                {description.length}/500 characters
              </p>
            </div>

            {/* Price per Day */}
            <div>
              <label
                htmlFor="pricePerDay"
                className="block text-sm font-bold text-gray-900"
              >
                Price per Day <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="text-lg font-bold text-gray-700">$</span>
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
                  className="focus-glow block w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 placeholder-gray-400 transition-all focus:border-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Minimum $5, increments of $5
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="animate-slide-in rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                <p className="font-medium text-red-800">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="animate-slide-in rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
                <p className="font-medium text-green-800">
                  ✓ Spot created! Redirecting to your spots...
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || success}
                className="btn-accent btn-press relative flex w-full justify-center text-lg font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10">{loading ? 'Creating Listing...' : '🅿️ Create Listing'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
