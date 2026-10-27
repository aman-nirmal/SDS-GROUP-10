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
  ArrowRight,
  ArrowLeft,
  Menu,
  X,
  AlertCircle,
  ShieldCheck,
  LayoutGrid,
  CalendarDays,
  Mail,
  RefreshCw,
  Shield,
  LogOut,
  Lock,
  GraduationCap,
  BookOpen,
  Trophy,
  List,
  SlidersHorizontal,
  RotateCcw,
  Info,
  Sparkles,
  Check,
  Sun,
  Moon
} from 'lucide-react'
import { loginWithOutlook, clearStaleMsalInteractionStatus } from './lib/msalConfig'
import { authApi } from './lib/api'
import About from './components/About';
import AdminPanel from './components/AdminPanel'
import GuestPortal from './components/GuestPortal'
import FacultyPortal from './components/FacultyPortal'
import StudentPortal from './components/StudentPortal'
import ClubPortal from './components/ClubPortal'
import SecurityPortal from './components/SecurityPortal'

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
    <div className="group h-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between">
      <div className="flex-1 flex flex-col">
        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-200 dark:group-hover:border-blue-700 transition-colors mb-5 shrink-0">
          <Icon className="w-6 h-6 stroke-[1.6]" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed min-h-[40px]">
          {description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {count} Available
        </span>
        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors">
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
      className="absolute top-15 left-0 sm:left-auto sm:right-0 w-[290px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-200/90 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Month & Year Navigation Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
          {monthNames[month]} {year}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 text-center mb-1">
        {daysOfWeek.map((day, idx) => (
          <span key={idx} className="text-[11px] font-bold text-slate-400 dark:text-slate-500 py-1">
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {/* Prev month days */}
        {prevMonthDays.map((d, i) => (
          <span key={`prev-${i}`} className="text-slate-300 dark:text-slate-600 py-1.5 text-[11px]">
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
                : 'text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
            >
              {dayNum}
            </button>
          )
        })}

        {/* Next month days */}
        {Array.from({ length: nextMonthDaysCount }).map((_, i) => (
          <span key={`next-${i}`} className="text-slate-300 dark:text-slate-600 py-1.5 text-[11px]">
            {i + 1}
          </span>
        ))}
      </div>

      {/* Footer Actions: Clear & Today */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold">
        <button
          type="button"
          onClick={handleClear}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
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

// Helper function to get authentic high-quality image for any campus venue
export function getVenueImageUrl(venue) {
  if (venue?.image) return venue.image
  if (venue?.image_url) return venue.image_url

  const name = `${venue?.new_hall_name || ''} ${venue?.old_hall_name || ''} ${venue?.name || ''}`.toLowerCase()
  const type = `${venue?.type || ''}`.toLowerCase()

  if (type.includes('auditorium') || name.includes('aud')) {
    return 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80'
  }
  if (type.includes('seminar') || name.includes('sh') || name.includes('seminar') || name.includes('drawing') || name.includes('nd')) {
    return 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80'
  }
  if (type.includes('meeting') || name.includes('mr') || name.includes('conference')) {
    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
  }
  // Default authentic university classroom interior with desks and chalkboard
  return 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80'
}

// Helper function to get official faculty in-charge & department coordinator for any venue
export function getVenueFaculty(venue) {
  if (venue?.faculty_incharge) return venue.faculty_incharge

  const dept = (venue?.department || '').toLowerCase()
  if (dept.includes('civil')) {
    return {
      name: 'Prof. K. A. Patil',
      designation: 'Faculty In-Charge & Head of Department',
      email: 'hod.civil@coeptech.ac.in',
      office: 'Civil Main Building, Room 102'
    }
  }
  if (dept.includes('academics')) {
    return {
      name: 'Dr. P. R. Dhamangaonkar',
      designation: 'Dean Academics & Complex In-Charge',
      email: 'dean.acad@coeptech.ac.in',
      office: 'Academic Complex Administrative Block, 1st Floor'
    }
  }
  if (dept.includes('electrical')) {
    return {
      name: 'Dr. V. N. Pande',
      designation: 'Faculty In-Charge, Electrical Dept',
      email: 'hod.elec@coeptech.ac.in',
      office: 'Electrical Dept Building, Room 105'
    }
  }
  if (dept.includes('electronics') || dept.includes('entc')) {
    return {
      name: 'Dr. P. P. Bartakke',
      designation: 'Faculty In-Charge, ENTC Dept',
      email: 'hod.extc@coeptech.ac.in',
      office: 'ENTC Building, 2nd Floor'
    }
  }
  if (dept.includes('mechanical')) {
    return {
      name: 'Dr. S. S. Pardeshi',
      designation: 'Faculty In-Charge, Mechanical Dept',
      email: 'hod.mech@coeptech.ac.in',
      office: 'Mechanical Dept Main Hall, Room 14'
    }
  }
  if (dept.includes('metallurgy')) {
    return {
      name: 'Dr. S. T. Vagge',
      designation: 'Faculty In-Charge, Metallurgy Dept',
      email: 'hod.meta@coeptech.ac.in',
      office: 'Metallurgy Dept Block, Ground Floor'
    }
  }
  if (dept.includes('management')) {
    return {
      name: 'Dr. S. K. Patil',
      designation: 'Faculty Coordinator, Department of Management',
      email: 'hod.mgmt@coeptech.ac.in',
      office: 'Management Studies Wing, Room 05'
    }
  }
  if (dept.includes('manufacturing')) {
    return {
      name: 'Dr. Rajiv B.',
      designation: 'Faculty In-Charge, Manufacturing & Industrial Mgmt',
      email: 'hod.mfg@coeptech.ac.in',
      office: 'Production & Manufacturing Block, Room 12'
    }
  }
  if (dept.includes('computer')) {
    return {
      name: 'Dr. V. K. Pachghare',
      designation: 'Faculty In-Charge & HOD, Computer Dept',
      email: 'hod.comp@coeptech.ac.in',
      office: 'Computer New Building, 3rd Floor, Room 301'
    }
  }
  if (dept.includes('bhau')) {
    return {
      name: 'Dr. S. Radhakrishnan',
      designation: 'Faculty Director, BHAU Institute',
      email: 'director.bhau@coeptech.ac.in',
      office: 'BHAU Incubation Center, Executive Suite'
    }
  }
  return {
    name: 'Central Estate Officer',
    designation: 'Faculty In-Charge, Campus Infrastructure & Estate',
    email: 'estate@coeptech.ac.in',
    office: 'Central Estate Office, Main Victorian Quadrangle'
  }
}

// Classrooms are mostly occupied 10:30 to 5:30 with regular lectures, with free gaps in between
export const classroomTimeSlots = [
  { time: '08:30 AM - 10:30 AM', status: 'free' },
  { time: '10:30 AM - 12:30 PM', status: 'occupied', label: 'Lecture' },
  { time: '12:30 PM - 01:30 PM', status: 'free', label: 'Tutorial Gap' },
  { time: '01:30 PM - 02:30 PM', status: 'free', label: 'Lunch Gap' },
  { time: '02:30 PM - 04:30 PM', status: 'occupied', label: 'Lab Class' },
  { time: '04:30 PM - 05:30 PM', status: 'free', label: 'Evening Gap' },
  { time: '05:30 PM - 07:30 PM', status: 'free' }
]

// Complete Interactive Venue Booking Modal Component with Full Venue Specs & Faculty In-Charge
function VenueBookingModal({ venue, defaultDate, onClose, onSubmitBooking }) {
  const [date, setDate] = useState(defaultDate || '2026-10-16')
  const [selectedSlot, setSelectedSlot] = useState('12:30 PM - 01:30 PM')
  const [showSchedule, setShowSchedule] = useState(false)
  const [applicantName, setApplicantName] = useState('')
  const [department, setDepartment] = useState(venue?.department || 'Computer Engineering')
  const [eventPurpose, setEventPurpose] = useState('')
  const [attendees, setAttendees] = useState(venue?.benches ? venue.benches * 2 : 50)
  const [submitted, setSubmitted] = useState(false)
  const [bookingRef, setBookingRef] = useState('')

  const venueTitle = venue?.new_hall_name || venue?.old_hall_name || 'Selected Venue'
  const venuePhoto = getVenueImageUrl(venue)
  const faculty = getVenueFaculty(venue)
  const capacity = venue?.capacity || (venue?.benches ? venue.benches * 2 : 60)
  const benches = venue?.benches || Math.round(capacity / 2)

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
        facultyInCharge: faculty.name,
        status: 'Confirmed'
      })
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 my-6 flex flex-col text-slate-900 dark:text-slate-100"
      >
        {submitted ? (
          <div className="p-8 text-center py-10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <CheckCircle2 className="w-9 h-9 stroke-[2]" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">
              Reservation Confirmed
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              Slot Reserved Successfully!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed max-w-md mx-auto">
              Your venue reservation for <strong className="text-slate-900 dark:text-white">{venueTitle}</strong> on{' '}
              <strong className="text-slate-900 dark:text-white">{formatDateDisplay(date)}</strong> ({selectedSlot}) has been registered.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-left mb-6 space-y-3 max-w-lg mx-auto">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Reference Code:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">{bookingRef}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Applicant:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{applicantName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Department:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{department}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Faculty In-Charge Notified:</span>
                <span className="font-bold text-blue-700 dark:text-blue-400">{faculty.name} ({faculty.email})</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/80 dark:border-slate-700/80">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Official Request Logged
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-8 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all duration-200 cursor-pointer shadow-xs"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <div>
            {/* 1. Large Image Banner Header */}
            <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-900">
              <img
                src={venuePhoto}
                alt={venueTitle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/coep_building.png'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-black/20" />

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="text-xs font-black tracking-wide text-white bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 shadow-xs">
                  {venue?.new_hall_name || 'Passage Hall'}
                </span>
                <span className="text-[11px] font-bold text-blue-200 bg-blue-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-blue-400/20">
                  {venue?.type || 'Classrooms'}
                </span>
              </div>

              {/* Banner Title & Department */}
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">
                  {venue?.old_hall_name || venue?.new_hall_name}
                </h2>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-200 mt-1">
                  <Building className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  <span>{venue?.department || 'COEP Campus'}</span>
                  {venue?.old_hall_name && venue.new_hall_name && (
                    <span>&bull; Hall Code: {venue.new_hall_name}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-5">
              {/* 2. Venue Specifications Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                    Capacity
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">{capacity} Persons</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                    Benches
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">{benches} Benches</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                    Category
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate block">{venue?.type || 'Classrooms'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                    Status
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Available Now
                  </span>
                </div>
              </div>

              {/* 3. Concise Faculty In-Charge */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Faculty In-Charge:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{faculty.name}</span>
                </div>
                <a
                  href={`mailto:${faculty.email}`}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-[11px] font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  {faculty.email}
                </a>
              </div>

              {/* 4. Installed Facilities & Amenities */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                  Installed Classroom Facilities:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(venue?.features || [
                    'Overhead Projector',
                    'PA Sound System',
                    'Air Conditioned',
                    'Wi-Fi 6'
                  ]).map((feat, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-slate-200/70 dark:border-slate-700"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* 5. Slot Reservation Form */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Date & Time Slot */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      1. Reservation Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        2. Time Slot
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSchedule(!showSchedule)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{showSchedule ? 'Hide Timetable' : 'View Timetable'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSchedule ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Expandable Daily Timetable Strip */}
                    {showSchedule && (
                      <div className="mb-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs animate-in fade-in duration-150">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                          <span>Lecture Hours (10:30 AM – 5:30 PM)</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Green = Free for booking</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium">
                            <span className="font-bold block">08:30 – 10:30 AM</span> Free
                          </div>
                          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-medium line-through">
                            <span className="font-bold block">10:30 – 12:30 PM</span> Lecture
                          </div>
                          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium">
                            <span className="font-bold block">12:30 – 02:30 PM</span> Free Gaps
                          </div>
                          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-medium line-through">
                            <span className="font-bold block">02:30 – 04:30 PM</span> Practical
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Clean Simple Time Slot Buttons (Bottom Options) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {classroomTimeSlots.map((slot, i) => {
                        const isFree = slot.status === 'free'
                        const isSelected = selectedSlot === slot.time
                        return isFree ? (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedSlot(slot.time)}
                            className={`p-2.5 rounded-xl text-xs font-semibold border text-left cursor-pointer transition-colors flex items-center justify-between ${isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-slate-700/60'
                              }`}
                          >
                            <span className="dark:text-slate-100">{slot.time}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-white" />}
                          </button>
                        ) : (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 line-through flex items-center justify-between cursor-not-allowed select-none"
                            title="Occupied for regular classes"
                          >
                            <span>{slot.time}</span>
                            <span className="text-[10px] text-rose-500 dark:text-rose-400 font-semibold">{slot.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Applicant Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Applicant / Faculty Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="e.g. Prof. R. Sharma / Student"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Applicant Department
                      </label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Event Purpose */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Event Purpose / Session Topic *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventPurpose}
                      onChange={(e) => setEventPurpose(e.target.value)}
                      placeholder="e.g. Guest Lecture, Lab Tutorial, Club Meeting"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>
                      Venue Capacity: <strong className="dark:text-slate-200">{capacity} Persons</strong> ({benches} Benches)
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Instant Campus Approval
                    </span>
                  </div>

                  {/* Submit / Cancel Buttons */}
                  <div className="pt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer inline-flex items-center justify-center gap-2"
                    >
                      <span>Confirm Reservation</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
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

// Coming Soon Placeholder Component
function ComingSoonPage({ title, description, onBackHome }) {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-6 py-24 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 shadow-xs">
        <Clock className="w-8 h-8 stroke-[1.75]" />
      </div>
      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
        Under Developmentf
      </span>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
        {title}
      </h2>
      <p className="text-base text-slate-600 dark:text-slate-300 max-w-md mb-8 leading-relaxed">
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

// Full Interactive & Modern Venue Catalog Page
function VenuesPage({ venues = [], isLoading = false, initialType, initialDate, onSelectVenue, onBackHome }) {
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
    'Meeting Rooms'
  ]

  const getTypeCount = (type) => {
    if (type === 'All Spaces') return venues.length
    return venues.filter((v) => v.type === type).length
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
    const matchesType =
      filterType === 'All Spaces' || venue.type === filterType
    const matchesSearch =
      searchQuery.trim() === '' ||
      (venue.new_hall_name && venue.new_hall_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (venue.old_hall_name && venue.old_hall_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (venue.department && venue.department.toLowerCase().includes(searchQuery.toLowerCase()))

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

const sampleVenuesFallback = [
  // --- Civil Engineering Classrooms ---
  {
    id: 'vn-ce-sc06',
    new_hall_name: 'SC06',
    old_hall_name: 'South Classroom 06',
    department: 'Civil Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Sound System']
  },
  {
    id: 'vn-ce-sc07',
    new_hall_name: 'SC07',
    old_hall_name: 'South Classroom 07',
    department: 'Civil Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Sound System']
  },
  {
    id: 'vn-ce-nc16',
    new_hall_name: 'NC16',
    old_hall_name: 'New Classroom Complex 16',
    department: 'Civil Engineering',
    type: 'Classrooms',
    benches: 45,
    capacity: 90,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Interactive Screen', 'Sound System', 'Wi-Fi 6']
  },
  {
    id: 'vn-ce-sc20',
    new_hall_name: 'SC20',
    old_hall_name: 'South Classroom 20',
    department: 'Civil Engineering',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Dual Podium']
  },
  {
    id: 'vn-ce-sc21',
    new_hall_name: 'SC21',
    old_hall_name: 'South Classroom 21',
    department: 'Civil Engineering',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Audio System']
  },

  // --- Academics Complex Classrooms: NC01 - NC14 ---
  ...['NC01', 'NC02', 'NC03', 'NC04', 'NC05', 'NC06', 'NC07', 'NC08', 'NC09', 'NC10', 'NC11', 'NC12', 'NC13', 'NC14'].map((code) => ({
    id: `vn-ac-${code.toLowerCase()}`,
    new_hall_name: code,
    old_hall_name: `Academic Complex ${code}`,
    department: 'Academics Complex',
    type: 'Classrooms',
    benches: 45,
    capacity: 90,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Interactive Screen', 'Central AC', 'Motorized Screen', 'Digital Podium']
  })),

  // --- Electrical Engineering Classrooms ---
  {
    id: 'vn-ee-sc01',
    new_hall_name: 'SC01',
    old_hall_name: 'South Classroom 01',
    department: 'Electrical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Board', 'Audio System', 'Projector']
  },
  {
    id: 'vn-ee-sc02',
    new_hall_name: 'SC02',
    old_hall_name: 'South Classroom 02',
    department: 'Electrical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Board', 'Audio System', 'Projector']
  },
  {
    id: 'vn-ee-sc03',
    new_hall_name: 'SC03',
    old_hall_name: 'South Classroom 03',
    department: 'Electrical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Board', 'Audio System', 'Projector']
  },
  {
    id: 'vn-ee-st06',
    new_hall_name: 'ST06',
    old_hall_name: 'South Tutorial Hall 06',
    department: 'Electrical Engineering',
    type: 'Classrooms',
    benches: 30,
    capacity: 60,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Whiteboard', 'Overhead Projector', 'Wi-Fi 6']
  },

  // --- Electronics and Telecommunication Engineering Classrooms ---
  {
    id: 'vn-entc-nc22',
    new_hall_name: 'NC22',
    old_hall_name: 'New Classroom Complex 22',
    department: 'Electronics and Telecommunication Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Interactive Board', 'Air Conditioned', 'Audio System']
  },
  {
    id: 'vn-entc-nt10',
    new_hall_name: 'NT10',
    old_hall_name: 'New Tutorial Hall 10',
    department: 'Electronics and Telecommunication Engineering',
    type: 'Classrooms',
    benches: 30,
    capacity: 60,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Interactive Display', 'LAN Port', 'Whiteboard']
  },
  {
    id: 'vn-entc-nc23',
    new_hall_name: 'NC23',
    old_hall_name: 'New Classroom Complex 23',
    department: 'Electronics and Telecommunication Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Interactive Board', 'Air Conditioned', 'Audio System']
  },
  {
    id: 'vn-entc-nc24',
    new_hall_name: 'NC24',
    old_hall_name: 'New Classroom Complex 24',
    department: 'Electronics and Telecommunication Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Interactive Board', 'Air Conditioned', 'Audio System']
  },
  {
    id: 'vn-entc-nt11',
    new_hall_name: 'NT11',
    old_hall_name: 'New Tutorial Hall 11',
    department: 'Electronics and Telecommunication Engineering',
    type: 'Classrooms',
    benches: 30,
    capacity: 60,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Interactive Screen', 'LAN Port', 'Whiteboard']
  },

  // --- Mechanical Engineering Classrooms ---
  {
    id: 'vn-me-nc18',
    new_hall_name: 'NC18',
    old_hall_name: 'New Classroom Complex 18',
    department: 'Mechanical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-me-nc19',
    new_hall_name: 'NC19',
    old_hall_name: 'New Classroom Complex 19',
    department: 'Mechanical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-me-nc20',
    new_hall_name: 'NC20',
    old_hall_name: 'New Classroom Complex 20',
    department: 'Mechanical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-me-nc21',
    new_hall_name: 'NC21',
    old_hall_name: 'New Classroom Complex 21',
    department: 'Mechanical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-me-nt06',
    new_hall_name: 'NT06',
    old_hall_name: 'New Tutorial Hall 06',
    department: 'Mechanical Engineering',
    type: 'Classrooms',
    benches: 30,
    capacity: 60,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Whiteboard', 'Overhead Projector', 'Audio System']
  },
  {
    id: 'vn-me-nd01',
    new_hall_name: 'ND01',
    old_hall_name: 'North Drawing Hall 01',
    department: 'Mechanical Engineering',
    type: 'Classrooms',
    benches: 90,
    capacity: 180,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    features: ['High-Ceiling Hall', 'Dual Projectors', 'PA Sound System']
  },

  // --- Metallurgy and Materials Science Classrooms ---
  {
    id: 'vn-mme-sc14',
    new_hall_name: 'SC14',
    old_hall_name: 'South Classroom 14',
    department: 'Metallurgy and Materials Science',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Audio System']
  },
  {
    id: 'vn-mme-sc15',
    new_hall_name: 'SC15',
    old_hall_name: 'South Classroom 15',
    department: 'Metallurgy and Materials Science',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Audio System']
  },
  {
    id: 'vn-mme-sc16',
    new_hall_name: 'SC16',
    old_hall_name: 'South Classroom 16',
    department: 'Metallurgy and Materials Science',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Audio System']
  },

  // --- Management Classrooms ---
  {
    id: 'vn-mgmt-sc17',
    new_hall_name: 'SC17',
    old_hall_name: 'South Classroom 17',
    department: 'Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Executive Desks', 'Projection Display', 'Air Conditioned']
  },
  {
    id: 'vn-mgmt-sc18',
    new_hall_name: 'SC18',
    old_hall_name: 'South Classroom 18',
    department: 'Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Executive Desks', 'Projection Display', 'Air Conditioned']
  },
  {
    id: 'vn-mgmt-sc19',
    new_hall_name: 'SC19',
    old_hall_name: 'South Classroom 19',
    department: 'Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Executive Desks', 'Projection Display', 'Air Conditioned']
  },

  // --- Manufacturing Engineering and Industrial Management Classrooms ---
  {
    id: 'vn-mfg-sc10',
    new_hall_name: 'SC10',
    old_hall_name: 'South Classroom 10',
    department: 'Manufacturing Engineering and Industrial Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-mfg-sc11',
    new_hall_name: 'SC11',
    old_hall_name: 'South Classroom 11',
    department: 'Manufacturing Engineering and Industrial Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-mfg-sc12',
    new_hall_name: 'SC12',
    old_hall_name: 'South Classroom 12',
    department: 'Manufacturing Engineering and Industrial Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-mfg-sc13',
    new_hall_name: 'SC13',
    old_hall_name: 'South Classroom 13',
    department: 'Manufacturing Engineering and Industrial Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },

  // --- Computer New Building Classrooms ---
  {
    id: 'vn-cnb-nc27',
    new_hall_name: 'NC-27',
    old_hall_name: 'Computer New Building 27',
    department: 'Computer New Building',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['High-speed Wi-Fi', 'Dual Displays', 'Central AC']
  },
  {
    id: 'vn-cnb-nc28',
    new_hall_name: 'NC-28',
    old_hall_name: 'Computer New Building 28',
    department: 'Computer New Building',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['High-speed Wi-Fi', 'Dual Displays', 'Central AC']
  },
  {
    id: 'vn-cnb-p1',
    new_hall_name: 'Near NC-27 Passage-1',
    old_hall_name: 'Computer New Building Passage Hall 01',
    department: 'Computer New Building',
    type: 'Classrooms',
    benches: 30,
    capacity: 60,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Projector Display', 'Whiteboard', 'Wi-Fi 6']
  },
  {
    id: 'vn-cnb-p2',
    new_hall_name: 'Near NC-27 Passage-2',
    old_hall_name: 'Computer New Building Passage Hall 02',
    department: 'Computer New Building',
    type: 'Classrooms',
    benches: 30,
    capacity: 60,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Projector Display', 'Whiteboard', 'Wi-Fi 6']
  },

  // --- Specialized Campus Venues ---
  {
    id: 'vn-bhau-aud',
    new_hall_name: 'BHAU Aud',
    old_hall_name: 'BHAU Institute Main Auditorium',
    department: 'BHAU Institute',
    type: 'Auditoriums',
    benches: 125,
    capacity: 250,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    features: ['Acoustic Paneling', 'Stage Lighting', 'Dolby PA System']
  },
  {
    id: 'vn-comp-sh',
    new_hall_name: 'COMP SH',
    old_hall_name: 'Computer Department Seminar Hall',
    department: 'Computer Engineering',
    type: 'Seminar Halls',
    benches: 60,
    capacity: 120,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    features: ['Video Conferencing', 'Dual HD Displays', 'Central AC']
  },
  {
    id: 'vn-mr-04',
    new_hall_name: 'MR 04',
    old_hall_name: 'Main Building Meeting Room 04',
    department: 'Central Estate & Infrastructure',
    type: 'Meeting Rooms',
    benches: 12,
    capacity: 24,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    features: ['Conference Table', 'Executive Seating', 'Display Screen']
  },
  {
    id: 'vn-entc-mr',
    new_hall_name: 'ENTC MR',
    old_hall_name: 'ENTC Department Conference Room',
    department: 'Electronics and Telecommunication Engineering',
    type: 'Meeting Rooms',
    benches: 15,
    capacity: 30,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    features: ['High-speed Wi-Fi', 'HDMI Connectivity', 'Speakerphone']
  }
]

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('locus-theme')
      if (saved) return saved
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem('locus-theme', theme)
    } catch {
      // ignore
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const [venues, setVenues] = useState(sampleVenuesFallback)
  const [isLoadingVenues, setIsLoadingVenues] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handlePopState = (event) => {
      const tab = event.state?.activeTab

      const validTabs = [
        'home',
        'venues',
        'events',
        'my-bookings',
        'about',
        'login',
        'guest',
        'faculty',
        'student',
        'club',
        'admin',
        'security'
      ]

      const protectedTabs = ['student', 'faculty', 'club', 'admin', 'security']
      let isAuthed = false
      try {
        isAuthed = !!localStorage.getItem('locus_auth_user')
      } catch {
        isAuthed = false
      }

      if (protectedTabs.includes(tab) && !isAuthed) {
        setActiveTab('login')
        setIsMobileMenuOpen(false)
        return
      }

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

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('locus_auth_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [selectedType, setSelectedType] = useState('All Venues')
  const [selectedDate, setSelectedDate] = useState('')
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [selectedVenueForBooking, setSelectedVenueForBooking] = useState(null)

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

        if (data && data.length > 0) {
          setVenues(data)
        }
      } catch (err) {
        console.warn('Supabase fetch failed, using fallback venues:', err)
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
    const protectedTabs = ['student', 'faculty', 'club', 'admin', 'security']
    if (protectedTabs.includes(tab) && !currentUser) {
      setActiveTab('login')
      window.history.pushState({ activeTab: 'login' }, '', window.location.pathname)
      setIsMobileMenuOpen(false)
      return
    }

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
        return (<About onBackHome={() => setActiveTab('home')} />)

      case 'login':
        return (
          <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
            <LoginForm
              onLoginSuccess={(user) => {
                if (user) {
                  setCurrentUser(user)
                  try {
                    localStorage.setItem('locus_auth_user', JSON.stringify(user))
                  } catch {
                    // ignore
                  }
                  if (user.role === 'Administrator') {
                    setActiveTab('admin')
                    return
                  } else if (user.role === 'Faculty') {
                    setActiveTab('faculty')
                    return
                  } else if (user.role === 'Club Lead') {
                    setActiveTab('club')
                    return
                  } else if (user.role === 'Student') {
                    setActiveTab('student')
                    return
                  } else if (user.role === 'Security Guard') {
                    setActiveTab('security')
                    return
                  }
                }
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
      case 'guest':
        return (
          <GuestPortal
            onNavigateLogin={() => setActiveTab('login')}
            onExploreVenues={() => setActiveTab('venues')}
          />
        )
      case 'faculty':
        if (!currentUser) {
          return (
            <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
              <LoginForm
                onLoginSuccess={(user) => {
                  if (user) {
                    setCurrentUser(user)
                    try {
                      localStorage.setItem('locus_auth_user', JSON.stringify(user))
                    } catch {
                      // ignore
                    }
                    setActiveTab(user.role === 'Faculty' || user.role === 'Administrator' ? 'faculty' : 'home')
                  }
                }}
              />
            </div>
          )
        }
        return (
          <FacultyPortal
            currentUser={currentUser}
            onNavigateLogin={() => setActiveTab('login')}
          />
        )
      case 'student':
        if (!currentUser) {
          return (
            <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
              <LoginForm
                onLoginSuccess={(user) => {
                  if (user) {
                    setCurrentUser(user)
                    try {
                      localStorage.setItem('locus_auth_user', JSON.stringify(user))
                    } catch {
                      // ignore
                    }
                    setActiveTab(user.role === 'Student' || user.role === 'Administrator' ? 'student' : 'home')
                  }
                }}
              />
            </div>
          )
        }
        return (
          <StudentPortal
            currentUser={currentUser}
            onNavigateLogin={() => setActiveTab('login')}
          />
        )
      case 'club':
        if (!currentUser) {
          return (
            <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
              <LoginForm
                onLoginSuccess={(user) => {
                  if (user) {
                    setCurrentUser(user)
                    try {
                      localStorage.setItem('locus_auth_user', JSON.stringify(user))
                    } catch {
                      // ignore
                    }
                    setActiveTab(user.role === 'Club Lead' || user.role === 'Administrator' ? 'club' : 'home')
                  }
                }}
              />
            </div>
          )
        }
        return (
          <ClubPortal
            currentUser={currentUser}
            onNavigateLogin={() => setActiveTab('login')}
          />
        )
      case 'admin':
        if (!currentUser) {
          return (
            <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
              <LoginForm
                onLoginSuccess={(user) => {
                  if (user) {
                    setCurrentUser(user)
                    try {
                      localStorage.setItem('locus_auth_user', JSON.stringify(user))
                    } catch {
                      // ignore
                    }
                    setActiveTab(user.role === 'Administrator' ? 'admin' : 'home')
                  }
                }}
              />
            </div>
          )
        }
        return (
          <AdminPanel
            currentUser={currentUser}
            onBackHome={() => setActiveTab('home')}
            onNavigateLogin={() => setActiveTab('login')}
          />
        )
      case 'security':
        if (!currentUser) {
          return (
            <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
              <LoginForm
                onLoginSuccess={(user) => {
                  if (user) {
                    setCurrentUser(user)
                    try {
                      localStorage.setItem('locus_auth_user', JSON.stringify(user))
                    } catch {
                      // ignore
                    }
                    setActiveTab(user.role === 'Security Guard' || user.role === 'Administrator' ? 'security' : 'home')
                  }
                }}
              />
            </div>
          )
        }
        return (
          <SecurityPortal
            currentUser={currentUser}
            onNavigateLogin={() => setActiveTab('login')}
          />
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
                      src={theme === 'dark' ? '/coep_building_night.png' : '/coep_building.png'}
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
                    <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs font-bold uppercase tracking-widest">
                      COEP TECHNOLOGICAL UNIVERSITY
                    </div>

                    <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                      Book Venues,<br />
                      Without the{' '}
                      <span className="relative inline-block text-blue-600 dark:text-blue-400">
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

                    <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
                      Find and book classrooms, seminar halls, auditoriums and other campus venues easily.
                    </p>

                    {/* Quick Search Floating Bar */}
                    <div className="pt-2">
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 max-w-xl">
                        {/* Venue Type Picker */}
                        <div className="relative flex-1 w-full">
                          <button
                            type="button"
                            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                            className="w-full h-12 sm:h-13 px-3.5 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <MapPin className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                              <div className="text-left">
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                                  Venue Type
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {selectedType}
                                </div>
                              </div>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          </button>

                          {/* Dropdown Menu */}
                          {isTypeDropdownOpen && (
                            <div className="absolute top-14 sm:top-15 left-0 w-full min-w-[200px] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-40">
                              {venueTypes.map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => {
                                    setSelectedType(type)
                                    setIsTypeDropdownOpen(false)
                                  }}
                                  className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${selectedType === type ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/40' : 'text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-800"></div>

                        {/* Date Picker Trigger with Custom In-Website Calendar Popup */}
                        <div className="relative flex-1 w-full">
                          <button
                            type="button"
                            onClick={() => {
                              setIsDatePickerOpen(!isDatePickerOpen)
                              setIsTypeDropdownOpen(false)
                            }}
                            className={`w-full h-12 sm:h-13 px-3.5 rounded-xl transition-colors cursor-pointer text-left flex items-center justify-between gap-2 ${isDatePickerOpen ? 'bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-500/30' : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <Calendar className={`w-4.5 h-4.5 shrink-0 ${selectedDate || isDatePickerOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                              <div className="text-left">
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                                  Date
                                </div>
                                <div className={`text-xs truncate ${selectedDate ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                  {formatDateDisplay(selectedDate)}
                                </div>
                              </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isDatePickerOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
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
                    <div className="pt-1 flex flex-wrap items-center gap-5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">60+ Venues Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                        <span>Conflict-Free Booking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                        <span>Instant Request Tracking</span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile-Only Illustration */}
                  <div className="block lg:hidden mt-4 w-full relative overflow-hidden">
                    <FlyingBirds />
                    <img
                      src={theme === 'dark' ? '/coep_building_night.png' : '/coep_building.png'}
                      alt="COEP Technological University Main Building"
                      className="relative z-20 w-full h-auto object-contain max-h-[360px] mx-auto select-none pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Popular Venue Types Section */}
            <section className="relative z-0 pt-4 pb-12 sm:pt-6 sm:pb-14 bg-[rgb(249,248,246)] dark:bg-[#0b0f19]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
                  <div>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">
                      Browse Venues
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Popular Venue Types
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('venues')}
                    className="self-start sm:self-auto group inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
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
            <section className="py-12 sm:py-16 bg-[rgb(249,248,246)] dark:bg-slate-900/40 border-t border-slate-200/60 dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="mb-8 sm:mb-10 text-left sm:text-left">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">
                    How It Works
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Book in 3 Simple Steps
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4 p-4 sm:p-0 rounded-2xl bg-white dark:bg-slate-900/60 sm:bg-transparent sm:dark:bg-transparent border sm:border-0 border-slate-200/80 dark:border-slate-800 shadow-xs sm:shadow-none">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Check Availability</h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Select your desired venue and inspect live open slots on the calendar.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4 p-4 sm:p-0 rounded-2xl bg-white dark:bg-slate-900/60 sm:bg-transparent sm:dark:bg-transparent border sm:border-0 border-slate-200/80 dark:border-slate-800 shadow-xs sm:shadow-none">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Make a Booking</h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Fill in event purpose, department, and faculty coordinator details.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4 p-4 sm:p-0 rounded-2xl bg-white dark:bg-slate-900/60 sm:bg-transparent sm:dark:bg-transparent border sm:border-0 border-slate-200/80 dark:border-slate-800 shadow-xs sm:shadow-none">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                      3
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Get Confirmation</h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
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
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-[rgb(249,248,246)] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden transition-colors duration-300`}>
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-[rgb(249,248,246)]/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
          <div onClick={() => handleNavClick('home')}>
            <LocusLogo size="default" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`transition-colors cursor-pointer relative pb-1 ${activeTab === 'home'
                ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('venues')}
              className={`transition-colors cursor-pointer relative pb-1 ${activeTab === 'venues'
                ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Venues
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('events')}
              className={`transition-colors cursor-pointer relative pb-1 ${activeTab === 'events'
                ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Events
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className={`transition-colors cursor-pointer relative pb-1 ${activeTab === 'about'
                ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              About
            </button>

            {/* Role-Specific Portal Links - Rendered only for the user's specific role */}
            {currentUser && currentUser.role === 'Student' && (
              <button
                type="button"
                onClick={() => handleNavClick('student')}
                className={`transition-colors cursor-pointer relative pb-1 flex items-center gap-1 ${activeTab === 'student'
                  ? 'text-indigo-600 dark:text-indigo-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-indigo-600 dark:after:bg-indigo-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300'
                  }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Student</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Faculty' && (
              <button
                type="button"
                onClick={() => handleNavClick('faculty')}
                className={`transition-colors cursor-pointer relative pb-1 flex items-center gap-1 ${activeTab === 'faculty'
                  ? 'text-blue-800 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-800 dark:after:bg-blue-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300'
                  }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                <span>Faculty</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Club Lead' && (
              <button
                type="button"
                onClick={() => handleNavClick('club')}
                className={`transition-colors cursor-pointer relative pb-1 flex items-center gap-1 ${activeTab === 'club'
                  ? 'text-amber-700 dark:text-amber-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-amber-700 dark:after:bg-amber-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300'
                  }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Club</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Security Guard' && (
              <button
                type="button"
                onClick={() => handleNavClick('security')}
                className={`transition-colors cursor-pointer relative pb-1 flex items-center gap-1 ${activeTab === 'security'
                  ? 'text-emerald-700 dark:text-emerald-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-emerald-700 dark:after:bg-emerald-400 font-bold'
                  : 'hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300'
                  }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Security</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Administrator' && (
              <button
                type="button"
                onClick={() => handleNavClick('admin')}
                className={`transition-colors cursor-pointer relative pb-1 flex items-center gap-1 ${activeTab === 'admin'
                  ? 'text-purple-600 dark:text-purple-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-600 dark:after:bg-purple-400 font-bold'
                  : 'hover:text-purple-600 dark:hover:text-purple-400 text-slate-700 dark:text-slate-300'
                  }`}
              >
                <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const role = currentUser.role
                    if (role === 'Administrator') handleNavClick('admin')
                    else if (role === 'Faculty') handleNavClick('faculty')
                    else if (role === 'Club Lead') handleNavClick('club')
                    else if (role === 'Security Guard') handleNavClick('security')
                    else handleNavClick('student')
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-semibold transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px]">
                    {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                  </div>
                  <div className="text-left">
                    <div className="font-bold leading-tight">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{currentUser.role}</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentUser(null)
                    try {
                      localStorage.removeItem('locus_auth_user')
                    } catch {
                      // ignore
                    }
                    handleNavClick('home')
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNavClick('login')}
                className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick(currentUser ? 'admin' : 'login')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs shadow-xs"
            >
              {currentUser ? 'Console' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-[rgb(249,248,246)] dark:bg-[#0b0f19] px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'home' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('venues')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'venues' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Venues Catalog
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('events')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'events' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Events
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'about' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              About
            </button>

            {currentUser && currentUser.role === 'Student' && (
              <button
                type="button"
                onClick={() => handleNavClick('student')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'student' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Student Portal</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Faculty' && (
              <button
                type="button"
                onClick={() => handleNavClick('faculty')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'faculty' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <GraduationCap className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Faculty Portal</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Club Lead' && (
              <button
                type="button"
                onClick={() => handleNavClick('club')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'club' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Club Portal</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Security Guard' && (
              <button
                type="button"
                onClick={() => handleNavClick('security')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'security' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Security Terminal</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Administrator' && (
              <button
                type="button"
                onClick={() => handleNavClick('admin')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'admin' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Admin Console</span>
              </button>
            )}
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
      <footer className="mt-auto border-t border-slate-200/90 dark:border-slate-800 bg-[rgb(244,242,238)] dark:bg-[#070b12] text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200/80 dark:border-slate-800/80">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div onClick={() => setActiveTab('home')} className="inline-block">
                <LocusLogo />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                Centralized venue reservation portal for COEP Technological University. Simplifying access to classrooms, auditoriums, and seminar halls across North and South campus.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>System Status: All Services Operational</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
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
                    onClick={() => {
                      setActiveTab('guest')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Visitor Guidelines
                  </button>
                </li>
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

function MicrosoftLogo({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1H10V10H1V1Z" fill="#F25022" />
      <path d="M11 1H20V10H11V1Z" fill="#7FBA00" />
      <path d="M1 11H10V20H1V11Z" fill="#00A4EF" />
      <path d="M11 11H20V20H11V11Z" fill="#FFB900" />
    </svg>
  )
}

function OutlookLogo({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.5 3H21.5C22.0523 3 22.5 3.44772 22.5 4V20C22.5 20.5523 22.0523 21 21.5 21H14.5V3Z" fill="#0078D4" />
      <path d="M14.5 12L22.5 7V17L14.5 12Z" fill="#005A9E" />
      <path d="M1.5 6C1.5 4.89543 2.39543 4 3.5 4H14.5V20H3.5C2.39543 20 1.5 19.1046 1.5 18V6Z" fill="#0078D4" />
      <circle cx="8" cy="12" r="3.5" fill="white" />
      <circle cx="8" cy="12" r="2" fill="#0078D4" />
    </svg>
  )
}

const OFFICIAL_COEP_ACCOUNTS = [
  {
    role: 'Administrator',
    email: 'admin@coeptech.ac.in',
    password: 'Password@123',
    name: 'Central Estate Admin',
    department: 'Central Estate & Infrastructure',
    id: 'ADM-001'
  },
  {
    role: 'Faculty',
    email: 'faculty@coeptech.ac.in',
    password: 'Password@123',
    name: 'Dr. V. K. Kulkarni',
    department: 'Computer Engineering',
    id: 'FAC-1042'
  },
  {
    role: 'Club Lead',
    email: 'mindspark@coeptech.ac.in',
    password: 'Password@123',
    name: 'MindSpark Secretarial Lead',
    department: 'Technical Events Secretariat',
    id: 'CLUB-MS-26'
  },
  {
    role: 'Student',
    email: 'student@coeptech.ac.in',
    password: 'Password@123',
    name: 'Aman Nirmal',
    department: 'Computer Engineering',
    id: 'STU-2026-101'
  },
  {
    role: 'Security Guard',
    email: 'security@coeptech.ac.in',
    password: 'Password@123',
    name: 'Officer S. Patil',
    department: 'Campus Security & Gate 1 Control',
    id: 'SEC-G1-04'
  }
]

export function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [authMethod, setAuthMethod] = useState('password') // 'password' | 'otp'
  const [password, setPassword] = useState('')
  const [role] = useState('Student')
  const [errorMessage, setErrorMessage] = useState('')
  const [successNotice, setSuccessNotice] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  // OTP flow states
  const [otpCode, setOtpCode] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    let interval = null
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [resendCooldown])

  useEffect(() => {
    clearStaleMsalInteractionStatus()
  }, [])

  // 1. One-Click Authentic Microsoft 365 / Outlook Sign-In
  const handleOutlookSignIn = async () => {
    setErrorMessage('')
    setSuccessNotice('')
    setIsVerifying(true)

    try {
      const result = await loginWithOutlook()
      if (result && result.userProfile) {
        setSuccessNotice(`Signed in as ${result.userProfile.name}`)
        try {
          await authApi.outlookLogin(result.userProfile.email, result.userProfile.role)
        } catch {
          // Sync fallback
        }
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(result.userProfile)
        }
      }
    } catch (err) {
      if (err.code === 'USER_CANCELLED') {
        setErrorMessage('Microsoft sign-in was closed before completion.')
      } else if (err.code === 'NON_INSTITUTIONAL_DOMAIN') {
        setErrorMessage(err.message)
      } else if (err.code === 'AZURE_NOT_CONFIGURED' || err.message === 'AZURE_NOT_CONFIGURED') {
        setErrorMessage('Azure Entra ID client ID is not configured. Add VITE_AZURE_CLIENT_ID to .env.local or sign in with University Password / OTP.')
      } else if (err.message && err.message.includes('AADSTS50011')) {
        setErrorMessage('Azure Redirect URI mismatch. Ensure http://localhost:5173/ is registered as SPA in Azure.')
      } else {
        setErrorMessage(err.message || 'Outlook authentication could not be completed.')
      }
    } finally {
      setIsVerifying(false)
    }
  }

  // 2. Standard Institutional Password Sign-In
  const handlePasswordSubmit = async (e) => {
    if (e) e.preventDefault()
    setErrorMessage('')
    setSuccessNotice('')

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setErrorMessage('Please enter your university email address.')
      return
    }

    if (!trimmedEmail.endsWith('@coeptech.ac.in') && !trimmedEmail.endsWith('@coep.ac.in')) {
      setErrorMessage('Please use your official @coeptech.ac.in or @coep.ac.in university email.')
      return
    }

    if (!password.trim()) {
      setErrorMessage('Password cannot be blank.')
      return
    }

    setIsVerifying(true)

    // Check predefined institutional accounts
    const matchedAccount = OFFICIAL_COEP_ACCOUNTS.find((acc) => acc.email === trimmedEmail)
    if (matchedAccount) {
      if (password !== matchedAccount.password) {
        setIsVerifying(false)
        setErrorMessage('Incorrect password. Please verify your credentials.')
        return
      }

      const userProfile = {
        id: matchedAccount.id,
        name: matchedAccount.name,
        email: matchedAccount.email,
        role: matchedAccount.role,
        department: matchedAccount.department,
        authProvider: 'password',
        authenticatedAt: new Date().toISOString()
      }

      try {
        await authApi.login(trimmedEmail, password, matchedAccount.role)
      } catch {
        // Fallback
      }

      setTimeout(() => {
        setIsVerifying(false)
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(userProfile)
        }
      }, 350)
      return
    }

    // Other valid campus users
    try {
      const res = await authApi.login(trimmedEmail, password, role)
      const userProfile = res?.user || {
        id: `COEP-${Math.floor(1000 + Math.random() * 9000)}`,
        name: trimmedEmail.split('@')[0],
        email: trimmedEmail,
        role: trimmedEmail.includes('admin') ? 'Administrator' : trimmedEmail.includes('faculty') ? 'Faculty' : trimmedEmail.includes('security') ? 'Security Guard' : trimmedEmail.includes('mindspark') || trimmedEmail.includes('club') ? 'Club Lead' : role,
        department: trimmedEmail.includes('security') ? 'Campus Security & Gate 1 Control' : 'COEP Technological University',
        authProvider: 'password',
        authenticatedAt: new Date().toISOString()
      }

      setTimeout(() => {
        setIsVerifying(false)
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(userProfile)
        }
      }, 350)
    } catch (err) {
      setIsVerifying(false)
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.')
    }
  }

  // 3. Dispatch 6-digit OTP
  const handleSendOtp = async () => {
    setErrorMessage('')
    const trimmedEmail = email.trim().toLowerCase()

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
    if (!trimmedEmail || !isValidEmail) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setIsVerifying(true)
    try {
      const res = await authApi.sendOtp(trimmedEmail)
      setIsOtpSent(true)
      setResendCooldown(45)
      setSuccessNotice(res.message || `Verification code sent to ${trimmedEmail}`)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch verification email.')
    } finally {
      setIsVerifying(false)
    }
  }

  // 4. Verify entered 6-digit OTP code
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault()
    setErrorMessage('')

    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setErrorMessage('Please enter the full 6-digit verification code.')
      return
    }

    setIsVerifying(true)
    try {
      const res = await authApi.verifyOtp(email.trim().toLowerCase(), otpCode.trim(), role)
      if (res.user && typeof onLoginSuccess === 'function') {
        onLoginSuccess(res.user)
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired verification code.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-xl transition-all">
      {/* Header */}
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          COEP Campus Sign In
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Access campus venues, auditoriums, and reservation records.
        </p>
      </div>

      {/* Prominent "Sign in with Outlook" SSO Action Button */}
      <div className="mb-5">
        <button
          type="button"
          onClick={handleOutlookSignIn}
          disabled={isVerifying}
          className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer disabled:opacity-75 border border-transparent dark:border-slate-700"
        >
          <div className="flex items-center gap-2">
            <MicrosoftLogo className="w-4 h-4" />
            <OutlookLogo className="w-4 h-4" />
          </div>
          <span>{isVerifying ? 'Authenticating with Microsoft...' : 'Sign in with Microsoft 365 / Outlook'}</span>
        </button>
      </div>

      {/* Visual Divider */}
      <div className="relative my-5 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
        </div>
        <span className="relative px-3 bg-white dark:bg-slate-900 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          or sign in with credentials
        </span>
      </div>

      {/* Auth Method Toggle */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setAuthMethod('password')
            setErrorMessage('')
          }}
          className={`py-2 rounded-lg transition-all cursor-pointer ${authMethod === 'password'
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          University Password
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMethod('otp')
            setErrorMessage('')
          }}
          className={`py-2 rounded-lg transition-all cursor-pointer ${authMethod === 'otp'
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          Email OTP
        </button>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium"
        >
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Notification Alert */}
      {successNotice && !errorMessage && (
        <div
          role="status"
          className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* =========================================================================
          FLOW A: PASSWORD AUTHENTICATION (DEFAULT)
          ========================================================================= */}
      {authMethod === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password-university-email"
              className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              University Email
            </label>
            <input
              id="password-university-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              placeholder="name@coeptech.ac.in"
              disabled={isVerifying}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="password-input"
              className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              placeholder="Enter password"
              disabled={isVerifying}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full h-11 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
          >
            {isVerifying ? 'Authenticating...' : 'Sign In with University Account'}
          </button>
        </form>
      )}

      {/* =========================================================================
          FLOW B: EMAIL OTP VERIFICATION
          ========================================================================= */}
      {authMethod === 'otp' && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="otp-university-email"
              className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Institutional Email
            </label>
            <div className="relative">
              <input
                id="otp-university-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errorMessage) setErrorMessage('')
                }}
                placeholder="name@coeptech.ac.in"
                disabled={isVerifying || isOtpSent}
                className="w-full h-11 px-3 pl-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {isOtpSent && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpSent(false)
                    setOtpCode('')
                    setSuccessNotice('')
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  Change
                </button>
              )}
            </div>
          </div>

          {!isOtpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isVerifying}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching code...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Send Verification Code</span>
                </>
              )}
            </button>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="six-digit-otp"
                  className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  6-Digit Verification Code
                </label>
                <input
                  id="six-digit-otp"
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit code"
                  autoFocus
                  disabled={isVerifying}
                  className="w-full h-12 text-center tracking-[0.3em] font-mono text-base font-extrabold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying code...</span>
                  </>
                ) : (
                  <span>Verify Code & Enter</span>
                )}
              </button>

              <div className="text-center text-xs">
                {resendCooldown > 0 ? (
                  <span className="text-slate-400 dark:text-slate-500">Resend code in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                  >
                    Resend verification code
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

