'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Spot {
  id: string
  address: string
  neighborhood: string
  description: string
  price_per_day: number
  owner_id: string
  image_url?: string
  owner: {
    name: string
  }
}

interface NeighborhoodGroup {
  neighborhood: string
  spots: Spot[]
}

export default function HomePage() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [spotsLoading, setSpotsLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch spots
  useEffect(() => {
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
        setSpots(data.spots || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load parking spots')
      } finally {
        setSpotsLoading(false)
      }
    }

    fetchSpots()
  }, [])

  // Group spots by neighborhood
  const groupedSpots: NeighborhoodGroup[] = spots.reduce((acc, spot) => {
    const existing = acc.find(g => g.neighborhood === spot.neighborhood)
    if (existing) {
      existing.spots.push(spot)
    } else {
      acc.push({ neighborhood: spot.neighborhood, spots: [spot] })
    }
    return acc
  }, [] as NeighborhoodGroup[])

  const truncateDescription = (text: string, maxLength: number) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Loading State */}
          {spotsLoading && (
            <div className="space-y-12">
              {[1, 2].map((section) => (
                <div key={section}>
                  <div className="animate-shimmer h-8 w-64 rounded mb-6"></div>
                  <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-shrink-0 w-80">
                        <div className="animate-shimmer h-64 w-full rounded-xl mb-3"></div>
                        <div className="animate-shimmer h-6 w-3/4 rounded mb-2"></div>
                        <div className="animate-shimmer h-8 w-32 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!spotsLoading && error && (
            <div className="animate-slide-in rounded-xl border-l-4 border-red-500 bg-red-50 p-6">
              <p className="text-center font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!spotsLoading && !error && spots.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-16 text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100">
                <span className="text-6xl">🅿️</span>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">
                No Parking Spots Available
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Be the first to list a spot in your neighborhood!
              </p>
              <Link
                href="/list-spot"
                className="inline-block rounded-xl bg-yellow-400 px-8 py-4 font-bold text-gray-900 transition-all hover:bg-yellow-500 hover:shadow-lg"
              >
                List a Spot
              </Link>
            </div>
          )}

          {/* Neighborhood Carousels */}
          {!spotsLoading && !error && groupedSpots.length > 0 && (
            <div className="space-y-12">
              {groupedSpots.map((group, groupIndex) => (
                <NeighborhoodCarousel
                  key={group.neighborhood}
                  neighborhood={group.neighborhood}
                  spots={group.spots}
                  groupIndex={groupIndex}
                  truncateDescription={truncateDescription}
                />
              ))}
            </div>
          )}
      </div>
    </div>
  )
}

// Neighborhood Carousel Component
function NeighborhoodCarousel({
  neighborhood,
  spots,
  groupIndex,
  truncateDescription,
}: {
  neighborhood: string
  spots: Spot[]
  groupIndex: number
  truncateDescription: (text: string, maxLength: number) => string
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340 // Card width + gap
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount)

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        animationDelay: `${groupIndex * 0.1}s`,
        opacity: 0,
        animationFillMode: 'forwards',
      }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Popular in <span className="text-blue-800">{neighborhood}</span>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="rounded-full bg-white border-2 border-gray-300 p-3 shadow-md hover:border-gray-900 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            aria-label="Scroll left"
          >
            <svg
              className="w-5 h-5 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="rounded-full bg-white border-2 border-gray-300 p-3 shadow-md hover:border-gray-900 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Scroll right"
          >
            <svg
              className="w-5 h-5 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {spots.map((spot, index) => (
          <SpotCard
            key={spot.id}
            spot={spot}
            index={index}
            truncateDescription={truncateDescription}
          />
        ))}
      </div>
    </div>
  )
}

// Airbnb-style Spot Card Component
function SpotCard({
  spot,
  index,
  truncateDescription,
}: {
  spot: Spot
  index: number
  truncateDescription: (text: string, maxLength: number) => string
}) {
  const [imageError, setImageError] = useState(false)

  return (
    <Link
      href={`/spots/${spot.id}`}
      className="group flex-shrink-0 w-80 cursor-pointer transition-all duration-300 hover:scale-105"
      style={{
        animation: `scaleIn 0.4s ease-out ${index * 0.1}s forwards`,
        opacity: 0,
      }}
    >
      {/* Image Container */}
      <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-gray-200 mb-3 shadow-md group-hover:shadow-2xl transition-shadow">
        {spot.image_url && !imageError ? (
          <Image
            src={spot.image_url}
            alt={spot.address}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, 320px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <span className="text-8xl opacity-40">🅿️</span>
          </div>
        )}

        {/* Neighborhood Badge Overlay */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-block rounded-lg bg-white/95 backdrop-blur-sm px-3 py-2 text-sm font-bold text-gray-900 shadow-lg">
            {spot.neighborhood}
          </span>
        </div>
      </div>

      {/* Card Info */}
      <div className="px-1">
        {/* Address */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate group-hover:text-blue-800 transition-colors">
          {spot.address}
        </h3>

        {/* Description */}
        {spot.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
            {truncateDescription(spot.description, 60)}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-gray-900">
            ${spot.price_per_day}
          </span>
          <span className="text-sm text-gray-600">/ day</span>
        </div>
      </div>
    </Link>
  )
}
