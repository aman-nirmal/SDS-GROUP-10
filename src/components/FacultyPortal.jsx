import React, { useState, useEffect } from 'react'
import {
  GraduationCap,
  Plus,
  Trash2,
  XCircle
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'
import { bookingsApi } from '../lib/bookingsApi'

const INITIAL_FACULTY_BOOKINGS = [
  {
    id: 'FAC-BK-101',
    venue: 'ND01 (North Drawing Hall)',
    purpose: 'End-Semester Department Research & Capstone Viva',
    date: '2026-10-28',
    timeSlot: '09:00 AM - 11:00 AM',
    attendees: 120,
    status: 'Confirmed'
  },
  {
    id: 'FAC-BK-102',
    venue: 'Computer Department Seminar Hall',
    purpose: 'Guest Lecture: Scalable Deep Learning Architectures',
    date: '2026-10-31',
    timeSlot: '02:00 PM - 04:00 PM',
    attendees: 80,
    status: 'Confirmed'
  },
  {
    id: 'FAC-BK-103',
    venue: 'NC24 Classroom',
    purpose: 'Special Remedial Lecture: Distributed Operating Systems',
    date: '2026-11-04',
    timeSlot: '04:00 PM - 06:00 PM',
    attendees: 60,
    status: 'Pending'
  }
]

export default function FacultyPortal({ currentUser, onNavigateLogin }) {
  const [bookings, setBookings] = useState(INITIAL_FACULTY_BOOKINGS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    venue: 'ND01 (North Drawing Hall)',
    purpose: '',
    date: '2026-10-29',
    timeSlot: '10:00 AM - 12:00 PM',
    attendees: 60
  })

  useEffect(() => {
    async function loadFacultyBookings() {
      if (currentUser?.email) {
        try {
          const data = await bookingsApi.fetchUserBookings(currentUser)
          if (data && data.length > 0) {
            setBookings(data)
          }
        } catch (err) {
          console.warn('[FacultyPortal] Could not load bookings from Supabase:', err)
        }
      }
    }
    loadFacultyBookings()
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
        status: 'Confirmed'
      }, currentUser)

      setBookings((prev) => [saved, ...prev.filter((b) => b.id !== saved.id && b.ref !== saved.ref)])
      setIsModalOpen(false)
      setForm({
        venue: 'ND01 (North Drawing Hall)',
        purpose: '',
        date: '2026-10-29',
        timeSlot: '10:00 AM - 12:00 PM',
        attendees: 60
      })
    } catch (err) {
      alert(err.message || 'Failed to reserve academic hall.')
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
      allowedRoles={['Faculty', 'Administrator']}
      portalName="Faculty Academic Portal"
      portalDescription="Classroom and lecture hall scheduling for COEP faculty members."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
    >
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Faculty Workspace</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Academic Hall Reservations
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {currentUser?.name || 'Dr. V. K. Kulkarni'} • {currentUser?.department || 'Computer Engineering'}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Lecture / Viva</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Scheduled Sessions ({bookings.length})</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Classrooms and departmental seminar rooms reserved for academic evaluation.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Venue</th>
                    <th className="py-3 px-4">Academic Session</th>
                    <th className="py-3 px-4">Date & Slot</th>
                    <th className="py-3 px-4">Batch Size</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {bookings.map((b) => (
                    <tr key={b.id || b.ref} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{b.id || b.ref}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{b.venue || b.venueName}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">{b.purpose}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        <div>{b.date || b.bookingDate}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">{b.timeSlot || b.slot}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">{b.attendees || b.capacity || 1} Students</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'Confirmed' || b.status === 'Approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'Confirmed' || b.status === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(b.id || b.ref)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Cancel Reservation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                        No scheduled academic reservations found. Click "Schedule Lecture / Viva" to allocate a venue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Schedule Lecture or Department Viva</h3>
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
                    Select Lecture Hall / Room
                  </label>
                  <select
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  >
                    <option value="Mini Auditorium">Mini Auditorium (Academics Complex - 275 Seats)</option>
                    <option value="Cognizant Lab">Cognizant Lab (Computer Dept - 400 Seats)</option>
                    <option value="ND01 (North Drawing Hall)">ND01 (North Drawing Hall)</option>
                    <option value="Computer Department Seminar Hall">Computer Department Seminar Hall</option>
                    <option value="NC24 Classroom">NC24 Classroom</option>
                    <option value="Electrical Machines Lab A">Electrical Machines Lab A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Session Purpose / Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    placeholder="e.g. Distributed Systems Final Evaluation"
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
                      Time Slot
                    </label>
                    <select
                      value={form.timeSlot}
                      onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                      className="w-full h-9 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                    >
                      <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Expected Class Capacity
                  </label>
                  <input
                    type="number"
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
      </div>
    </ProtectedGate>
  )
}
