import React, { useState } from 'react'
import {
  Building,
  Search,
  Users,
  ArrowRight,
  X,
  RotateCcw,
  LayoutGrid,
  List
} from 'lucide-react'
import { getVenueImageUrl, formatDateDisplay } from '../utils/venueUtils'

export default function VenuesPage({ venues = [], isLoading = false, initialType, initialDate, onSelectVenue, onBackHome }) {
  const [filterDept, setFilterDept] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState(
    initialType && initialType !== 'All' ? initialType : 'All Spaces'
  )
  const [filterCapacity, setFilterCapacity] = useState('All')
  const [sortBy, setSortBy] = useState('default')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

  const departments = ['All', ...new Set(venues.map((v) => v.department).filter(Boolean))]

  const venueTypeOptions = [
    'All Spaces',
    'Classrooms',
    'Seminar Halls',
    'Auditoriums',
    'Meeting Rooms',
    'Labs'
  ]

  const matchesTypeFilter = (venueType, filter) => {
    if (filter === 'All Spaces') return true
    if (venueType === filter) return true
    if (filter === 'Labs' && (venueType === 'Lab' || venueType === 'Labs')) return true
    if (filter === 'Auditoriums' && (venueType === 'Auditorium' || venueType === 'Auditoriums')) return true
    if (filter === 'Classrooms' && (venueType === 'Classroom' || venueType === 'Classrooms')) return true
    if (filter === 'Seminar Halls' && (venueType === 'Seminar Hall' || venueType === 'Seminar Halls')) return true
    if (filter === 'Meeting Rooms' && (venueType === 'Meeting Room' || venueType === 'Meeting Rooms')) return true
    return false
  }

  const getTypeCount = (type) => {
    if (type === 'All Spaces') return venues.length
    return venues.filter((v) => matchesTypeFilter(v.type, type)).length
  }

  const isFiltered =
    filterDept !== 'All' ||
    searchQuery.trim() !== '' ||
    filterType !== 'All Spaces' ||
    filterCapacity !== 'All' ||
    sortBy !== 'default'

  const resetAllFilters = () => {
    setFilterDept('All')
    setSearchQuery('')
    setFilterType('All Spaces')
    setFilterCapacity('All')
    setSortBy('default')
  }

  const filteredVenues = venues.filter((venue) => {
    const matchesDept = filterDept === 'All' || venue.department === filterDept
    const matchesType = matchesTypeFilter(venue.type, filterType)
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      q === '' ||
      (venue.new_hall_name && venue.new_hall_name.toLowerCase().includes(q)) ||
      (venue.old_hall_name && venue.old_hall_name.toLowerCase().includes(q)) ||
      (venue.department && venue.department.toLowerCase().includes(q)) ||
      (venue.code && venue.code.toLowerCase().includes(q)) ||
      (venue.building && venue.building.toLowerCase().includes(q)) ||
      (venue.type && venue.type.toLowerCase().includes(q))

    const cap = venue.capacity || (venue.benches ? venue.benches * 2 : 0)
    let matchesCap = true
    if (filterCapacity === 'compact') matchesCap = cap < 50
    else if (filterCapacity === 'medium') matchesCap = cap >= 50 && cap <= 100
    else if (filterCapacity === 'large') matchesCap = cap > 100 && cap <= 200
    else if (filterCapacity === 'grand') matchesCap = cap > 200

    return matchesDept && matchesType && matchesSearch && matchesCap
  })

  const sortedVenues = [...filteredVenues].sort((a, b) => {
    const capA = a.capacity || (a.benches ? a.benches * 2 : 0)
    const capB = b.capacity || (b.benches ? b.benches * 2 : 0)
    if (sortBy === 'capacity-desc') return capB - capA
    if (sortBy === 'capacity-asc') return capA - capB
    if (sortBy === 'name-asc') {
      const nameA = a.old_hall_name || a.new_hall_name || ''
      const nameB = b.old_hall_name || b.new_hall_name || ''
      return nameA.localeCompare(nameB)
    }
    return 0
  })

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* 1. Header & Navigation Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
          <button
            type="button"
            onClick={onBackHome}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Home
          </button>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200">Campus Venues Catalog</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <span>COEP Campus Venues</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {venues.length} Spaces Registered
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Browse, filter, and reserve academic classrooms, drawing halls, seminar spaces, and auditoriums with live availability.
              {initialDate && (
                <span className="ml-2 font-bold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md inline-block mt-1 sm:mt-0">
                  Checking Date: {formatDateDisplay(initialDate)}
                </span>
              )}
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Showing</div>
              <div className="text-base font-black text-slate-900 dark:text-white">
                {sortedVenues.length}{' '}
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">/ {venues.length}</span>
              </div>
            </div>
            {isFiltered && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="h-11 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Controls & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-2xs mb-6 space-y-4">
        {/* Category Type Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {venueTypeOptions.map((type) => {
            const count = getTypeCount(type)
            const isActive = filterType === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${isActive
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <span>{type}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search & Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Live Search Input */}
          <div className="relative md:col-span-5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hall (e.g. SC10, ND01), dept, or keyword..."
              className="w-full h-10 pl-10 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department Dropdown */}
          <div className="md:col-span-3">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="All">All Departments ({venues.length})</option>
              {departments
                .filter((d) => d !== 'All')
                .map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
            </select>
          </div>

          {/* Capacity Dropdown */}
          <div className="md:col-span-2">
            <select
              value={filterCapacity}
              onChange={(e) => setFilterCapacity(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="All">Any Capacity</option>
              <option value="compact">Small (&lt; 50 Seats)</option>
              <option value="medium">Medium (50–100 Seats)</option>
              <option value="large">Large (100–200 Seats)</option>
              <option value="grand">Grand (200+ Seats)</option>
            </select>
          </div>

          {/* Sort & View Toggle */}
          <div className="md:col-span-2 flex items-center justify-between gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 h-10 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="default">Default</option>
              <option value="capacity-desc">Capacity &darr;</option>
              <option value="capacity-asc">Capacity &uarr;</option>
              <option value="name-asc">Name A-Z</option>
            </select>

            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 shadow-2xs text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                title="Grid Cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 shadow-2xs text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                title="Compact List"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Strip */}
        {isFiltered && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Active Filters:
            </span>
            {filterType !== 'All Spaces' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg">
                Type: {filterType}
                <button
                  type="button"
                  onClick={() => setFilterType('All Spaces')}
                  className="hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filterDept !== 'All' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-lg">
                Dept: {filterDept}
                <button
                  type="button"
                  onClick={() => setFilterDept('All')}
                  className="hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filterCapacity !== 'All' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg">
                Capacity: {filterCapacity}
                <button
                  type="button"
                  onClick={() => setFilterCapacity('All')}
                  className="hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg">
                Query: &quot;{searchQuery}&quot;
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline cursor-pointer ml-1"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* 3. Venues Content: Loading, Empty, Grid or List */}
      {isLoading ? (
        <div className="text-center py-24 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold">Loading campus venues...</p>
        </div>
      ) : sortedVenues.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200/90 dark:border-slate-700 shadow-2xs max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No campus venues match your search
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed max-w-xs mx-auto">
            Try adjusting your search query, selecting another department, or clearing the capacity filter.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedVenues.map((venue, idx) => {
            const venueImage = getVenueImageUrl(venue)
            const capacity = venue.capacity || (venue.benches ? venue.benches * 2 : 60)
            return (
              <div
                key={venue.id || idx}
                onClick={() => onSelectVenue(venue)}
                className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Image Banner */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={venueImage}
                    alt={venue.old_hall_name || venue.new_hall_name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = '/coep_building.png'
                    }}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/15 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-black tracking-wide text-white bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 shadow-xs">
                      {venue.new_hall_name || 'Passage Hall'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="text-[11px] font-bold text-slate-100 bg-slate-900/75 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/10">
                      {venue.type || 'Hall'}
                    </span>
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="font-bold text-slate-100 text-[11px] flex items-center gap-1.5 drop-shadow-sm">
                      <Users className="w-3.5 h-3.5 text-blue-300" />
                      {capacity} Seats
                    </span>
                    <span className="text-[11px] font-medium text-slate-300 drop-shadow-sm">
                      {venue.benches} Benches
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className="font-bold text-slate-900 dark:text-white text-base mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                      title={venue.old_hall_name || venue.new_hall_name}
                    >
                      {venue.old_hall_name || venue.new_hall_name}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-3">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{venue.department}</span>
                    </p>

                    {/* Features list */}
                    {venue.features && venue.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {venue.features.slice(0, 3).map((feat, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Available
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectVenue(venue)
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer"
                    >
                      <span>Book Slot</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* COMPACT LIST VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {sortedVenues.map((venue, idx) => {
            const venueImage = getVenueImageUrl(venue)
            const capacity = venue.capacity || (venue.benches ? venue.benches * 2 : 60)
            return (
              <div
                key={venue.id || idx}
                onClick={() => onSelectVenue(venue)}
                className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <div className="relative w-20 h-16 sm:w-24 sm:h-18 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                    <img
                      src={venueImage}
                      alt={venue.old_hall_name || venue.new_hall_name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = '/coep_building.png'
                      }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-1 left-1">
                      <span className="text-[10px] font-black text-white bg-slate-900/80 px-1.5 py-0.2 rounded">
                        {venue.new_hall_name}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {venue.old_hall_name || venue.new_hall_name}
                      </h3>
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                        {venue.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{venue.department}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        <strong>{capacity}</strong> Seats ({venue.benches} Benches)
                      </span>
                      {venue.features && venue.features.slice(0, 2).map((f, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectVenue(venue)
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer"
                  >
                    <span>Book Slot</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
