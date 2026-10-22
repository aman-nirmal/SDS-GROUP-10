import React, { useState, useEffect } from 'react'
import {
  MapPin,
  Calendar,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Monitor,
  Users,
  Presentation,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Menu,
  X,
  FileText,
  AlertCircle,
  ShieldCheck,
  LayoutGrid,
  CalendarDays
} from 'lucide-react'

// 2-Frame Animated Flying Birds Component (Swaps bird1.png and bird2.png)
function FlyingBirds() {
  const [frame, setFrame] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev === 1 ? 2 : 1))
    }, 340) // natural wing-beat tempo
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="animate-birds-flight w-14 sm:w-16 lg:w-18 pointer-events-none select-none z-10">
      <img
        src={frame === 1 ? '/bird1.png' : '/bird2.png'}
        alt="Flying Birds"
        className="w-full h-auto object-contain"
      />
    </div>
  )
}

// Official LOCUS Logo Component
function LocusLogo({ size = 'default' }) {
  const isSmall = size === 'small'
  return (
    <div className="flex items-center cursor-pointer select-none">
      <img
        src="/logo.png"
        alt="LOCUS - COEP Venue Booking System"
        className={`${isSmall ? 'h-10' : 'h-12 sm:h-14'} w-auto object-contain`}
      />
    </div>
  )
}

// Popular Venue Type Card - Equal dimensions
function VenueTypeCard({ icon: Icon, title, description, count }) {
  return (
    <div className="group h-full bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between">
      <div className="flex-1 flex flex-col">
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors mb-5 shrink-0">
          <Icon className="w-6 h-6 stroke-[1.6]" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
          {title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed min-h-[40px]">
          {description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold text-slate-500">
          {count} Available
        </span>
        <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-600 transition-colors">
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  )
}

import { supabase } from './lib/supabase'

// Custom Calendar Picker matching Website Design System
function CustomCalendarPicker({ selectedDate, onSelectDate, onClose }) {
  const initialDate = selectedDate ? new Date(selectedDate) : new Date(2026, 9, 16)
  const [viewDate, setViewDate] = useState(initialDate)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  // Days in current month
  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()

  // Previous month trailing days
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const prevMonthDays = []
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i)
  }

  // Next month leading days
  const totalSlots = Math.ceil((firstDayIndex + daysInCurrentMonth) / 7) * 7
  const nextMonthDaysCount = totalSlots - (firstDayIndex + daysInCurrentMonth)

  const handlePrevMonth = (e) => {
    e.stopPropagation()
    setViewDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = (e) => {
    e.stopPropagation()
    setViewDate(new Date(year, month + 1, 1))
  }

  const handlePickDate = (d) => {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    onSelectDate(`${year}-${mm}-${dd}`)
    onClose()
  }

  const handlePickToday = (e) => {
    e.stopPropagation()
    const now = new Date(2026, 9, 16) // academic session date
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    onSelectDate(`${now.getFullYear()}-${mm}-${dd}`)
    onClose()
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onSelectDate('')
    onClose()
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute top-15 left-0 sm:left-auto sm:right-0 w-[290px] bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/90 p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Month & Year Navigation Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-900 tracking-tight">
          {monthNames[month]} {year}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 text-center mb-1">
        {daysOfWeek.map((day, idx) => (
          <span key={idx} className="text-[11px] font-bold text-slate-400 py-1">
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {/* Prev month days */}
        {prevMonthDays.map((d, i) => (
          <span key={`prev-${i}`} className="text-slate-300 py-1.5 text-[11px]">
            {d}
          </span>
        ))}

        {/* Current month days */}
        {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
          const dayNum = i + 1
          const mm = String(month + 1).padStart(2, '0')
          const dd = String(dayNum).padStart(2, '0')
          const dateString = `${year}-${mm}-${dd}`
          const isSelected = selectedDate === dateString

          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => handlePickDate(dayNum)}
              className={`w-8 h-8 mx-auto flex items-center justify-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${isSelected
                ? 'bg-blue-600 text-white font-bold shadow-xs scale-105'
                : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
            >
              {dayNum}
            </button>
          )
        })}

        {/* Next month days */}
        {Array.from({ length: nextMonthDaysCount }).map((_, i) => (
          <span key={`next-${i}`} className="text-slate-300 py-1.5 text-[11px]">
            {i + 1}
          </span>
        ))}
      </div>

      {/* Footer Actions: Clear & Today */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
        <button
          type="button"
          onClick={handleClear}
          className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handlePickToday}
          className="text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          Today
        </button>
      </div>
    </div>
  )
}

// Format date helper (e.g., '16 Oct 2026')
function formatDateDisplay(dateStr) {
  if (!dateStr) return 'Select Date'
  try {
    const [year, month, day] = dateStr.split('-')
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

// Complete Interactive Venue Booking Modal Component
function VenueBookingModal({ venue, defaultDate, onClose, onSubmitBooking }) {
  const [date, setDate] = useState(defaultDate || '2026-10-16')
  const [selectedSlot, setSelectedSlot] = useState('09:00 AM - 11:00 AM')
  const [applicantName, setApplicantName] = useState('')
  const [department, setDepartment] = useState(venue?.department || 'Computer Engineering')
  const [eventPurpose, setEventPurpose] = useState('')
  const [attendees, setAttendees] = useState(venue?.benches ? venue.benches * 2 : 50)
  const [submitted, setSubmitted] = useState(false)
  const [bookingRef, setBookingRef] = useState('')

  const availableSlots = [
    { id: 'slot-1', label: '09:00 AM - 11:00 AM', status: 'available' },
    { id: 'slot-2', label: '11:15 AM - 01:15 PM', status: 'available' },
    { id: 'slot-3', label: '02:00 PM - 04:00 PM', status: 'available' },
    { id: 'slot-4', label: '04:15 PM - 06:15 PM', status: 'available' },
    { id: 'slot-5', label: '06:30 PM - 08:30 PM', status: 'available' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!applicantName || !eventPurpose) return

    const refNumber = 'LOCUS-' + Math.floor(100000 + Math.random() * 900000)
    setBookingRef(refNumber)
    setSubmitted(true)

    if (onSubmitBooking) {
      onSubmitBooking({
        ref: refNumber,
        venueName: venue?.new_hall_name || venue?.old_hall_name || 'COEP Venue',
        oldName: venue?.old_hall_name,
        department,
        applicantName,
        date,
        slot: selectedSlot,
        purpose: eventPurpose,
        capacity: attendees,
        status: 'Confirmed'
      })
    }
  }

  const venueTitle = venue?.new_hall_name || venue?.old_hall_name || 'Selected Venue'

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8"
      >
        {submitted ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <CheckCircle2 className="w-9 h-9 stroke-[2]" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">
              Reservation Confirmed
            </span>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              Slot Reserved Successfully!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              Your venue reservation for <strong className="text-slate-900">{venueTitle}</strong> on{' '}
              <strong className="text-slate-900">{formatDateDisplay(date)}</strong> ({selectedSlot}) has been registered.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left mb-6 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Reference Code:</span>
                <span className="font-mono font-bold text-blue-600">{bookingRef}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Applicant:</span>
                <span className="font-semibold text-slate-800">{applicantName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Department:</span>
                <span className="font-semibold text-slate-800">{department}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Official Request Logged
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all duration-200 cursor-pointer shadow-xs"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg mb-2">
                  <Building className="w-3.5 h-3.5" />
                  <span>{venue?.department || 'COEP Campus'}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {venueTitle}
                </h3>
                {venue?.old_hall_name && venue.new_hall_name && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Formerly: {venue.old_hall_name} &bull; Capacity: {venue.benches * 2} Students ({venue.benches} Benches)
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4.5">
              {/* Date & Slot selection */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Select Booking Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Available Time Slots
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot === slot.label
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot.label)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer flex items-center justify-between ${isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        <span>{slot.label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Applicant Name & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Faculty / Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Prof. R. Sharma / Student"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Organizing Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Purpose & Attendees */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Event Purpose / Session Topic *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventPurpose}
                    onChange={(e) => setEventPurpose(e.target.value)}
                    placeholder="e.g. Guest Lecture, Lab Tutorial, Club Meeting"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Expected Attendees: <strong>{attendees}</strong></span>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Instant Campus Approval
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                >
                  Submit Reservation
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

// Interactive My Bookings Page Component
function MyBookingsPage({ bookings = [], onBackHome, onExploreVenues }) {
  const [activeFilter, setActiveFilter] = useState('All')

  const sampleDefaultBookings = [
    {
      ref: 'LOCUS-482910',
      venueName: 'NC01',
      oldName: 'AC 101',
      department: 'Academics Complex',
      applicantName: 'Prof. Aniket Joshi',
      date: '2026-10-18',
      slot: '09:00 AM - 11:00 AM',
      purpose: 'End-Sem Project Viva & Evaluation',
      capacity: 72,
      status: 'Confirmed'
    },
    {
      ref: 'LOCUS-319502',
      venueName: 'NC-27',
      oldName: 'Computer Dept Hall A',
      department: 'Computer New Building',
      applicantName: 'CS Student Chapter',
      date: '2026-10-21',
      slot: '02:00 PM - 04:00 PM',
      purpose: 'Technical Seminar on Distributed Systems',
      capacity: 80,
      status: 'Confirmed'
    }
  ]

  const allBookings = bookings.length > 0 ? bookings : sampleDefaultBookings

  const filteredBookings = allBookings.filter((b) => {
    if (activeFilter === 'All') return true
    return b.status === activeFilter
  })

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            type="button"
            onClick={onBackHome}
            className="group text-xs font-bold text-blue-600 hover:text-blue-700 mb-2 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Venue Bookings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your slot confirmations, approved timings, and reservation slips across campus.
          </p>
        </div>

        <button
          type="button"
          onClick={onExploreVenues}
          className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200/80 pb-3">
        {['All', 'Confirmed', 'Pending'].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setActiveFilter(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${activeFilter === status
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((b) => (
          <div
            key={b.ref}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {b.ref}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {b.venueName}
                </span>
                {b.oldName && (
                  <span className="text-xs text-slate-400">
                    ({b.oldName})
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {b.status}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">
                {b.purpose}
              </h3>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDateDisplay(b.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {b.slot}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {b.department}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {b.applicantName} ({b.capacity} cap)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-0 border-slate-100">
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                COEP Admin Verified
              </span>
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm font-semibold">No bookings found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}



// Interactive Events Calendar View Component
function EventsCalendarView({ events = [], onExploreVenues }) {
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
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'Workshop':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Club Event':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'College Event':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Calendar Navigation Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {monthNames[month]} {year}
          </h2>
          <button
            type="button"
            onClick={handleToday}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* Category Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
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
        <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {daysOfWeek.map((day, idx) => (
              <div
                key={idx}
                className="py-2 text-xs font-bold text-slate-400 uppercase tracking-wider"
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
                className="min-h-[72px] sm:min-h-[88px] p-1.5 rounded-xl bg-slate-50/50 border border-transparent text-slate-300 text-xs font-medium select-none"
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
                  className={`min-h-[72px] sm:min-h-[88px] p-2 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between border ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500/20'
                      : hasEvents
                      ? 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs'
                      : 'border-slate-100 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold ${
                        isSelected
                          ? 'text-blue-600'
                          : hasEvents
                          ? 'text-slate-900'
                          : 'text-slate-600'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {hasEvents && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>

                  {/* Compact Event Pills in Cell */}
                  <div className="space-y-1 w-full overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id || ev.title}
                        className="truncate text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 flex items-center gap-1"
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
                      <span className="text-[9px] font-bold text-slate-400 block">
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
                className="min-h-[72px] sm:min-h-[88px] p-1.5 rounded-xl bg-slate-50/50 border border-transparent text-slate-300 text-xs font-medium select-none"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Date Agenda Side Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Selected Date
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                {formatDateDisplay(selectedDate)}
              </h3>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'Event' : 'Events'}
            </span>
          </div>

          {/* List of events on this date */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {selectedDayEvents.map((ev) => (
              <div
                key={ev.id || ev.title}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2.5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(
                      ev.category
                    )}`}
                  >
                    {ev.category}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Confirmed
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm leading-snug">
                  {ev.title}
                </h4>

                <p className="text-xs font-semibold text-blue-600">
                  {ev.club_name || ev.organizer}
                </p>

                <div className="space-y-1.5 pt-1.5 border-t border-slate-200/70 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{ev.time_slot}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">
                      Venue: {ev.venue_name}
                    </span>
                  </div>
                  {ev.expected_attendees && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{ev.expected_attendees} Expected Attendees</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onExploreVenues}
                    className="w-full h-8 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>Check Hall Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {selectedDayEvents.length === 0 && (
              <div className="text-center py-12 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600 mb-1">
                  No events scheduled on this date
                </p>
                <p className="text-[11px] text-slate-400 mb-4">
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
function EventsPage({ events = [], isLoading = false, onExploreVenues, onBackHome }) {
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
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'Workshop':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Club Event':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'College Event':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
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
            className="group text-xs font-bold text-blue-600 hover:text-blue-700 mb-2 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Campus Events
            </h1>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-150">
              Live Schedule
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Browse confirmed club fests, technical workshops, competitions, and college events scheduled across campus.
          </p>
        </div>

        {/* View Switcher & Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Grid vs Calendar Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
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
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 transition-colors shadow-xs"
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
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === category
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
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
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 text-sm font-semibold">Loading campus events from Supabase...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-sm font-semibold">
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
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
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
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-150">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {event.status || 'Confirmed'}
                  </span>
                </div>

                {/* Event Title */}
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-1.5 line-clamp-2">
                  {event.title}
                </h3>

                {/* Organizer / Club */}
                <div className="text-xs font-semibold text-blue-600 mb-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                  <span className="truncate">
                    {event.club_name || event.organizer}
                  </span>
                </div>

                {/* Description */}
                {event.description && (
                  <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">
                    {event.description}
                  </p>
                )}

                {/* Event Metadata details */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
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
                    <span className="font-semibold text-slate-800">
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
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
                  {event.department}
                </span>
                <button
                  type="button"
                  onClick={onExploreVenues}
                  className="group text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
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

// Coming Soon Placeholder Component
function ComingSoonPage({ title, description, onBackHome }) {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-6 py-24 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 mb-6 shadow-xs">
        <Clock className="w-8 h-8 stroke-[1.75]" />
      </div>
      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
        Under Development
      </span>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
        {title}
      </h2>
      <p className="text-base text-slate-600 max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBackHome}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all duration-200 cursor-pointer shadow-xs"
        >
          Return to Home
        </button>
      </div>
    </div>
  )
}

// Full Interactive Venue Catalog Page
function VenuesPage({ venues = [], isLoading = false, initialType, initialDate, onSelectVenue, onBackHome }) {
  const [filterDept, setFilterDept] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState(initialType || 'All Venues')

  const departments = ['All', ...new Set(venues.map((v) => v.department).filter(Boolean))]

  const filteredVenues = venues.filter((venue) => {
    const matchesDept = filterDept === 'All' || venue.department === filterDept
    const matchesType =
      filterType === 'All Venues' || venue.type === filterType
    const matchesSearch =
      (venue.new_hall_name && venue.new_hall_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (venue.old_hall_name && venue.old_hall_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (venue.department && venue.department.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesDept && matchesType && matchesSearch
  })

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            type="button"
            onClick={onBackHome}
            className="group text-xs font-bold text-blue-600 hover:text-blue-700 mb-2 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            COEP Campus Venues
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse all classrooms, seminar halls, and drawing halls across departments.
            {initialDate && (
              <span className="ml-2 font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                Checking: {formatDateDisplay(initialDate)}
              </span>
            )}
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hall (e.g. SC06, AC 101)"
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* Filter Controls: Venue Type & Department Tabs */}
      <div className="space-y-3 mb-8">
        {/* Venue Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Type:
          </span>
          {['All Venues', 'Classrooms', 'Seminar Halls', 'Auditoriums', 'Meeting Rooms'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${filterType === type
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Department Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Dept:
          </span>
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setFilterDept(dept)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${filterDept === dept
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Venues Grid / States */}
      {isLoading ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 text-sm font-semibold">Loading campus venues...</p>
        </div>
      ) : filteredVenues.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-sm font-semibold">
            {venues.length === 0
              ? 'No venues found. Please make sure your Supabase project is active and seeded.'
              : 'No halls found matching your filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredVenues.map((venue, idx) => (
            <div
              key={venue.id || idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {venue.new_hall_name || 'Passage Hall'}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {venue.benches} Benches ({venue.capacity || venue.benches * 2} Capacity)
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1">
                  {venue.old_hall_name || venue.new_hall_name}
                </h3>
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-2">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{venue.department}</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Available
                </span>
                <button
                  type="button"
                  onClick={() => onSelectVenue(venue)}
                  className="group text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>Book Slot</span>
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

export default function App() {
  const [venues, setVenues] = useState([])
  const [isLoadingVenues, setIsLoadingVenues] = useState(true)
  const [activeTab, setActiveTab] = useState('home')
  useEffect(() => {
  const handlePopState = (event) => {
    const tab = event.state?.activeTab

    const validTabs = [
      'home',
      'venues',
      'events',
      'my-bookings',
      'about',
      'login'
    ]

    if (validTabs.includes(tab)) {
      setActiveTab(tab)
    } else {
      setActiveTab('home')
    }

    setIsMobileMenuOpen(false)
  }

  window.addEventListener('popstate', handlePopState)

  return () => {
    window.removeEventListener('popstate', handlePopState)
  }
}, [])
  const [selectedType, setSelectedType] = useState('All Venues')
  const [selectedDate, setSelectedDate] = useState('')
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [selectedVenueForBooking, setSelectedVenueForBooking] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [userBookings, setUserBookings] = useState([])

  const sampleEventsFallback = [
    {
      id: 'evt-1',
      title: "MindSpark '26: 24-Hour Campus Hackathon",
      organizer: 'MindSpark Secretary',
      club_name: 'MindSpark',
      department: 'Student Gymkhana',
      category: 'Competition',
      venue_name: 'ND01',
      event_date: '2026-10-25',
      time_slot: '09:00 AM - 09:00 PM',
      expected_attendees: 180,
      description: 'Flagship hackathon with students building real-world software and hardware prototypes.',
      status: 'Confirmed'
    },
    {
      id: 'evt-2',
      title: 'Autonomous Drone Navigation & ROS Workshop',
      organizer: 'RSC Coordinator',
      club_name: 'Robot Study Circle (RSC)',
      department: 'Electronics and Telecommunication Engineering',
      category: 'Workshop',
      venue_name: 'NC24',
      event_date: '2026-10-24',
      time_slot: '02:00 PM - 05:00 PM',
      expected_attendees: 70,
      description: 'Practical workshop on Robot Operating System, LIDAR mapping, and flight controllers.',
      status: 'Confirmed'
    },
    {
      id: 'evt-3',
      title: 'E-Cell Pune Startup Pitch Fest 2026',
      organizer: 'Incubation Officer',
      club_name: 'BHAU Institute',
      department: 'Manufacturing Engineering and Industrial Management',
      category: 'Club Event',
      venue_name: 'SC10',
      event_date: '2026-10-26',
      time_slot: '10:00 AM - 01:00 PM',
      expected_attendees: 90,
      description: 'Selected student and faculty startups pitch to angel investors and industry mentors.',
      status: 'Confirmed'
    }
  ]

  const [events, setEvents] = useState(sampleEventsFallback)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)


  useEffect(() => {
    async function loadVenues() {
      if (!supabase) {
        setIsLoadingVenues(false)
        return
      }

      try {
        setIsLoadingVenues(true)
        const { data, error } = await supabase
          .from('venues')
          .select('*')
          .eq('is_active', true)
          .order('new_hall_name', { ascending: true })

        if (error) {
          console.error('Could not fetch venues from Supabase:', error.message)
          return
        }

        if (data) {
          setVenues(data)
        }
      } catch (err) {
        console.error('Supabase fetch failed:', err)
      } finally {
        setIsLoadingVenues(false)
      }
    }

    loadVenues()
  }, [])

  useEffect(() => {
    async function loadEvents() {
      if (!supabase) return

      try {
        setIsLoadingEvents(true)
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true })

        if (error) {
          console.warn('Could not fetch events from Supabase, using fallback:', error.message)
          return
        }

        if (data && data.length > 0) {
          setEvents(data)
        }
      } catch (err) {
        console.warn('Supabase events fetch failed:', err)
      } finally {
        setIsLoadingEvents(false)
      }
    }

    loadEvents()
  }, [])

const handleNavClick = (tab) => {
  if (tab === activeTab) {
    setIsMobileMenuOpen(false)
    return
  }

  window.history.pushState(
    { activeTab: tab },
    '',
    window.location.pathname
  )

  setActiveTab(tab)
  setIsMobileMenuOpen(false)
}

  const handleAddBooking = (newBooking) => {
    setUserBookings((prev) => [newBooking, ...prev])
  }

  const venueTypes = [
    'All Venues',
    'Classrooms',
    'Seminar Halls',
    'Auditoriums',
    'Meeting Rooms'
  ]

  const popularTypes = [
    {
      icon: Monitor,
      title: 'Classrooms',
      description: 'Regular lecture halls, tutorial rooms, and smart classrooms.',
      count: '42 Venues'
    },
    {
      icon: Users,
      title: 'Seminar Halls',
      description: 'Equipped for guest lectures, symposiums, and departmental workshops.',
      count: '12 Venues'
    },
    {
      icon: Presentation,
      title: 'Auditoriums',
      description: 'Large venues for campus events, cultural festivals, and annual conferences.',
      count: '4 Venues'
    },
    {
      icon: Building,
      title: 'Meeting Rooms',
      description: 'Focused spaces for club meetings, faculty discussions, and interviews.',
      count: '8 Venues'
    }
  ]

  // Content router for Coming Soon tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'venues':
        return (
          <VenuesPage
            venues={venues}
            isLoading={isLoadingVenues}
            initialType={selectedType}
            initialDate={selectedDate}
            onSelectVenue={(hall) => setSelectedVenueForBooking(hall)}
            onBackHome={() => setActiveTab('home')}
          />
        )
      case 'events':
        return (
          <EventsPage
            events={events}
            isLoading={isLoadingEvents}
            onExploreVenues={() => setActiveTab('venues')}
            onBackHome={() => setActiveTab('home')}
          />
        )
      case 'my-bookings':
        return (
          <MyBookingsPage
            bookings={userBookings}
            onBackHome={() => setActiveTab('home')}
            onExploreVenues={() => setActiveTab('venues')}
          />
        )
      case 'about':
        return (
          <ComingSoonPage
            title="About LOCUS"
            description="The centralized campus infrastructure and venue reservation portal built for COEP Technological University."
            onBackHome={() => setActiveTab('home')}
          />
        )
      case 'login':
        return (
          <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
            <LoginForm
              onLoginSuccess={() => {
                setActiveTab('home')
              }}
            />
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        )
      default:
        return (
          <>
            {/* 2. Hero Section: Wide Full-Bleed Right Layout */}
            <section className="relative pt-6 pb-10 sm:pt-8 sm:pb-12 lg:pb-14 bg-[rgb(249,248,246)] z-20">
              {/* Desktop Full-Bleed Right Image Container with subtle breathing room */}
              <div className="hidden lg:block absolute top-0 bottom-0 left-[50%] xl:left-[48%] right-0 pointer-events-none select-none z-0 pl-3 xl:pl-4 overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-end">
                  {/* Subtle Circular Sky Glow behind the tower */}
                  <div className="absolute top-4 right-16 w-80 xl:w-96 aspect-square rounded-full bg-gradient-to-tr from-sky-200/50 via-sky-100/35 to-transparent pointer-events-none -z-10"></div>

                  {/* Dedicated Building + Sky Wrapper for Birds */}
                  <div className="relative flex items-center justify-end w-full h-full">
                    {/* Animated Birds flying behind the building tower */}
                    <FlyingBirds />
                    <img
                      src="/coep_building.png"
                      alt="COEP Technological University Main Building"
                      className="relative z-20 w-full h-full object-contain object-right max-h-[580px]"
                    />
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Hero Content: Anchored cleanly */}
                  <div className="lg:col-span-7 xl:col-span-6 space-y-4 sm:space-y-6 py-2 sm:py-6">
                    <div className="inline-flex items-center gap-2 text-slate-500 text-[11px] sm:text-xs font-bold uppercase tracking-widest">
                      COEP TECHNOLOGICAL UNIVERSITY
                    </div>

                    <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                      Book Venues,<br />
                      Without the{' '}
                      <span className="relative inline-block text-blue-600">
                        Hassle
                        {/* Curved underline vector */}
                        <svg
                          className="absolute -bottom-2 sm:-bottom-2.5 left-0 w-full h-3 sm:h-3.5 text-blue-500 overflow-visible pointer-events-none"
                          viewBox="0 0 100 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M2 9.5C24 3.5 62 1.5 98 6.5C82 10.5 45 11.5 12 10.5"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </h1>

                    <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-lg leading-relaxed">
                      Find and book classrooms, seminar halls, auditoriums and other campus venues easily.
                    </p>

                    {/* Quick Search Floating Bar */}
                    <div className="pt-2">
                      <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 max-w-xl">
                        {/* Venue Type Picker */}
                        <div className="relative flex-1 w-full">
                          <button
                            type="button"
                            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                            className="w-full h-12 sm:h-13 px-3.5 rounded-xl bg-transparent hover:bg-slate-50 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <MapPin className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                              <div className="text-left">
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-900 leading-tight">
                                  Venue Type
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                  {selectedType}
                                </div>
                              </div>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          </button>

                          {/* Dropdown Menu */}
                          {isTypeDropdownOpen && (
                            <div className="absolute top-14 sm:top-15 left-0 w-full min-w-[200px] bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40">
                              {venueTypes.map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => {
                                    setSelectedType(type)
                                    setIsTypeDropdownOpen(false)
                                  }}
                                  className={`w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-blue-50 transition-colors flex items-center justify-between cursor-pointer ${selectedType === type ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'
                                    }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="hidden sm:block w-px h-8 bg-slate-200"></div>

                        {/* Date Picker Trigger with Custom In-Website Calendar Popup */}
                        <div className="relative flex-1 w-full">
                          <button
                            type="button"
                            onClick={() => {
                              setIsDatePickerOpen(!isDatePickerOpen)
                              setIsTypeDropdownOpen(false)
                            }}
                            className={`w-full h-12 sm:h-13 px-3.5 rounded-xl transition-colors cursor-pointer text-left flex items-center justify-between gap-2 ${isDatePickerOpen ? 'bg-blue-50/70 ring-1 ring-blue-500/30' : 'bg-transparent hover:bg-slate-50'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <Calendar className={`w-4.5 h-4.5 shrink-0 ${selectedDate || isDatePickerOpen ? 'text-blue-600' : 'text-slate-400'}`} />
                              <div className="text-left">
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-900 leading-tight">
                                  Date
                                </div>
                                <div className={`text-xs truncate ${selectedDate ? 'font-bold text-blue-600' : 'text-slate-500'}`}>
                                  {formatDateDisplay(selectedDate)}
                                </div>
                              </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isDatePickerOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
                          </button>

                          {/* Custom Website-Styled Calendar Dropdown */}
                          {isDatePickerOpen && (
                            <CustomCalendarPicker
                              selectedDate={selectedDate}
                              onSelectDate={(newDate) => {
                                setSelectedDate(newDate)
                                setIsDatePickerOpen(false)
                              }}
                              onClose={() => setIsDatePickerOpen(false)}
                            />
                          )}
                        </div>

                        {/* Search Button */}
                        <button
                          type="button"
                          onClick={() => handleNavClick('venues')}
                          className="w-full sm:w-auto h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 shrink-0 cursor-pointer"
                        >
                          <span>Search</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Campus Stats Pills */}
                    <div className="pt-1 flex flex-wrap items-center gap-5 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-semibold text-slate-700">60+ Venues Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <span>Conflict-Free Booking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <span>Instant Request Tracking</span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile-Only Illustration */}
                  <div className="block lg:hidden mt-4 w-full relative overflow-hidden">
                    <FlyingBirds />
                    <img
                      src="/coep_building.png"
                      alt="COEP Technological University Main Building"
                      className="relative z-20 w-full h-auto object-contain max-h-[360px] mx-auto select-none pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Popular Venue Types Section */}
            <section className="relative z-0 pt-4 pb-12 sm:pt-6 sm:pb-14 bg-[rgb(249,248,246)]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
                  <div>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">
                      Browse Venues
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Popular Venue Types
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('venues')}
                    className="self-start sm:self-auto group inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    <span>View All Venues</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
                  {popularTypes.map((type) => (
                    <div
                      key={type.title}
                      onClick={() => setSelectedVenueForBooking(type.title)}
                      className="h-full flex flex-col"
                    >
                      <VenueTypeCard
                        icon={type.icon}
                        title={type.title}
                        description={type.description}
                        count={type.count}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. How It Works Section */}
            <section className="py-12 sm:py-16 bg-[rgb(249,248,246)] border-t border-slate-200/60">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="mb-8 sm:mb-10 text-left sm:text-left">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">
                    How It Works
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Book in 3 Simple Steps
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4 p-4 sm:p-0 rounded-2xl bg-white sm:bg-transparent border sm:border-0 border-slate-200/80 shadow-xs sm:shadow-none">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base mb-1">Check Availability</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Select your desired venue and inspect live open slots on the calendar.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4 p-4 sm:p-0 rounded-2xl bg-white sm:bg-transparent border sm:border-0 border-slate-200/80 shadow-xs sm:shadow-none">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base mb-1">Make a Booking</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Fill in event purpose, department, and faculty coordinator details.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4 p-4 sm:p-0 rounded-2xl bg-white sm:bg-transparent border sm:border-0 border-slate-200/80 shadow-xs sm:shadow-none">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                      3
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base mb-1">Get Confirmation</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Receive approval notification and reservation slip from administration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(249,248,246)] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-[rgb(249,248,246)]/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
          <div onClick={() => handleNavClick('home')}>
            <LocusLogo size="default" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`transition-colors cursor-pointer relative pb-1 ${activeTab === 'home'
                ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600'
                : 'hover:text-slate-900'
                }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('venues')}
              className={`transition-colors cursor-pointer relative pb-1 ${activeTab === 'venues'
                ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600'
                : 'hover:text-slate-900'
                }`}
            >
              Venues
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('events')}
              className={`transition-colors cursor-pointer relative pb-1 ${
                activeTab === 'events'
                  ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600'
                  : 'hover:text-slate-900'
              }`}
            >
              Events
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('my-bookings')}
              className={`transition-colors cursor-pointer relative pb-1 ${activeTab === 'my-bookings'
                ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600'
                : 'hover:text-slate-900'
                }`}
            >
              My Bookings
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className={`transition-colors cursor-pointer relative pb-1 ${activeTab === 'about'
                ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600'
                : 'hover:text-slate-900'
                }`}
            >
              About
            </button>
          </nav>

          {/* Desktop Login Button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleNavClick('login')}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
            >
              Login
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => handleNavClick('login')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs shadow-xs"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-[rgb(249,248,246)] px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'home' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-100'
                }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('venues')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'venues' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-100'
                }`}
            >
              Venues
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('events')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                activeTab === 'events' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Events
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('my-bookings')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'my-bookings' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-100'
                }`}
            >
              My Bookings
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'about' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-100'
                }`}
            >
              About
            </button>
          </div>
        )}
      </header>

      {/* Main Dynamic View */}
      <main className="flex-1 flex flex-col">
        {renderTabContent()}
      </main>

      {/* Interactive Venue Reservation Modal */}
      {selectedVenueForBooking && (
        <VenueBookingModal
          venue={
            typeof selectedVenueForBooking === 'object'
              ? selectedVenueForBooking
              : venues.find(
                (v) =>
                  v.new_hall_name === selectedVenueForBooking ||
                  v.old_hall_name === selectedVenueForBooking
              ) || {
                new_hall_name: selectedVenueForBooking,
                department: 'COEP Technological University',
                benches: 30
              }
          }
          defaultDate={selectedDate}
          onClose={() => setSelectedVenueForBooking(null)}
          onSubmitBooking={(bookingData) => {
            handleAddBooking(bookingData)
          }}
        />
      )}

      {/* 5. Enhanced Campus Footer */}
      <footer className="mt-auto border-t border-slate-200/90 bg-[rgb(244,242,238)] text-slate-600">
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200/80">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div onClick={() => setActiveTab('home')} className="inline-block">
                <LocusLogo />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                Centralized venue reservation portal for COEP Technological University. Simplifying access to classrooms, auditoriums, and seminar halls across North and South campus.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>System Status: All Services Operational</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Navigation
              </h4>
              <ul className="space-y-2.5 text-xs font-medium">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('home')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('venues')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Explore Venues
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('my-bookings')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    My Bookings
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('about')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    About LOCUS
                  </button>
                </li>
              </ul>
            </div>

            {/* Venue Categories */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Venues
              </h4>
              <ul className="space-y-2.5 text-xs font-medium">
                {['Classrooms', 'Seminar Halls', 'Auditoriums', 'Meeting Rooms'].map((cat) => (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => setSelectedVenueForBooking(cat)}
                      className="hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Campus & Support */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Support
              </h4>
              <ul className="space-y-2.5 text-xs font-medium">
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedVenueForBooking('Booking Guidelines')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Booking Guidelines
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedVenueForBooking('IT Helpdesk')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    IT Helpdesk
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedVenueForBooking('Privacy Policy')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedVenueForBooking('Terms of Use')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Terms of Use
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 tracking-wider">LOCUS</span>
              <span>&bull;</span>
              <span>COEP Technological University &copy; 2026. All rights reserved.</span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Wellesley Road, Shivajinagar, Pune - 411005, Maharashtra, India
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const mockEmails = [
  'admin@coeptech.ac.in',
  'faculty@coeptech.ac.in'
]

export function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('Faculty Coordinator')
  const [userStatus, setUserStatus] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const timerRef = React.useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const verifyEmailInput = () => {
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail || !trimmedEmail.endsWith('@coeptech.ac.in')) {
      setUserStatus(null)
      setErrorMessage('Please use your official @coeptech.ac.in email address.')
      return false
    }

    setErrorMessage('')
    if (mockEmails.includes(trimmedEmail)) {
      setUserStatus('existing')
    } else {
      setUserStatus('new')
    }
    return true
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    if (errorMessage) setErrorMessage('')
    if (userStatus) {
      setUserStatus(null)
      setPassword('')
      setConfirmPassword('')
    }
  }

  const handleEmailBlur = () => {
    if (email.trim() && !userStatus) {
      verifyEmailInput()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail || !trimmedEmail.endsWith('@coeptech.ac.in')) {
      setUserStatus(null)
      setErrorMessage('Please use your official @coeptech.ac.in email address.')
      return
    }

    if (!userStatus) {
      verifyEmailInput()
      return
    }

    if (userStatus === 'existing') {
      if (!password.trim()) {
        setErrorMessage('Password cannot be blank.')
        return
      }

      setIsVerifying(true)
      timerRef.current = setTimeout(() => {
        setIsVerifying(false)
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess({
            email: trimmedEmail,
            role: 'Existing User',
            isNewUser: false
          })
        }
      }, 900)
      return
    }

    if (userStatus === 'new') {
      if (!password.trim()) {
        setErrorMessage('Password cannot be blank.')
        return
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify your confirmation password.')
        return
      }

      setIsVerifying(true)
      timerRef.current = setTimeout(() => {
        setIsVerifying(false)
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess({
            email: trimmedEmail,
            role,
            isNewUser: true
          })
        }
      }, 900)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-2xl bg-[rgb(249,248,246)] text-slate-900 border border-slate-200 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          {userStatus === 'new'
            ? 'Create Account'
            : userStatus === 'existing'
              ? 'Welcome Back'
              : 'COEP Sign In'}
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          {userStatus === 'new'
            ? 'Complete your profile to register for campus venue bookings.'
            : userStatus === 'existing'
              ? 'Enter your password to access your reservations.'
              : 'Enter your official university email to continue.'}
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {userStatus && (
        <div className="mb-4 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
          <span className="font-medium">
            {userStatus === 'existing' ? 'Existing account detected' : 'New account registration'}
          </span>
          <button
            type="button"
            onClick={() => {
              setUserStatus(null)
              setPassword('')
              setConfirmPassword('')
            }}
            className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer text-[11px]"
          >
            Change
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* University Email Input Box */}
        <div>
          <label
            htmlFor="university-email"
            className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            University Email
          </label>
          <input
            id="university-email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder="name@coeptech.ac.in"
            disabled={isVerifying}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
          />
        </div>

        {/* Existing User View: Single Password Field */}
        {userStatus === 'existing' && (
          <div>
            <label
              htmlFor="password"
              className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              placeholder="Enter your password"
              disabled={isVerifying}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
            />
          </div>
        )}

        {/* New User View: Role + Create Password & Confirm Password in two-column row */}
        {userStatus === 'new' && (
          <>
            <div>
              <label
                htmlFor="user-role"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Role
              </label>
              <div className="relative">
                <select
                  id="user-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isVerifying}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 outline-none focus:border-blue-500 transition-colors disabled:opacity-60 appearance-none pr-8 cursor-pointer"
                >
                  <option value="Faculty Coordinator">Faculty Coordinator</option>
                  <option value="Club/Org Representative">Club/Org Representative</option>
                  <option value="Campus Site Administrator">Campus Site Administrator</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="create-password"
                  className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Create Password
                </label>
                <input
                  id="create-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errorMessage) setErrorMessage('')
                  }}
                  placeholder="Enter password"
                  disabled={isVerifying}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errorMessage) setErrorMessage('')
                  }}
                  placeholder="Confirm password"
                  disabled={isVerifying}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
                />
              </div>
            </div>
          </>
        )}

        {/* Action Button */}
        {!userStatus ? (
          <button
            type="button"
            onClick={verifyEmailInput}
            className="w-full h-10 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full h-10 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed shadow-sm"
          >
            {isVerifying ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-label="Verifying identity"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Verifying identity...</span>
              </>
            ) : (
              <span>{userStatus === 'existing' ? 'Secure Login' : 'Register & Sign Up'}</span>
            )}
          </button>
        )}
      </form>
    </div>
  )
}

