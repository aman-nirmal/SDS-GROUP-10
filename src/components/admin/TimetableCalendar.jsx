import React, { useState, useMemo } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Building,
  Trash2,
  Plus,
  X
} from 'lucide-react'
import { BLOCK_TYPE_COLORS, BLOCK_TYPES } from './mockAdminData'

export default function TimetableCalendar({
  timetable = [],
  bookings = [],
  venues = [],
  onDeleteEntry,
  onOpenBlockModal
}) {
  // Calendar navigation state
  // Default to October 2026 where sample data lives
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 9, 26)) // 2026-10-26
  const [viewMode, setViewMode] = useState('week') // 'day' | 'week' | 'month'

  // Filters
  const [venueFilter, setVenueFilter] = useState('All')
  const [deptFilter, setDeptFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [facultyFilter, setFacultyFilter] = useState('All')

  // Selected entry for inspection modal
  const [selectedEntry, setSelectedEntry] = useState(null)

  // Combined calendar items: Timetable blocks + Bookings
  const allActivities = useMemo(() => {
    const list = []

    // 1. Add timetable entries
    timetable.forEach((item) => {
      list.push({
        id: item.id,
        source: 'timetable',
        title: item.title,
        venueName: item.venueName,
        venueId: item.venueId,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
        blockType: item.blockType || 'Academic Schedule',
        faculty: item.faculty || '',
        department: item.department || '',
        reason: item.reason || '',
        recurrence: item.recurrence || 'none'
      })
    })

    // 2. Add confirmed/pending bookings as Event Reservations
    bookings.forEach((b) => {
      if (b.status === 'Cancelled' || b.status === 'Rejected') return
      const [start, end] = (b.timeSlot || '').split('-').map((s) => s.trim())
      list.push({
        id: b.id,
        source: 'booking',
        title: b.purpose || 'Event Reservation',
        venueName: b.venueName,
        venueId: b.venueId,
        date: b.bookingDate,
        startTime: start || '09:00 AM',
        endTime: end || '12:00 PM',
        blockType: 'Event Reservation',
        faculty: b.applicantName || '',
        department: b.department || '',
        reason: `Campus booking by ${b.applicantName} (${b.applicantRole})`,
        attendees: b.attendees,
        status: b.status
      })
    })

    return list
  }, [timetable, bookings])

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return allActivities.filter((act) => {
      const matchesVenue = venueFilter === 'All' || act.venueName === venueFilter || act.venueId === venueFilter
      const matchesDept = deptFilter === 'All' || act.department === deptFilter
      const matchesType = typeFilter === 'All' || act.blockType === typeFilter
      const matchesFaculty =
        facultyFilter === 'All' || (act.faculty && act.faculty.toLowerCase().includes(facultyFilter.toLowerCase()))

      return matchesVenue && matchesDept && matchesType && matchesFaculty
    })
  }, [allActivities, venueFilter, deptFilter, typeFilter, facultyFilter])

  // Unique faculty list for filter dropdown
  const facultyList = useMemo(() => {
    const set = new Set()
    allActivities.forEach((a) => {
      if (a.faculty) set.add(a.faculty)
    })
    return Array.from(set).sort()
  }, [allActivities])

  // Navigation handlers
  const handlePrev = () => {
    const next = new Date(currentDate)
    if (viewMode === 'day') next.setDate(next.getDate() - 1)
    else if (viewMode === 'week') next.setDate(next.getDate() - 7)
    else next.setMonth(next.getMonth() - 1)
    setCurrentDate(next)
  }

  const handleNext = () => {
    const next = new Date(currentDate)
    if (viewMode === 'day') next.setDate(next.getDate() + 1)
    else if (viewMode === 'week') next.setDate(next.getDate() + 7)
    else next.setMonth(next.getMonth() + 1)
    setCurrentDate(next)
  }

  const handleToday = () => {
    setCurrentDate(new Date(2026, 9, 26)) // Set to October 26, 2026 anchor
  }

  // Format date helper (YYYY-MM-DD)
  const formatDateKey = (d) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  // Generate Week Days (Monday to Sunday)
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate)
    const day = curr.getDay()
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    const monday = new Date(curr.setDate(diff))

    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      days.push(d)
    }
    return days
  }, [currentDate])

  // Month Matrix
  const monthMatrix = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const matrix = []
    let currentWeek = []

    // Padding before first day (Monday start)
    let startDayIndex = firstDay.getDay()
    if (startDayIndex === 0) startDayIndex = 7
    for (let i = 1; i < startDayIndex; i++) {
      const prevDate = new Date(year, month, 1 - (startDayIndex - i))
      currentWeek.push({ date: prevDate, isCurrentMonth: false })
    }

    // Days of current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateObj = new Date(year, month, d)
      currentWeek.push({ date: dateObj, isCurrentMonth: true })
      if (currentWeek.length === 7) {
        matrix.push(currentWeek)
        currentWeek = []
      }
    }

    // Padding after last day
    if (currentWeek.length > 0) {
      let nextMonthDay = 1
      while (currentWeek.length < 7) {
        const nextDate = new Date(year, month + 1, nextMonthDay)
        currentWeek.push({ date: nextDate, isCurrentMonth: false })
        nextMonthDay++
      }
      matrix.push(currentWeek)
    }

    return matrix
  }, [currentDate])

  // Get color styles for a block type
  const getTypeStyle = (type) => {
    return (
      BLOCK_TYPE_COLORS[type] || {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-800 dark:text-slate-200',
        border: 'border-slate-300 dark:border-slate-700',
        dot: 'bg-slate-500'
      }
    )
  }

  return (
    <div className="space-y-4">
      {/* Top Filter and Navigation Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-4 sm:p-5 space-y-4">
        {/* Navigation & View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Today
            </button>
            <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 p-0.5">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white ml-2">
              {currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
                ...(viewMode === 'day' ? { day: 'numeric', weekday: 'short' } : {})
              })}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {onOpenBlockModal && (
              <button
                type="button"
                onClick={() => onOpenBlockModal(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Block</span>
              </button>
            )}

            {/* View Mode Segmented Pill */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'day'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Day
              </button>
              <button
                type="button"
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <select
              value={venueFilter}
              onChange={(e) => setVenueFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="All">All Venues</option>
              {venues.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="All">All Activity Types</option>
              {BLOCK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
              <option value="Event Reservation">Event Reservation</option>
            </select>
          </div>

          <div>
            <select
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="All">All Faculty / Organizers</option>
              {facultyList.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="General Engineering">General Engineering</option>
              <option value="Central Estate & Infrastructure">Central Estate</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-600 dark:text-slate-300">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
            Activity Legend:
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Academic Schedule</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Maintenance Block</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Examination</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Event Reservation</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Administrative Hold</span>
          </span>
        </div>
      </div>

      {/* Calendar Views */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        {/* ================= WEEK VIEW ================= */}
        {viewMode === 'week' && (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 min-w-[750px] border-b border-slate-200 dark:border-slate-800 bg-slate-100/75 dark:bg-slate-800/70">
              {weekDays.map((d, idx) => {
                const dateKey = formatDateKey(d)
                const isSelectedDay = dateKey === formatDateKey(currentDate)
                return (
                  <div
                    key={idx}
                    className={`py-3 px-2 text-center border-r last:border-r-0 border-slate-200 dark:border-slate-800 ${
                      isSelectedDay ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div
                      className={`text-sm font-black mt-0.5 inline-block w-7 h-7 rounded-full leading-7 ${
                        isSelectedDay
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {d.getDate()}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-7 min-w-[750px] divide-x divide-slate-100 dark:divide-slate-800 min-h-[480px]">
              {weekDays.map((d, idx) => {
                const dateKey = formatDateKey(d)
                const dayActivities = filteredActivities.filter((a) => a.date === dateKey)

                return (
                  <div key={idx} className="p-2 space-y-2 bg-slate-50/20 dark:bg-transparent">
                    {dayActivities.length === 0 ? (
                      <div className="h-full flex items-center justify-center py-10">
                        <span className="text-[10px] text-slate-300 dark:text-slate-700 italic">
                          No blocks
                        </span>
                      </div>
                    ) : (
                      dayActivities.map((act) => {
                        const style = getTypeStyle(act.blockType)
                        return (
                          <div
                            key={act.id}
                            onClick={() => setSelectedEntry(act)}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02] shadow-2xs space-y-1 ${style.bg} ${style.border}`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`text-[10px] font-extrabold uppercase tracking-wide truncate ${style.text}`}
                              >
                                {act.blockType}
                              </span>
                              <span className="text-[9px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                                {act.startTime}
                              </span>
                            </div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                              {act.title}
                            </div>
                            <div className="text-[10px] text-slate-600 dark:text-slate-300 flex items-center gap-1 truncate">
                              <Building className="w-3 h-3 shrink-0" />
                              <span>{act.venueName}</span>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ================= MONTH VIEW ================= */}
        {viewMode === 'month' && (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 min-w-[700px] border-b border-slate-200 dark:border-slate-800 bg-slate-100/75 dark:bg-slate-800/70 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 py-2.5">
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
              <div>Sun</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 min-w-[700px]">
              {monthMatrix.map((week, wIdx) => (
                <div key={wIdx} className="grid grid-cols-7 divide-x divide-slate-100 dark:divide-slate-800 min-h-[105px]">
                  {week.map((item, dIdx) => {
                    const dateKey = formatDateKey(item.date)
                    const dayActivities = filteredActivities.filter((a) => a.date === dateKey)

                    return (
                      <div
                        key={dIdx}
                        className={`p-2 space-y-1 ${
                          item.isCurrentMonth
                            ? 'bg-white dark:bg-slate-900'
                            : 'bg-slate-50/50 dark:bg-slate-950/40 text-slate-400'
                        }`}
                      >
                        <div className="text-right">
                          <span
                            className={`text-xs font-bold inline-block w-5 h-5 rounded-full text-center leading-5 ${
                              item.isCurrentMonth
                                ? 'text-slate-800 dark:text-slate-200'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          >
                            {item.date.getDate()}
                          </span>
                        </div>

                        <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-none">
                          {dayActivities.slice(0, 3).map((act) => {
                            const style = getTypeStyle(act.blockType)
                            return (
                              <div
                                key={act.id}
                                onClick={() => setSelectedEntry(act)}
                                className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate cursor-pointer ${style.bg} ${style.text} border ${style.border}`}
                                title={`${act.title} (${act.venueName})`}
                              >
                                {act.title}
                              </div>
                            )
                          })}
                          {dayActivities.length > 3 && (
                            <div className="text-[9px] font-bold text-slate-400 px-1">
                              +{dayActivities.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= DAY VIEW ================= */}
        {viewMode === 'day' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Schedule for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chronological schedule and physical space occupation.
                </p>
              </div>
            </div>

            {(() => {
              const dateKey = formatDateKey(currentDate)
              const dayActivities = filteredActivities.filter((a) => a.date === dateKey)

              if (dayActivities.length === 0) {
                return (
                  <div className="py-16 text-center">
                    <CalendarIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      No events or blocks scheduled for this date.
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Campus spaces are open for reservations or departmental allocations.
                    </p>
                  </div>
                )
              }

              return (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {dayActivities.map((act) => {
                    const style = getTypeStyle(act.blockType)
                    return (
                      <div
                        key={act.id}
                        className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                        onClick={() => setSelectedEntry(act)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${style.bg} ${style.border} ${style.text}`}
                          >
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                                {act.title}
                              </h5>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                              >
                                {act.blockType}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {act.venueName}
                              </span>
                              <span>•</span>
                              <span>{act.faculty || act.department}</span>
                              {act.reason && (
                                <>
                                  <span>•</span>
                                  <span className="italic">{act.reason}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                            {act.startTime} - {act.endTime}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {act.recurrence === 'weekly' ? 'Weekly recurring' : 'Single block'}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Selected Time Slot Inspection Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Scheduled Activity Inspection
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedEntry.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">Venue:</span>
                  <strong className="text-slate-900 dark:text-white">{selectedEntry.venueName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Activity Type:</span>
                  <strong className="text-blue-600 dark:text-blue-400">{selectedEntry.blockType}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Date:</span>
                  <strong className="text-slate-900 dark:text-white">{selectedEntry.date}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Timing:</span>
                  <strong className="text-slate-900 dark:text-white">
                    {selectedEntry.startTime} - {selectedEntry.endTime}
                  </strong>
                </div>
                {selectedEntry.faculty && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Faculty / Organizer:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {selectedEntry.faculty}
                    </span>
                  </div>
                )}
                {selectedEntry.department && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Department:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {selectedEntry.department}
                    </span>
                  </div>
                )}
              </div>

              {selectedEntry.reason && (
                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] font-bold uppercase">
                    Description & Allocation Notes
                  </span>
                  <p className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    {selectedEntry.reason}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Record Ref: <strong className="font-mono text-slate-600 dark:text-slate-300">{selectedEntry.id}</strong></span>
                <span>Source: {selectedEntry.source === 'booking' ? 'Venue Reservation' : 'Admin Timetable Entry'}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-100/60 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              {selectedEntry.source === 'timetable' && onDeleteEntry ? (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteEntry(selectedEntry.id)
                    setSelectedEntry(null)
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Unblock / Remove</span>
                </button>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

