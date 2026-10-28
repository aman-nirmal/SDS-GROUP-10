import React, { useState } from 'react'
import {
  Trophy,
  Plus,
  Trash2,
  XCircle,
  Calendar,
  Clock,
  Users,
  Check,
  Inbox
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'

const INITIAL_CLUB_BOOKINGS = [
  {
    id: 'CLB-BK-401',
    venue: 'BHAU Main Auditorium',
    title: "MindSpark '26: National Tech Symposium Keynote",
    date: '2026-10-28',
    timeSlot: '08:00 AM - 06:00 PM',
    attendees: 280,
    status: 'Approved'
  },
  {
    id: 'CLB-BK-402',
    venue: 'Historic Boat Club & Regatta Grounds',
    title: 'ZEST Annual Inter-Engineering Sports Carnival Inauguration',
    date: '2026-11-05',
    timeSlot: '07:00 AM - 01:00 PM',
    attendees: 500,
    status: 'Under Review'
  },
  {
    id: 'CLB-BK-403',
    venue: 'North Drawing Hall (ND01)',
    title: 'Robot Study Circle: National Autonomous Bot Arena',
    date: '2026-11-12',
    timeSlot: '10:00 AM - 04:00 PM',
    attendees: 150,
    status: 'Approved'
  }
]

export default function ClubPortal({ currentUser, onNavigateLogin }) {
  const [bookings, setBookings] = useState(INITIAL_CLUB_BOOKINGS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    venue: 'BHAU Main Auditorium',
    title: '',
    date: '2026-11-10',
    timeSlot: '09:00 AM - 05:00 PM',
    attendees: 200,
    requirements: 'Stage PA System + Backup Generator'
  })

  const handleCreateBooking = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return

    const newBooking = {
      id: `CLB-BK-${Math.floor(100 + Math.random() * 900)}`,
      venue: form.venue,
      title: form.title,
      date: form.date,
      timeSlot: form.timeSlot,
      attendees: Number(form.attendees),
      status: 'Under Review'
    }

    setBookings([newBooking, ...bookings])
    setIsModalOpen(false)
    setForm({
      venue: 'BHAU Main Auditorium',
      title: '',
      date: '2026-11-10',
      timeSlot: '09:00 AM - 05:00 PM',
      attendees: 200,
      requirements: 'Stage PA System + Backup Generator'
    })
  }

  const handleDelete = (id) => {
    setBookings(bookings.filter((b) => b.id !== id))
  }

  return (
    <ProtectedGate
      allowedRoles={['Club Lead', 'Administrator']}
      portalName="Club Bookings"
      portalDescription="Reserve auditoriums and event spaces for student clubs."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
    >
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Club Bookings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Reserve campus auditoriums, open-air theatres, and event spaces for student clubs.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Book Event Venue</span>
            </button>
          </div>
        </div>

        {/* Content Feed */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Registered Club Events ({bookings.length})</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Major festival allocations and auditorium reservations.</p>
            </div>
          </div>

          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start lg:items-center">
                  {/* Left Column (7 cols): Venue & Title */}
                  <div className="lg:col-span-7 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {b.id}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.attendees} attendees</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        {b.venue}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {b.title}
                      </p>
                    </div>
                  </div>

                  {/* Right Column (5 cols): Schedule, Status & Action */}
                  <div className="lg:col-span-5 flex flex-col lg:items-end justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 lg:pl-6 w-full">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                        b.status === 'Approved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {b.status === 'Approved' ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      <span>{b.status}</span>
                    </span>

                    <div className="text-left lg:text-right space-y-0.5">
                      <div className="flex items-center lg:justify-end gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{b.date}</span>
                      </div>
                      <div className="flex items-center lg:justify-end gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.timeSlot}</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(b.id)}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Withdraw Proposal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Withdraw Proposal</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {bookings.length === 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 py-12 px-6 text-center text-slate-400 shadow-2xs">
                <Trophy className="w-9 h-9 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No active event proposals</p>
                <p className="text-xs text-slate-400 mt-1 mb-4 max-w-sm mx-auto">
                  Submit a venue reservation for upcoming festivals, workshops, or club competitions.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Book Event Venue</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Submit Event Proposal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Submit Event Proposal</h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBooking} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                    Event Venue
                  </label>
                  <select
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="BHAU Main Auditorium">BHAU Main Auditorium (250 Seats)</option>
                    <option value="Open Air Theatre (OAT)">Open Air Theatre (OAT)</option>
                    <option value="Historic Boat Club & Regatta Grounds">Historic Boat Club & Regatta Grounds</option>
                    <option value="North Drawing Hall (ND01)">North Drawing Hall (ND01)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                    Event / Festival Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Impressions '26: Annual Inter-College Cultural Fest"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                      Event Date
                    </label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                      Time Slot
                    </label>
                    <select
                      value={form.timeSlot}
                      onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="08:00 AM - 01:00 PM">08:00 AM - 01:00 PM</option>
                      <option value="01:00 PM - 06:00 PM">01:00 PM - 06:00 PM</option>
                      <option value="06:00 PM - 10:00 PM">06:00 PM - 10:00 PM</option>
                      <option value="Full Day (08:00 AM - 08:00 PM)">Full Day (08:00 AM - 08:00 PM)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                    Expected Footfall
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1500"
                    value={form.attendees}
                    onChange={(e) => setForm({ ...form, attendees: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-amber-500"
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
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer shadow-sm transition-colors"
                  >
                    Submit for Approval
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
