import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  Plus,
  QrCode,
  Trash2,
  XCircle
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'
import { bookingsApi } from '../lib/bookingsApi'

const INITIAL_STUDENT_BOOKINGS = [
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

export default function StudentPortal({ currentUser, onNavigateLogin }) {
  const [bookings, setBookings] = useState(INITIAL_STUDENT_BOOKINGS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPass, setSelectedPass] = useState(null)
  const [form, setForm] = useState({
    venue: 'Central Library Discussion Room A',
    purpose: '',
    date: '2026-10-25',
    timeSlot: '02:00 PM - 04:00 PM',
    attendees: 2
  })

  useEffect(() => {
    async function loadStudentBookings() {
      if (currentUser?.email) {
        try {
          const data = await bookingsApi.fetchUserBookings(currentUser)
          if (data && data.length > 0) {
            setBookings(data)
          }
        } catch (err) {
          console.warn('[StudentPortal] Could not load bookings from Supabase:', err)
        }
      }
    }
    loadStudentBookings()
  }, [currentUser])

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    if (!form.purpose.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const saved = await bookingsApi.createBooking({
        venueName: form.venue,
        purpose: form.purpose,
        date: form.date,
        slot: form.timeSlot,
        capacity: Number(form.attendees),
        status: 'Approved'
      }, currentUser)

      setBookings((prev) => [saved, ...prev.filter((b) => b.id !== saved.id && b.ref !== saved.ref)])
      setIsModalOpen(false)
      setForm({
        venue: 'Central Library Discussion Room A',
        purpose: '',
        date: '2026-10-25',
        timeSlot: '02:00 PM - 04:00 PM',
        attendees: 2
      })
    } catch (err) {
      alert(err.message || 'Failed to reserve study space.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await bookingsApi.cancelBooking(id, currentUser)
    } catch (err) {
      console.warn('Could not cancel booking in database:', err)
    }
    setBookings((prev) => prev.filter((b) => b.id !== id && b.ref !== id))
  }

  return (
    <ProtectedGate
      allowedRoles={['Student', 'Administrator']}
      portalName="Student Study & Lab Portal"
      portalDescription="Reserve campus library discussion rooms, computing labs, and generate digital gate access passes."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
    >
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Student Workspace</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Study Spaces & Digital Passes
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {currentUser?.name || 'Aman Nirmal'} • {currentUser?.department || 'Computer Engineering'}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Book Discussion Room</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">My Study Room Passes ({bookings.length})</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Digital permits for library study cubicles and computer lab workstations.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {bookings.map((b) => (
                <div key={b.id || b.ref} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{b.id || b.ref}</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{b.venue || b.venueName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{b.purpose}</p>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 flex flex-wrap gap-x-3">
                      <span>{b.date || b.bookingDate}</span>
                      <span>•</span>
                      <span>{b.timeSlot || b.slot}</span>
                      <span>•</span>
                      <span>{b.attendees || b.capacity || 1} Person(s)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedPass(b)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Pass</span>
                    </button>
                    <button
                      onClick={() => handleDelete(b.id || b.ref)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      title="Cancel Booking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {bookings.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                  No active study passes found. Click "Book Discussion Room" to reserve your spot.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Booking Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Reserve Campus Study Space</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBooking} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Select Study Venue
                  </label>
                  <select
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  >
                    <option value="Central Library Discussion Room A">Central Library Discussion Room A</option>
                    <option value="Central Library Discussion Room B">Central Library Discussion Room B</option>
                    <option value="Turing Computer Lab (Workstation 14-16)">Turing Computer Lab (Workstation 14-16)</option>
                    <option value="Mechanical Dept CAD/CAM Terminal 04">Mechanical Dept CAD/CAM Terminal 04</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Academic Purpose / Topic *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    placeholder="e.g. Distributed Systems Lab Prep"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Slot
                    </label>
                    <select
                      value={form.timeSlot}
                      onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                      className="w-full h-9 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                    >
                      <option value="08:30 AM - 10:30 AM">08:30 AM - 10:30 AM</option>
                      <option value="10:30 AM - 12:30 PM">10:30 AM - 12:30 PM</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Student Group Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={form.attendees}
                    onChange={(e) => setForm({ ...form, attendees: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold transition-colors"
                  >
                    {isSubmitting ? 'Reserving...' : 'Confirm Reservation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Digital QR Pass Modal */}
        {selectedPass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">
                Official Access Permit
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                {selectedPass.venue || selectedPass.venueName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{selectedPass.purpose}</p>

              {/* Digital Pass Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pass Code:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{selectedPass.digitalPassCode || selectedPass.passId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Student:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser?.name || selectedPass.applicantName || 'Aman Nirmal'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Slot:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedPass.date || selectedPass.bookingDate} ({selectedPass.timeSlot || selectedPass.slot})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Valid Entry</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPass(null)}
                className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Close Pass
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedGate>
  )
}
