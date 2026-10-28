import React, { useState, useEffect } from 'react'
import {
  Trophy,
  Plus,
  Trash2,
  XCircle
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'
import { bookingsApi, OFFICIAL_CLUB_MAPPINGS } from '../lib/bookingsApi'

const INITIAL_CLUB_BOOKINGS = [
  {
    id: 'CLB-BK-401',
    venue: 'BHAU Main Auditorium',
    title: "MindSpark '26: National Tech Symposium Keynote",
    date: '2026-10-28',
    timeSlot: '08:00 AM - 06:00 PM',
    attendees: 280,
    status: 'Approved',
    club_name: 'MindSpark'
  },
  {
    id: 'CLB-BK-402',
    venue: 'Historic Boat Club & Regatta Grounds',
    title: 'ZEST Annual Inter-Engineering Sports Carnival Inauguration',
    date: '2026-11-05',
    timeSlot: '07:00 AM - 01:00 PM',
    attendees: 500,
    status: 'Under Review',
    club_name: 'ZEST'
  },
  {
    id: 'CLB-BK-403',
    venue: 'North Drawing Hall (ND01)',
    title: 'Robot Study Circle: National Autonomous Bot Arena',
    date: '2026-11-12',
    timeSlot: '10:00 AM - 04:00 PM',
    attendees: 150,
    status: 'Approved',
    club_name: 'Robot Study Circle (RSC)'
  }
]

export default function ClubPortal({ currentUser, onNavigateLogin }) {
  const [bookings, setBookings] = useState(INITIAL_CLUB_BOOKINGS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    venue: 'BHAU Main Auditorium',
    title: '',
    date: '2026-11-10',
    timeSlot: '09:00 AM - 05:00 PM',
    attendees: 200,
    requirements: 'Stage PA System + Backup Generator'
  })

  const userEmail = currentUser?.email?.trim().toLowerCase()
  const authorizedClub = currentUser?.club_name || (userEmail ? OFFICIAL_CLUB_MAPPINGS[userEmail] : null) || 'MindSpark'

  useEffect(() => {
    async function loadClubBookings() {
      if (currentUser?.email) {
        try {
          const userWithClub = {
            ...currentUser,
            club_name: authorizedClub
          }
          const data = await bookingsApi.fetchUserBookings(userWithClub)
          if (data && data.length > 0) {
            setBookings(data)
          }
        } catch (err) {
          console.warn('[ClubPortal] Could not load bookings from Supabase:', err)
        }
      }
    }
    loadClubBookings()
  }, [currentUser, authorizedClub])

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const saved = await bookingsApi.createBooking({
        venueName: form.venue,
        purpose: form.title,
        date: form.date,
        slot: form.timeSlot,
        capacity: Number(form.attendees),
        specialRequirements: form.requirements,
        clubName: authorizedClub,
        status: 'Under Review'
      }, currentUser)

      setBookings((prev) => [saved, ...prev.filter((b) => b.id !== saved.id && b.ref !== saved.ref)])
      setIsModalOpen(false)
      setForm({
        venue: 'BHAU Main Auditorium',
        title: '',
        date: '2026-11-10',
        timeSlot: '09:00 AM - 05:00 PM',
        attendees: 200,
        requirements: 'Stage PA System + Backup Generator'
      })
    } catch (err) {
      alert(err.message || 'Failed to submit club reservation.')
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
      allowedRoles={['Club Lead', 'Administrator']}
      portalName="Club & Fest Management Portal"
      portalDescription="Reserve campus auditoriums, open-air theatres, and event venues for official Gymkhana student clubs."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
    >
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mb-2">
                <Trophy className="w-3.5 h-3.5" />
                <span>Club Secretariat: {authorizedClub}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Fest & Auditorium Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {currentUser?.name || 'Club Lead'} • {authorizedClub} ({currentUser?.department || 'Student Gymkhana'})
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Request Event Venue</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Registered Club Events ({bookings.length})</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Major festival allocations and auditorium reservations for {authorizedClub}.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Event Title</th>
                    <th className="py-3 px-4">Venue</th>
                    <th className="py-3 px-4">Date & Slot</th>
                    <th className="py-3 px-4">Expected Footfall</th>
                    <th className="py-3 px-4">Approval Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {bookings.map((b) => (
                    <tr key={b.id || b.ref} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">{b.id || b.ref}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{b.title || b.purpose}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">{b.venue || b.venueName}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        <div>{b.date || b.bookingDate}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">{b.timeSlot || b.slot}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">{b.attendees || b.capacity || 1} Attendees</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'Approved' || b.status === 'Confirmed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'Approved' || b.status === 'Confirmed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(b.id || b.ref)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Withdraw Application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                        No registered events for {authorizedClub}. Click "Request Event Venue" to submit an application.
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
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Submit Gymkhana Venue Requisition</h3>
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
                    Club Organization
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={authorizedClub}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Select Campus Auditorium / Grounds
                  </label>
                  <select
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  >
                    <option value="BHAU Main Auditorium">BHAU Main Auditorium</option>
                    <option value="Historic Boat Club & Regatta Grounds">Historic Boat Club & Regatta Grounds</option>
                    <option value="North Drawing Hall (ND01)">North Drawing Hall (ND01)</option>
                    <option value="Open Air Theatre (OAT)">Open Air Theatre (OAT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Official Event / Fest Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. MindSpark 2026 Keynote"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Event Date
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
                      <option value="08:00 AM - 06:00 PM">08:00 AM - 06:00 PM (Full Day)</option>
                      <option value="09:00 AM - 01:00 PM">09:00 AM - 01:00 PM (Morning Slot)</option>
                      <option value="02:00 PM - 08:00 PM">02:00 PM - 08:00 PM (Evening Slot)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Expected Total Attendees
                  </label>
                  <input
                    type="number"
                    value={form.attendees}
                    onChange={(e) => setForm({ ...form, attendees: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Special Facilities & Audio Setup
                  </label>
                  <input
                    type="text"
                    value={form.requirements}
                    onChange={(e) => setForm({ ...form, requirements: e.target.value })}
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
                    {isSubmitting ? 'Submitting...' : 'Submit Requisition'}
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
