import React, { useState } from 'react'
import {
  Search,
  LayoutGrid,
  CalendarDays,
  Calendar,
  Clock,
  Building,
  Users,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { formatDateDisplay } from '../utils/venueUtils'
import EventsCalendarView from './EventsCalendarView'

export default function EventsPage({ events = [], isLoading = false, onExploreVenues, onBackHome }) {
  const [viewMode, setViewMode] = useState('grid')
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = ['All', 'Competition', 'Workshop', 'Club Event', 'College Event']

  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      activeCategory === 'All' || event.category === activeCategory
    const matchesSearch =
      (event.title && event.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.club_name && event.club_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.organizer && event.organizer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.venue_name && event.venue_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.department && event.department.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Competition':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
      case 'Workshop':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
      case 'Club Event':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
      case 'College Event':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    }
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            type="button"
            onClick={onBackHome}
            className="group text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-2 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Campus Events
            </h1>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 px-2.5 py-1 rounded-full border border-blue-150 dark:border-blue-800">
              Live Schedule
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse confirmed club fests, technical workshops, competitions, and college events scheduled across campus.
          </p>
        </div>

        {/* View Switcher & Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Grid vs Calendar Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'grid'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'calendar'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          {/* Search Input (visible in Grid View) */}
          {viewMode === 'grid' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event, club, or hall"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors shadow-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs (Grid Mode Only) */}
      {viewMode === 'grid' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${activeCategory === category
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Calendar or Cards View */}
      {viewMode === 'calendar' ? (
        <EventsCalendarView
          events={events}
          onExploreVenues={onExploreVenues}
        />
      ) : isLoading ? (
        <div className="text-center py-24 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold">Loading campus events from Supabase...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
            {events.length === 0
              ? 'No campus events currently scheduled in the database.'
              : 'No events match your selected filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id || event.booking_id}
              className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Category & Status Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${getCategoryBadgeClass(
                      event.category
                    )}`}
                  >
                    {event.category || 'Campus Event'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-150 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {event.status || 'Confirmed'}
                  </span>
                </div>

                {/* Event Title */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-1.5 line-clamp-2">
                  {event.title}
                </h3>

                {/* Organizer / Club */}
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                  <span className="truncate">
                    {event.club_name || event.organizer}
                  </span>
                </div>

                {/* Description */}
                {event.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed mb-4 line-clamp-3">
                    {event.description}
                  </p>
                )}

                {/* Event Metadata details */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium">{formatDateDisplay(event.event_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{event.time_slot}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-white">
                      Venue: {event.venue_name}
                    </span>
                  </div>
                  {event.expected_attendees && (
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{event.expected_attendees} Expected Attendees</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
                  {event.department}
                </span>
                <button
                  type="button"
                  onClick={onExploreVenues}
                  className="group text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>Explore Venues</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
