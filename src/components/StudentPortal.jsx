import React, { useState } from 'react'
import {
  BookOpen,
  Plus,
  QrCode,
  Trash2,
  XCircle
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'

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
  const [selectedPass, setSelectedPass] = useState(null)
  const [form, setForm] = useState({
    venue: 'Central Library Discussion Room A',
    purpose: '',
    date: '2026-10-25',
    timeSlot: '02:00 PM - 04:00 PM',
    attendees: 2
  })

  const handleCreateBooking = (e) => {
    e.preventDefault()
    if (!form.purpose.trim()) return

    const randomNum = Math.floor(1000 + Math.random() * 9000)
    const newBooking = {
      id: `STU-BK-${Math.floor(100 + Math.random() * 900)}`,
      venue: form.venue,
      purpose: form.purpose,
      date: form.date,
      timeSlot: form.timeSlot,
      attendees: Number(form.attendees),
      status: 'Approved',
      digitalPassCode: `COEP-STU-${randomNum}-PASS`
    }

    setBookings([newBooking, ...bookings])
    setIsModalOpen(false)
    setForm({
      venue: 'Central Library Discussion Room A',
      purpose: '',
      date: '2026-10-25',
      timeSlot: '02:00 PM - 04:00 PM',
      attendees: 2
    })
  }

  const handleDelete = (id) => {
    setBookings(bookings.filter((b) => b.id !== id))
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
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Book Study Room</span>
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">My Study Room Passes ({bookings.length})</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Show your digital confirmation pass at the security desk or library gate.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {bookings.map((b) => (
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
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{b.venue}</span>
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
                      <span>View QR Gate Pass</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(b.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Cancel Booking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  You have no active study room reservations.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal: Book Study Room */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Book Study Pod / Lab Space</h3>
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
                    Study Facility
                  </label>
                  <select
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Central Library Discussion Room A">Central Library Discussion Room A (4 Seats)</option>
                    <option value="Central Library Discussion Room B">Central Library Discussion Room B (6 Seats)</option>
                    <option value="Turing Computing Lab">Turing Computing Lab</option>
                    <option value="PG Research Study Pod 3">PG Research Study Pod 3</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                    Study Topic / Project Goal
                  </label>
                  <input
                    type="text"
                    required
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    placeholder="e.g. Distributed Consensus Systems Capstone"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-indigo-500"
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
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                      Time Slot
                    </label>
                    <select
                      value={form.timeSlot}
                      onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-indigo-500 cursor-pointer"
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
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-indigo-500"
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
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-sm transition-colors"
                  >
                    Issue Digital Pass
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
                <div>Pass Code: <strong className="text-indigo-700 dark:text-indigo-400">{selectedPass.digitalPassCode}</strong></div>
                <div>Slot: {selectedPass.date} • {selectedPass.timeSlot}</div>
                <div>Team: {selectedPass.attendees} Persons</div>
                <div>Applicant: {currentUser?.name || 'Aman Nirmal'}</div>
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
