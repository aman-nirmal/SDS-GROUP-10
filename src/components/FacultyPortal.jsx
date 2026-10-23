import React, { useState } from 'react'
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  XCircle,
  FileCheck,
  Building,
  Users
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'

const INITIAL_FACULTY_BOOKINGS = [
  {
    id: 'FAC-BK-101',
    venue: 'ND01 (North Drawing Hall)',
    purpose: 'End-Semester Department Research & Capstone Viva',
    date: '2026-10-28',
    timeSlot: '09:00 AM - 11:00 AM',
    department: 'Computer Engineering',
    attendees: 120,
    status: 'Confirmed',
    equipment: ['Overhead Projector', 'Mic PA', 'Central AC']
  },
  {
    id: 'FAC-BK-102',
    venue: 'Computer Department Seminar Hall',
    purpose: 'Guest Lecture: Scalable Deep Learning Architectures',
    date: '2026-10-31',
    timeSlot: '02:00 PM - 04:00 PM',
    department: 'Computer Engineering',
    attendees: 80,
    status: 'Confirmed',
    equipment: ['Smart Board', 'Audio System', 'WiFi 6']
  },
  {
    id: 'FAC-BK-103',
    venue: 'NC24 Classroom',
    purpose: 'Special Remedial Lecture: Distributed Operating Systems',
    date: '2026-11-04',
    timeSlot: '04:00 PM - 06:00 PM',
    department: 'Computer Engineering',
    attendees: 60,
    status: 'Pending Verification',
    equipment: ['Projector', 'Whiteboard']
  }
]

export default function FacultyPortal({ currentUser, onNavigateLogin, onQuickLogin }) {
  const [bookings, setBookings] = useState(INITIAL_FACULTY_BOOKINGS)
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [notification, setNotification] = useState('')

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    venue: 'ND01 (North Drawing Hall)',
    purpose: '',
    date: '2026-10-29',
    timeSlot: '10:00 AM - 12:00 PM',
    attendees: 75,
    equipment: 'Projector + Audio System'
  })

  // Simulated AI Conflict Warning
  const isConflictDetected = bookingForm.date === '2026-10-25' && bookingForm.venue.includes('ND01')

  const showNotification = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 3500)
  }

  const handleCreateBooking = (e) => {
    e.preventDefault()
    if (!bookingForm.purpose.trim()) {
      alert('Please specify the academic purpose for this reservation.')
      return
    }

    const newBooking = {
      id: `FAC-BK-${Math.floor(100 + Math.random() * 900)}`,
      venue: bookingForm.venue,
      purpose: bookingForm.purpose,
      date: bookingForm.date,
      timeSlot: bookingForm.timeSlot,
      department: currentUser?.department || 'Computer Engineering',
      attendees: Number(bookingForm.attendees),
      status: 'Confirmed',
      equipment: [bookingForm.equipment]
    }

    setBookings([newBooking, ...bookings])
    showNotification(`Priority academic reservation ${newBooking.id} created successfully!`)
    setIsBookModalOpen(false)
    setBookingForm({
      venue: 'ND01 (North Drawing Hall)',
      purpose: '',
      date: '2026-10-29',
      timeSlot: '10:00 AM - 12:00 PM',
      attendees: 75,
      equipment: 'Projector + Audio System'
    })
  }

  const handleCancelBooking = (id) => {
    if (window.confirm('Are you sure you want to cancel this scheduled academic reservation?')) {
      setBookings(bookings.map((b) => (b.id === id ? { ...b, status: 'Cancelled' } : b)))
      showNotification('Academic session reservation cancelled.')
    }
  }

  return (
    <ProtectedGate
      allowedRoles={['Faculty']}
      portalName="COEP Faculty Academic Venue Portal"
      portalDescription="Priority venue reservations, smart classroom allocation, and examination hall scheduling for verified academic staff."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
      onQuickLogin={onQuickLogin}
    >
      <div className="w-full min-h-screen bg-slate-50 text-slate-900 pb-20">
        {/* Faculty Header Banner */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                    Faculty Workspace
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Priority Academic Allocation</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  Welcome, {currentUser?.name || 'Professor'}
                </h1>
                <p className="text-xs text-slate-500">
                  {currentUser?.department || 'Department of Computer Engineering'} • COEP Technological University
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBookModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer self-end sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Reserve Academic Space</span>
            </button>
          </div>
        </section>

        {/* Floating Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-800 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          {/* Quick Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Active Reservations</span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {bookings.filter((b) => b.status === 'Confirmed').length} Sessions
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Scheduled in campus timetable</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Priority Status</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-600">
                Fast-Track Active
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Direct booking bypass for lectures</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>AI Timetable Validation</span>
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-purple-600">
                Conflict Guardian
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Autonomous syllabus slot matching</p>
            </div>
          </section>

          {/* Bookings Table / List */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">My Reserved Teaching & Review Halls</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scheduled lectures, external viva reviews, and departmental symposiums.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{booking.id}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          booking.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : booking.status === 'Cancelled'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {booking.status}
                      </span>
                      <span className="text-xs font-bold text-blue-600">{booking.venue}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{booking.purpose}</h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>Date: <strong>{booking.date}</strong></span>
                      <span>Time: <strong>{booking.timeSlot}</strong></span>
                      <span>Expected: <strong>{booking.attendees} students</strong></span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {booking.equipment.map((eq, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px]">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    {booking.status === 'Confirmed' && (
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancel Slot
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Modal: New Academic Space Reservation */}
        {isBookModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-extrabold text-slate-900">Priority Academic Booking</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    Academic Venue
                  </label>
                  <select
                    value={bookingForm.venue}
                    onChange={(e) => setBookingForm({ ...bookingForm, venue: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="ND01 (North Drawing Hall)">ND01 (North Drawing Hall - Capacity: 180)</option>
                    <option value="NC24 Classroom">NC24 Classroom (Capacity: 80)</option>
                    <option value="Computer Department Seminar Hall">Computer Dept Seminar Hall (Capacity: 120)</option>
                    <option value="BHAU Institute Main Auditorium">BHAU Main Auditorium (Capacity: 250)</option>
                    <option value="SC10 Classroom Complex">SC10 Classroom (Capacity: 70)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    Lecture / Session Title
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.purpose}
                    onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
                    placeholder="e.g. Distributed Operating Systems - M.Tech Research Presentation"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                      Time Slot
                    </label>
                    <select
                      value={bookingForm.timeSlot}
                      onChange={(e) => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                      <option value="11:15 AM - 01:15 PM">11:15 AM - 01:15 PM</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                      Expected Students
                    </label>
                    <input
                      type="number"
                      value={bookingForm.attendees}
                      onChange={(e) => setBookingForm({ ...bookingForm, attendees: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                      Required Equipment
                    </label>
                    <select
                      value={bookingForm.equipment}
                      onChange={(e) => setBookingForm({ ...bookingForm, equipment: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Projector + Audio System">Projector + Audio System</option>
                      <option value="Smart Interactive Screen">Smart Interactive Screen</option>
                      <option value="Dual Microphones + Green Room">Dual Microphones + Green Room</option>
                    </select>
                  </div>
                </div>

                {/* AI Conflict Warning */}
                {isConflictDetected && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>AI Schedule Alert:</strong> MindSpark Hackathon is scheduled in ND01 on 2026-10-25. Please choose an alternate date or select Computer Dept Seminar Hall.
                    </span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBookModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs"
                  >
                    Confirm Academic Reservation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedGate>
  )
}
