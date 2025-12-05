'use client'

import { useState, useRef, useEffect } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import { format, addDays, addWeeks, addMonths } from 'date-fns'
import 'react-day-picker/dist/style.css'

const NEIGHBORHOODS = [
  'Downtown',
  'Beltline',
  '17th Avenue',
  'East Village',
  'Bridgeland',
  'Kensington',
  'Inglewood',
  'Mission',
  'Hillhurst',
  'Sunnyside',
  'Victoria Park',
  'Chinatown',
  'Eau Claire',
  'Crescent Heights',
  'Ramsay',
  'Cliff Bungalow',
]

export default function SearchBar() {
  const [activeSection, setActiveSection] = useState<'where' | 'when' | null>(null)
  const [searchText, setSearchText] = useState('')
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  const searchBarRef = useRef<HTMLDivElement>(null)

  // Calculate dropdown position when opening
  useEffect(() => {
    if (activeSection && searchBarRef.current) {
      const rect = searchBarRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }, [activeSection])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setActiveSection(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter neighborhoods based on search text
  const filteredNeighborhoods = NEIGHBORHOODS.filter((neighborhood) =>
    neighborhood.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleNeighborhoodClick = (neighborhood: string) => {
    setSelectedNeighborhood(neighborhood)
    setActiveSection(null)
  }

  const handleQuickDate = (type: '1day' | '3days' | '1week' | '1month') => {
    const today = new Date()
    let endDate: Date

    switch (type) {
      case '1day':
        endDate = addDays(today, 1)
        break
      case '3days':
        endDate = addDays(today, 3)
        break
      case '1week':
        endDate = addWeeks(today, 1)
        break
      case '1month':
        endDate = addMonths(today, 1)
        break
    }

    setDateRange({ from: today, to: endDate })
  }

  const formatDateDisplay = () => {
    if (!dateRange?.from) return 'Add dates'
    if (!dateRange.to) return format(dateRange.from, 'MMM d')
    return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
  }

  return (
    <div ref={searchBarRef} className="relative w-full max-w-4xl mx-auto">
      {/* Search Bar */}
      <div className="bg-white rounded-full shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center divide-x divide-gray-300">
          {/* Where Section */}
          <button
            onClick={() => setActiveSection(activeSection === 'where' ? null : 'where')}
            className={`flex-1 px-8 py-4 text-left rounded-l-full hover:bg-gray-100 transition-all ${
              activeSection === 'where' ? 'bg-blue-50 border-2 border-blue-500 shadow-inner' : 'border-2 border-transparent'
            }`}
          >
            <div className="text-xs font-semibold text-gray-900 mb-1">Where</div>
            <div className="text-sm text-gray-600 truncate">
              {selectedNeighborhood || 'Search destinations'}
            </div>
          </button>

          {/* When Section */}
          <button
            onClick={() => setActiveSection(activeSection === 'when' ? null : 'when')}
            className={`flex-1 px-8 py-4 text-left hover:bg-gray-100 transition-all ${
              activeSection === 'when' ? 'bg-blue-50 border-2 border-blue-500 shadow-inner' : 'border-2 border-transparent'
            }`}
          >
            <div className="text-xs font-semibold text-gray-900 mb-1">When</div>
            <div className="text-sm text-gray-600 truncate">{formatDateDisplay()}</div>
          </button>

          {/* Search Button */}
          <button className="px-6 py-4 rounded-r-full bg-yellow-400 hover:bg-yellow-500 transition-all duration-300 hover:shadow-lg group border-2 border-transparent">
            <div className="flex items-center gap-2">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="text-gray-900 font-semibold hidden md:inline">Search</span>
            </div>
          </button>
        </div>
      </div>

      {/* Where Dropdown */}
      {activeSection === 'where' && (
        <div
          className="fixed bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-in"
          style={{
            zIndex: 9999,
            top: `${dropdownPosition.top + 12}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          <div className="p-8">
            {/* Search Input */}
            <div className="mb-6">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search neighborhoods..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  autoFocus
                />
              </div>
            </div>

            {/* Recent Searches - Placeholder */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Recent Searches
              </h3>
              <p className="text-sm text-gray-400 italic">No recent searches</p>
            </div>

            {/* Search by Region */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Search by Region
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredNeighborhoods.map((neighborhood) => (
                  <button
                    key={neighborhood}
                    onClick={() => handleNeighborhoodClick(neighborhood)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-300 text-left group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{neighborhood}</span>
                  </button>
                ))}
              </div>
              {filteredNeighborhoods.length === 0 && (
                <p className="text-sm text-gray-400 italic text-center py-8">
                  No neighborhoods found
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* When Dropdown */}
      {activeSection === 'when' && (
        <div
          className="fixed bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-in"
          style={{
            zIndex: 9999,
            top: `${dropdownPosition.top + 12}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          <div className="p-8">
            {/* Quick Select Buttons */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Quick Select
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleQuickDate('1day')}
                  className="px-4 py-2 bg-gray-100 hover:bg-blue-100 border border-gray-300 hover:border-blue-500 rounded-full text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
                >
                  1 Day
                </button>
                <button
                  onClick={() => handleQuickDate('3days')}
                  className="px-4 py-2 bg-gray-100 hover:bg-blue-100 border border-gray-300 hover:border-blue-500 rounded-full text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
                >
                  3 Days
                </button>
                <button
                  onClick={() => handleQuickDate('1week')}
                  className="px-4 py-2 bg-gray-100 hover:bg-blue-100 border border-gray-300 hover:border-blue-500 rounded-full text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
                >
                  1 Week
                </button>
                <button
                  onClick={() => handleQuickDate('1month')}
                  className="px-4 py-2 bg-gray-100 hover:bg-blue-100 border border-gray-300 hover:border-blue-500 rounded-full text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
                >
                  1 Month
                </button>
              </div>
            </div>

            {/* Calendar */}
            <div className="flex justify-center">
              <DayPicker
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                disabled={{ before: new Date() }}
                className="search-bar-calendar"
              />
            </div>

            {/* Selected Dates Display */}
            {dateRange?.from && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-sm text-blue-900">
                  <span className="font-semibold">Selected: </span>
                  {formatDateDisplay()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
