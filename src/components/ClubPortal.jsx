import React, { useState } from 'react'
import {
  Trophy,
  Plus,
  Trash2,
  XCircle
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
      portalName="Club & Fest Management Portal"
      portalDescription="Reserve campus auditoriums, open-air theatres, and event venues for official Gymkhana student clubs."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
    >
      <div className="w-full min-h-screen bg-slate-50 text-slate-900 pb-16">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
                <Trophy className="w-3.5 h-3.5" />
                <span>Club Secretariat</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Fest & Auditorium Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {currentUser?.name || 'Club Lead'} • {currentUser?.department || 'Student Gymkhana'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Event Proposal</span>
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Registered Club Events ({bookings.length})</h2>
                <p className="text-xs text-slate-500">Major festival allocations and auditorium reservations.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Venue</th>
                    <th className="py-3 px-4">Event Title</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Slot</th>
                    <th className="py-3 px-4">Estimated Crowd</th>
                    <th className="py-3 px-4">Gymkhana Approval</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{b.venue}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{b.title}</td>
                      <td className="py-3.5 px-4 text-slate-600">{b.date}</td>
                      <td className="py-3.5 px-4 text-slate-600">{b.timeSlot}</td>
                      <td className="py-3.5 px-4 text-slate-600">{b.attendees} attendees</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Withdraw Proposal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No active event proposals.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal: Submit Event Proposal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Submit Event Proposal</h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBooking} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    Event Venue
                  </label>
                  <select
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="BHAU Main Auditorium">BHAU Main Auditorium (250 Seats)</option>
                    <option value="Open Air Theatre (OAT)">Open Air Theatre (OAT)</option>
                    <option value="Historic Boat Club & Regatta Grounds">Historic Boat Club & Regatta Grounds</option>
                    <option value="North Drawing Hall (ND01)">North Drawing Hall (ND01)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    Event / Festival Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Impressions '26: Annual Inter-College Cultural Fest"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                      Event Date
                    </label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                      Time Slot
                    </label>
                    <select
                      value={form.timeSlot}
                      onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="08:00 AM - 01:00 PM">08:00 AM - 01:00 PM</option>
                      <option value="01:00 PM - 06:00 PM">01:00 PM - 06:00 PM</option>
                      <option value="06:00 PM - 10:00 PM">06:00 PM - 10:00 PM</option>
                      <option value="Full Day (08:00 AM - 08:00 PM)">Full Day (08:00 AM - 08:00 PM)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    Expected Footfall
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1500"
                    value={form.attendees}
                    onChange={(e) => setForm({ ...form, attendees: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer shadow-sm"
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
