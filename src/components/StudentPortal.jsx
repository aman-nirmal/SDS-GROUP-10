import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  Plus,
  QrCode,
  Trash2,
  XCircle,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  ExternalLink,
  ShieldCheck,
  Check,
  X
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'
import { INITIAL_BOOKINGS } from './AdminPanel'

const INITIAL_STUDENT_PASSES = [
  {
    id: 'STU-BK-902',
    venue: 'Central Library Discussion Room B',
    purpose: 'Final Year Capstone Project Coding',
    date: '2026-10-24',
    timeSlot: '02:00 PM - 04:00 PM',
    attendees: 4,
    status: 'Approved',
    digitalPassCode: 'COEP-LIB-8849-PASS'
  },
  {
    id: 'STU-BK-903',
    venue: 'Turing Computer Lab (Workstation 14-16)',
    purpose: 'Distributed Systems Practical Lab Simulation',
    date: '2026-10-27',
    timeSlot: '10:00 AM - 12:00 PM',
    attendees: 2,
    status: 'Approved',
    digitalPassCode: 'COEP-LAB-4412-PASS'
  }
]

export default function StudentPortal({
  currentUser,
  onNavigateLogin,
  campusBookings = [],
  onExploreVenues,
  onUpdateStatus
}) {
  const [activeTab, setActiveTab] = useState('venues') // 'venues' | 'passes'
  const [passes, setPasses] = useState(() => {
    try {
      const stored = localStorage.getItem('locus_student_study_passes')
      return stored ? JSON.parse(stored) : INITIAL_STUDENT_PASSES
    } catch {
      return INITIAL_STUDENT_PASSES
    }
  })

  // Persist study passes
  useEffect(() => {
    try {
      localStorage.setItem('locus_student_study_passes', JSON.stringify(passes))
    } catch {
      // ignore
    }
  }, [passes])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPass, setSelectedPass] = useState(null)
  const [venueFilter, setVenueFilter] = useState('All') // 'All' | 'Pending' | 'Confirmed' | 'Cancelled'
  const [notification, setNotification] = useState(null)

  const [form, setForm] = useState({
    venue: 'Central Library Discussion Room A',
    purpose: '',
    date: '2026-10-29',
    timeSlot: '02:00 PM - 04:00 PM',
    attendees: 2
  })

  const showToast = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3500)
  }

  // Filter campus venue bookings belonging to this student
  const studentVenueBookings = campusBookings.filter((b) => {
    if (!currentUser) return true
    return (
      b.applicantEmail === currentUser.email ||
      b.applicantName?.toLowerCase() === currentUser.name?.toLowerCase() ||
      b.applicantRole === 'Student' ||
      b.id === 'COEP-BK-8954'
    )
  })

  const filteredVenueBookings = studentVenueBookings.filter((b) => {
    if (venueFilter === 'All') return true
    if (venueFilter === 'Pending') return b.status === 'Pending' || b.status === 'Pending Sanction'
    return b.status === venueFilter
  })

  // Create new study pass
  const handleCreatePass = (e) => {
    e.preventDefault()
    if (!form.purpose.trim()) return

    const randomNum = Math.floor(1000 + Math.random() * 9000)
    const newPass = {
      id: `STU-BK-${Math.floor(100 + Math.random() * 900)}`,
      venue: form.venue,
      purpose: form.purpose,
      date: form.date,
      timeSlot: form.timeSlot,
      attendees: Number(form.attendees),
      status: 'Approved',
      digitalPassCode: `COEP-STU-${randomNum}-PASS`
    }

    setPasses([newPass, ...passes])
    setIsModalOpen(false)
    setForm({
      venue: 'Central Library Discussion Room A',
      purpose: '',
      date: '2026-10-29',
      timeSlot: '02:00 PM - 04:00 PM',
      attendees: 2
    })
    showToast(`Pass issued for ${form.venue}`)
  }

  const handleDeletePass = (id) => {
    setPasses(passes.filter((p) => p.id !== id))
    showToast('Pass cancelled.', 'warning')
  }

  const handleCancelVenueBooking = (bookingId) => {
    if (onUpdateStatus) {
      onUpdateStatus(bookingId, 'Cancelled')
      showToast(`Reservation ${bookingId} cancelled.`, 'warning')
    }
  }

  return (
    <ProtectedGate
      allowedRoles={['Student', 'Administrator']}
      portalName="My Bookings"
      portalDescription="View your room reservations, status updates, and digital passes."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
    >
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors">
        {/* Toast Notification */}
        {notification && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl animate-in slide-in-from-top duration-200 border border-slate-700">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                My Bookings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                View and manage your venue bookings, approval status, and passes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onExploreVenues}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Book a Venue</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Get a Pass</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('venues')}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'venues'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              Venue Bookings ({studentVenueBookings.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('passes')}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'passes'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              Passes ({passes.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Campus Venue Reservations */}
        {activeTab === 'venues' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Venue Bookings ({filteredVenueBookings.length})
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Check the status of your classroom, seminar hall, and auditorium requests.
                  </p>
                </div>

                {/* Filter pills */}
                <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
                  {['All', 'Pending', 'Confirmed', 'Cancelled'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setVenueFilter(status)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                        venueFilter === status
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {status === 'Confirmed' ? 'Approved' : status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Venue Bookings Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Booking ID</th>
                      <th className="py-3 px-4">Venue</th>
                      <th className="py-3 px-4">Purpose</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Faculty In-Charge</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredVenueBookings.map((b) => {
                      const isPending = b.status === 'Pending' || b.status === 'Pending Sanction'
                      const isConfirmed = b.status === 'Confirmed' || b.status === 'Approved'
                      const isCancelled = b.status === 'Cancelled' || b.status === 'Rejected'

                      return (
                        <tr key={b.id || b.ref} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {b.id || b.ref}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{b.venueName || b.venue}</div>
                            <div className="text-[11px] text-slate-400">{b.attendees || b.capacity || 50} Attendees</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate" title={b.purpose}>
                            {b.purpose}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800 dark:text-slate-200">{b.bookingDate || b.date}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">{b.timeSlot || b.slot}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800 dark:text-slate-200">{b.department || 'COEP Tech'}</div>
                            <div className="text-[11px] text-blue-600 dark:text-blue-400">{b.facultyInCharge || 'Faculty Review'}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                isConfirmed
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : isPending
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              }`}
                            >
                              {isConfirmed && <Check className="w-3 h-3" />}
                              {isPending && <Clock className="w-3 h-3" />}
                              {isCancelled && <X className="w-3 h-3" />}
                              {isPending ? 'Pending Approval' : isConfirmed ? 'Approved' : 'Cancelled'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {!isCancelled ? (
                              <button
                                type="button"
                                onClick={() => handleCancelVenueBooking(b.id || b.ref)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Cancel Reservation"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400">Cancelled</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    {filteredVenueBookings.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p className="font-semibold text-slate-600 dark:text-slate-300">No venue reservations found.</p>
                          <p className="text-xs text-slate-400 mt-1 mb-4">
                            Explore available classrooms, seminar halls, and auditoriums to submit a booking.
                          </p>
                          <button
                            type="button"
                            onClick={onExploreVenues}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Browse Campus Venues</span>
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Passes */}
        {activeTab === 'passes' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Passes ({passes.length})</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Show your pass or QR code at security checkpoints, desk, or turnstiles for entry.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Get a Pass</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {passes.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 sm:p-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{b.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {b.status}
                        </span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{b.venue}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{b.purpose}</h3>

                      <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500 dark:text-slate-400">
                        <span>Date: <strong className="text-slate-700 dark:text-slate-200">{b.date}</strong></span>
                        <span>Slot: <strong className="text-slate-700 dark:text-slate-200">{b.timeSlot}</strong></span>
                        <span>Team: <strong className="text-slate-700 dark:text-slate-200">{b.attendees} persons</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedPass(b)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs border border-transparent dark:border-slate-700"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View Pass</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePass(b.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Cancel Booking"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {passes.length === 0 && (
                  <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    <QrCode className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">You have no active passes.</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Get entry passes for labs, workstations, discussion rooms, or campus facilities.</p>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Get a Pass</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Get Campus Pass */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Get Campus Pass</h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePass} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                    Facility / Space
                  </label>
                  <select
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Central Library Discussion Room A">Central Library Discussion Room A (Ground Floor)</option>
                    <option value="Central Library Discussion Room B">Central Library Discussion Room B (1st Floor)</option>
                    <option value="Turing Computer Lab (Workstation 1-10)">Turing Computer Lab (Workstation 1-10)</option>
                    <option value="Electronics Hardware Prototyping Bench 3">Electronics Hardware Prototyping Bench 3</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                    Purpose
                  </label>
                  <input
                    type="text"
                    required
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    placeholder="e.g. Capstone project coding, lab practical, team meeting"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                      Time Slot
                    </label>
                    <select
                      value={form.timeSlot}
                      onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                      <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                    Team Members
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={form.attendees}
                    onChange={(e) => setForm({ ...form, attendees: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-sm transition-colors"
                  >
                    Issue Pass
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Digital Pass Slip */}
        {selectedPass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <QrCode className="w-7 h-7" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {selectedPass.status} Gate Pass
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">{selectedPass.venue}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedPass.purpose}</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-left space-y-1 font-mono text-slate-700 dark:text-slate-300">
                <div>Pass Code: <strong className="text-blue-700 dark:text-blue-400">{selectedPass.digitalPassCode}</strong></div>
                <div>Slot: {selectedPass.date} • {selectedPass.timeSlot}</div>
                <div>Team: {selectedPass.attendees} Persons</div>
                <div>Pass Holder: {currentUser?.name || 'Verified Student'}</div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPass(null)}
                className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors border border-transparent dark:border-slate-700"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedGate>
  )
}
