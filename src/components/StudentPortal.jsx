import React, { useState } from 'react'
import {
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  QrCode,
  Users,
  XCircle,
  Laptop
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'

const INITIAL_STUDENT_BOOKINGS = [
  {
    id: 'STU-BK-902',
    venue: 'Central Library Discussion Room B',
    purpose: 'Final Year Capstone Project: Distributed Systems Coding',
    date: '2026-10-25',
    timeSlot: '02:00 PM - 05:00 PM',
    attendees: 4,
    status: 'Approved',
    digitalPassCode: 'COEP-QR-9021',
    validUntil: '2026-10-25 05:00 PM'
  },
  {
    id: 'STU-BK-903',
    venue: 'BHAU Innovation Pod 3',
    purpose: 'Smart India Hackathon Team Practice & Hardware Prototype',
    date: '2026-10-27',
    timeSlot: '04:00 PM - 07:00 PM',
    attendees: 6,
    status: 'Pending Verification',
    digitalPassCode: 'COEP-QR-9034',
    validUntil: '2026-10-27 07:00 PM'
  }
]

const LAB_RADAR = [
  {
    name: 'Central Library Digital Learning Center',
    capacity: 120,
    occupied: 68,
    status: 'Seats Available',
    type: 'Quiet Study & E-Journals'
  },
  {
    name: 'High Performance Computing Lab (Computer Dept)',
    capacity: 60,
    occupied: 52,
    status: 'Nearly Full',
    type: 'GPU Clusters & Linux Terminals'
  },
  {
    name: 'BHAU Hardware Maker Space',
    capacity: 35,
    occupied: 14,
    status: 'Open Pods',
    type: '3D Printers & IoT Testbenches'
  }
]

export default function StudentPortal({ currentUser, onNavigateLogin, onQuickLogin }) {
  const [bookings, setBookings] = useState(INITIAL_STUDENT_BOOKINGS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notification, setNotification] = useState('')
  const [selectedPass, setSelectedPass] = useState(null)

  const [form, setForm] = useState({
    venue: 'Central Library Discussion Room A',
    purpose: '',
    date: '2026-10-26',
    timeSlot: '02:00 PM - 04:00 PM',
    attendees: 4
  })

  const showNotification = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 3500)
  }

  const handleCreateBooking = (e) => {
    e.preventDefault()
    if (!form.purpose.trim()) {
      alert('Please state the study or project purpose.')
      return
    }

    const newBooking = {
      id: `STU-BK-${Math.floor(100 + Math.random() * 900)}`,
      venue: form.venue,
      purpose: form.purpose,
      date: form.date,
      timeSlot: form.timeSlot,
      attendees: Number(form.attendees),
      status: 'Approved',
      digitalPassCode: `COEP-QR-${Math.floor(1000 + Math.random() * 9000)}`,
      validUntil: `${form.date} ${form.timeSlot.split(' - ')[1]}`
    }

    setBookings([newBooking, ...bookings])
    showNotification(`Study room booking confirmed! Pass ID: ${newBooking.digitalPassCode}`)
    setIsModalOpen(false)
    setForm({
      venue: 'Central Library Discussion Room A',
      purpose: '',
      date: '2026-10-26',
      timeSlot: '02:00 PM - 04:00 PM',
      attendees: 4
    })
  }

  return (
    <ProtectedGate
      allowedRoles={['Student']}
      portalName="COEP Student Workspace & Study Rooms"
      portalDescription="Reserve group discussion pods, library study rooms, and hackathon project spaces with instant digital campus passes."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
      onQuickLogin={onQuickLogin}
    >
      <div className="w-full min-h-screen bg-slate-50 text-slate-900 pb-20">
        {/* Student Profile Header */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                    Student Workspace
                  </span>
                  <span className="text-xs text-slate-400 font-medium">B.Tech / M.Tech Scholar Access</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  Welcome, {currentUser?.name || 'Student'}
                </h1>
                <p className="text-xs text-slate-500">
                  {currentUser?.email} • {currentUser?.department || 'Computer Engineering'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer self-end sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Reserve Study Space</span>
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
          {/* Quick Metrics */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Active Study Passes</span>
                <QrCode className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {bookings.filter((b) => b.status === 'Approved').length} Active
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Authorized digital room passes</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Daily Quota</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-600">
                1 of 2 Used
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Max 4 hours per day policy</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Campus Library WiFi</span>
                <Laptop className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-purple-600">
                High Speed
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Eduroam & COEP-Student active</p>
            </div>
          </section>

          {/* Active Bookings & Digital QR Pass */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">My Study Room Passes</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Show your digital confirmation pass at the security desk or library gate.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{b.id}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {b.status}
                      </span>
                      <span className="text-xs font-bold text-indigo-600">{b.venue}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{b.purpose}</h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>Date: <strong>{b.date}</strong></span>
                      <span>Time: <strong>{b.timeSlot}</strong></span>
                      <span>Team Size: <strong>{b.attendees} persons</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedPass(b)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View Pass</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Campus Facility Occupancy Radar */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">Live Campus Telemetry</div>
              <h2 className="text-base font-extrabold text-slate-900">Lab & Study Hub Availability Radar</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time workstation capacity to avoid walking into crowded labs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {LAB_RADAR.map((lab, idx) => {
                const percent = Math.round((lab.occupied / lab.capacity) * 100)
                return (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{lab.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          percent > 80
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {lab.status}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{lab.occupied} / {lab.capacity} seats filled</span>
                      <span>{percent}% occupancy</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </main>

        {/* Modal: New Study Booking */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-extrabold text-slate-900">Reserve Study Room</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    Study Pod / Room
                  </label>
                  <select
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Central Library Discussion Room A">Central Library Discussion Room A (Capacity: 6)</option>
                    <option value="Central Library Discussion Room B">Central Library Discussion Room B (Capacity: 8)</option>
                    <option value="BHAU Innovation Pod 1">BHAU Innovation Pod 1 (Capacity: 4)</option>
                    <option value="BHAU Innovation Pod 3">BHAU Innovation Pod 3 (Capacity: 6)</option>
                    <option value="Computer Dept Project Lab 4">Computer Dept Project Lab 4 (Capacity: 10)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    Study / Project Topic
                  </label>
                  <input
                    type="text"
                    required
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    placeholder="e.g. Distributed Consensus Algorithms Study Group"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                      Time Slot
                    </label>
                    <select
                      value={form.timeSlot}
                      onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                      <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    Team Strength
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.attendees}
                    onChange={(e) => setForm({ ...form, attendees: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-indigo-500"
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
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-xs"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                <QrCode className="w-8 h-8" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {selectedPass.status} Gate Pass
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">{selectedPass.venue}</h3>
                <p className="text-xs text-slate-500">{selectedPass.purpose}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-1 font-mono">
                <div>Pass ID: <strong>{selectedPass.digitalPassCode}</strong></div>
                <div>Slot: {selectedPass.date} • {selectedPass.timeSlot}</div>
                <div>Valid Until: {selectedPass.validUntil}</div>
                <div>Applicant: {currentUser?.name || 'Aman Nirmal'}</div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPass(null)}
                className="w-full h-10 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
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
