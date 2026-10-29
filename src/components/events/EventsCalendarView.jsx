import React, { useState } from 'react'
import {
  Calendar,
  Clock,
  Building,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react'
import { formatDateDisplay } from '../../utils/venueHelpers'

export default function EventsCalendarView({ events = [], onExploreVenues }) {
// Academic session default date (October 2026)
  const [viewDate, setViewDate] = useState(new Date(2026, 9, 1))
  const [selectedDate, setSelectedDate] = useState('2026-10-25')

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const prevMonthDays = []
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i)
  }

  const totalSlots = Math.ceil((firstDayIndex + daysInCurrentMonth) / 7) * 7
  const nextMonthDaysCount = totalSlots - (firstDayIndex + daysInCurrentMonth)

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1))
  const handleToday = () => {
    setViewDate(new Date(2026, 9, 1))
    setSelectedDate('2026-10-25')
  }

  const getEventsForDate = (dateStr) => {
    return events.filter((e) => e.event_date === dateStr)
  }

  const selectedDayEvents = getEventsForDate(selectedDate)

  const getCategoryDotColor = (category) => {
    switch (category) {
      case 'Competition':
        return 'bg-purple-500'
      case 'Workshop':
        return 'bg-emerald-500'
      case 'Club Event':
        return 'bg-amber-500'
      case 'College Event':
        return 'bg-blue-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Competition':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
      case 'Workshop':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      case 'Club Event':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      case 'College Event':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Calendar Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {monthNames[month]} {year}
          </h2>
          <button
            type="button"
            onClick={handleToday}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* Category Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span className="font-medium">Competition</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-medium">Workshop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="font-medium">Club Event</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Selected Day Agenda on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Monthly Calendar View */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {daysOfWeek.map((day, idx) => (
              <div
                key={idx}
                className="py-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Previous Month Trailing Days */}
            {prevMonthDays.map((d, i) => (
              <div
                key={`prev-${i}`}
                className="min-h-[72px] sm:min-h-[88px] p-1.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-transparent text-slate-300 dark:text-slate-600 text-xs font-medium select-none"
              >
                {d}
              </div>
            ))}

            {/* Current Month Days */}
            {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
              const dayNum = i + 1
              const mm = String(month + 1).padStart(2, '0')
              const dd = String(dayNum).padStart(2, '0')
              const dateStr = `${year}-${mm}-${dd}`
              const dayEvents = getEventsForDate(dateStr)
              const isSelected = selectedDate === dateStr
              const hasEvents = dayEvents.length > 0

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[72px] sm:min-h-[88px] p-2 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between border ${isSelected
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs ring-2 ring-blue-500/20'
                    : hasEvents
                      ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xs'
                      : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold ${isSelected
                        ? 'text-blue-600 dark:text-blue-400'
                        : hasEvents
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-600 dark:text-slate-400'
                        }`}
                    >
                      {dayNum}
                    </span>
                    {hasEvents && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                    )}
                  </div>

                  {/* Compact Event Pills in Cell */}
                  <div className="space-y-1 w-full overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id || ev.title}
                        className="truncate text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-1"
                        title={`${ev.title} (${ev.venue_name})`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${getCategoryDotColor(
                            ev.category
                          )}`}
                        ></span>
                        <span className="truncate">{ev.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              )
            })}

            {/* Next Month Leading Days */}
            {Array.from({ length: nextMonthDaysCount }).map((_, i) => (
              <div
                key={`next-${i}`}
                className="min-h-[72px] sm:min-h-[88px] p-1.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-transparent text-slate-300 dark:text-slate-600 text-xs font-medium select-none"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Date Agenda Side Panel */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Selected Date
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {formatDateDisplay(selectedDate)}
              </h3>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg">
              {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'Event' : 'Events'}
            </span>
          </div>

          {/* List of events on this date */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {selectedDayEvents.map((ev) => (
              <div
                key={ev.id || ev.title}
                className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(
                      ev.category
                    )}`}
                  >
                    {ev.category}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Confirmed
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                  {ev.title}
                </h4>

                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {ev.club_name || ev.organizer}
                </p>

                <div className="space-y-1.5 pt-1.5 border-t border-slate-200/70 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>{ev.time_slot}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Venue: {ev.venue_name}
                    </span>
                  </div>
                  {ev.expected_attendees && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span>{ev.expected_attendees} Expected Attendees</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onExploreVenues}
                    className="w-full h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>Check Hall Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {selectedDayEvents.length === 0 && (
              <div className="text-center py-12 px-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  No events scheduled on this date
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-4">
                  All halls and auditoriums are open for reservation.
                </p>
                <button
                  type="button"
                  onClick={onExploreVenues}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Browse Venues</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Campus Events Page Component (Auto-populated from confirmed club & college bookings)