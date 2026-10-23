import React, { useState } from 'react'
import {
  GraduationCap,
  Plus,
  Trash2,
  XCircle
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'

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
  const [form, setForm] = useState({
    venue: 'ND01 (North Drawing Hall)',
    purpose: '',
    date: '2026-10-29',
    timeSlot: '10:00 AM - 12:00 PM',
    attendees: 60
  })

  const handleCreateBooking = (e) => {
    e.preventDefault()
    if (!form.purpose.trim()) return

    const newBooking = {
      id: `FAC-BK-${Math.floor(100 + Math.random() * 900)}`,
      venue: form.venue,
      purpose: form.purpose,
      date: form.date,
      timeSlot: form.timeSlot,
      attendees: Number(form.attendees),
      status: 'Confirmed'
    }

    setBookings([newBooking, ...bookings])
    setIsModalOpen(false)
    setForm({
      venue: 'ND01 (North Drawing Hall)',
      purpose: '',
      date: '2026-10-29',
      timeSlot: '10:00 AM - 12:00 PM',
      attendees: 60
    })
  }

  const handleDelete = (id) => {
    setBookings(bookings.filter((b) => b.id !== id))
  }

  return (
    <ProtectedGate
      allowedRoles={['Faculty', 'Administrator']}
      portalName="Faculty Academic Portal"
      portalDescription="Classroom and lecture hall scheduling for COEP faculty members."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
    >
      <div className="w-full min-h-screen bg-slate-50 text-slate-900 pb-16">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Faculty Workspace</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Academic Hall Reservations
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {currentUser?.name || 'Faculty Member'} • {currentUser?.department || 'Computer Engineering'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Reserve Lecture Hall</span>
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Scheduled Sessions ({bookings.length})</h2>
                <p className="text-xs text-slate-500">Your upcoming lectures and department sessions.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Venue</th>
                    <th className="py-3 px-4">Subject / Purpose</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Slot</th>
                    <th className="py-3 px-4">Class Size</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{b.venue}</td>
                      <td className="py-3.5 px-4 text-slate-600">{b.purpose}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">{b.date}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">{b.timeSlot}</td>
                      <td className="py-3.5 px-4 text-slate-600">{b.attendees} students</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'Confirmed'
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
                          title="Cancel Reservation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No active lecture hall reservations.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal: Reserve Hall */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Reserve Lecture Hall</h3>
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
                    Hall / Classroom
                  </label>
                  <select
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="ND01 (North Drawing Hall)">ND01 (North Drawing Hall)</option>
                    <option value="Computer Department Seminar Hall">Computer Department Seminar Hall</option>
                    <option value="NC24 Smart Classroom">NC24 Smart Classroom</option>
                    <option value="BHAU Auditorium">BHAU Auditorium</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    Subject / Academic Purpose
                  </label>
                  <input
                    type="text"
                    required
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    placeholder="e.g. Distributed Operating Systems - Lecture 12"
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
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                      Time Slot
                    </label>
                    <select
                      value={form.timeSlot}
                      onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    Expected Class Strength
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={form.attendees}
                    onChange={(e) => setForm({ ...form, attendees: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-blue-500"
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
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-sm"
                  >
                    Confirm Reservation
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
