import React, { useState } from 'react'
import {
  Trophy,
  Calendar,
  Clock,
  CheckCircle2,
  Plus,
  XCircle,
  Check,
  Zap
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'

const INITIAL_CLUB_BOOKINGS = [
  {
    id: 'CLB-BK-401',
    eventTitle: "MindSpark '26: Flagship 24-Hour Campus Hackathon",
    venue: 'ND01 (North Drawing Hall) + NC24',
    date: '2026-10-25',
    timeSlot: '09:00 AM - 09:00 PM',
    attendees: 180,
    status: 'Approved',
    pipelineStage: 'Central Estate Confirmed',
    equipment: ['High-Power PA System', '3-Phase GenSet Backup', '180 Heavy Benches', 'Campus Security Deployment']
  },
  {
    id: 'CLB-BK-402',
    eventTitle: 'Autonomous Aerial Drone Racing Workshop',
    venue: 'BHAU Institute Main Auditorium',
    date: '2026-10-29',
    timeSlot: '02:00 PM - 06:00 PM',
    attendees: 100,
    status: 'Pending Gymkhana Review',
    pipelineStage: 'Staff Advisor Verified',
    equipment: ['Stage Projector', 'Handheld Mics (x3)', 'Safety Netting']
  },
  {
    id: 'CLB-BK-403',
    eventTitle: 'Technical Paper Presentation & Model Exhibition',
    venue: 'Computer Department Seminar Hall',
    date: '2026-11-03',
    timeSlot: '10:00 AM - 02:00 PM',
    attendees: 75,
    status: 'Approved',
    pipelineStage: 'Central Estate Confirmed',
    equipment: ['Poster Display Easels', 'Dual Microphones']
  }
]

export default function ClubPortal({ currentUser, onNavigateLogin, onQuickLogin }) {
  const [bookings, setBookings] = useState(INITIAL_CLUB_BOOKINGS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notification, setNotification] = useState('')

  const [form, setForm] = useState({
    eventTitle: '',
    venue: 'BHAU Institute Main Auditorium',
    date: '2026-11-05',
    timeSlot: '10:00 AM - 04:00 PM',
    attendees: 150,
    soundSystem: true,
    powerBackup: true,
    securityNeeded: false
  })

  const showNotification = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 3500)
  }

  const handleCreateBooking = (e) => {
    e.preventDefault()
    if (!form.eventTitle.trim()) {
      alert('Please specify the flagship club event title.')
      return
    }

    const equipmentList = []
    if (form.soundSystem) equipmentList.push('High-Power PA & Microphones')
    if (form.powerBackup) equipmentList.push('3-Phase Generator Standby')
    if (form.securityNeeded) equipmentList.push('Campus Security Post')

    const newBooking = {
      id: `CLB-BK-${Math.floor(100 + Math.random() * 900)}`,
      eventTitle: form.eventTitle,
      venue: form.venue,
      date: form.date,
      timeSlot: form.timeSlot,
      attendees: Number(form.attendees),
      status: 'Pending Gymkhana Review',
      pipelineStage: 'Staff Advisor Verified',
      equipment: equipmentList.length > 0 ? equipmentList : ['Standard Hall Setup']
    }

    setBookings([newBooking, ...bookings])
    showNotification(`Club event proposal submitted for ${newBooking.eventTitle}`)
    setIsModalOpen(false)
    setForm({
      eventTitle: '',
      venue: 'BHAU Institute Main Auditorium',
      date: '2026-11-05',
      timeSlot: '10:00 AM - 04:00 PM',
      attendees: 150,
      soundSystem: true,
      powerBackup: true,
      securityNeeded: false
    })
  }

  return (
    <ProtectedGate
      allowedRoles={['Club Lead']}
      portalName="COEP Gymkhana Club & Technical Festival Secretariat"
      portalDescription="Reserve large auditoriums, open amphitheaters, and festival venues with stage equipment requisition for authorized student bodies."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
      onQuickLogin={onQuickLogin}
    >
      <div className="w-full min-h-screen bg-slate-50 text-slate-900 pb-20">
        {/* Club Secretariat Header */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow-sm">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                    Club Lead Workspace
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Student Gymkhana Affiliation</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  {currentUser?.name || 'MindSpark Secretariat Lead'}
                </h1>
                <p className="text-xs text-slate-500">
                  {currentUser?.department || 'Technical Events Secretariat'} • COEP Student Gymkhana
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer self-end sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Propose Club Event Venue</span>
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
                <span>Festival Venues Booked</span>
                <Calendar className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {bookings.filter((b) => b.status === 'Approved').length} Approved
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Auditoriums & open exhibition grounds</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>In Review Pipeline</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-blue-600">
                {bookings.filter((b) => b.status !== 'Approved').length} Pending
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Awaiting Gymkhana Staff Advisor sign-off</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Logistics Check</span>
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-purple-600">
                PA + 3-Phase Ready
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Sound & electrical clearance granted</p>
            </div>
          </section>

          {/* Bookings & Multi-Stage Approval Pipeline */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Club Event Schedule & Approvals</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Multi-stage approval tracking from Gymkhana Faculty Advisors to Central Estate clearance.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
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
                      <span className="text-xs font-bold text-amber-700">{b.venue}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{b.eventTitle}</h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>Date: <strong>{b.date}</strong></span>
                      <span>Time: <strong>{b.timeSlot}</strong></span>
                      <span>Expected Turnout: <strong>{b.attendees} participants</strong></span>
                      <span>Stage: <strong className="text-slate-800">{b.pipelineStage}</strong></span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {b.equipment.map((eq, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px]">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</div>
                      <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                        <Check className="w-3.5 h-3.5" />
                        <span>{b.pipelineStage}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Modal: Propose Club Event Space */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-extrabold text-slate-900">Propose Club Event Venue</h3>
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
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    value={form.eventTitle}
                    onChange={(e) => setForm({ ...form, eventTitle: e.target.value })}
                    placeholder="e.g. Impressions '26: Annual Cultural Inter-College Fest"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    Preferred Auditorium / Space
                  </label>
                  <select
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="BHAU Institute Main Auditorium">BHAU Institute Main Auditorium (Capacity: 250)</option>
                    <option value="ND01 (North Drawing Hall)">ND01 North Drawing Hall (Capacity: 180)</option>
                    <option value="Open Air Amphitheatre (OAT)">Open Air Amphitheatre (Capacity: 600)</option>
                    <option value="COEP Boat Club Riverfront Lawn">COEP Boat Club Lawn (Capacity: 1,500)</option>
                    <option value="Computer Dept Seminar Hall">Computer Dept Seminar Hall (Capacity: 120)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                      Event Date
                    </label>
                    <input
                      type="date"
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
                      <option value="09:00 AM - 01:00 PM">09:00 AM - 01:00 PM</option>
                      <option value="02:00 PM - 06:00 PM">02:00 PM - 06:00 PM</option>
                      <option value="10:00 AM - 06:00 PM">10:00 AM - 06:00 PM (Full Day)</option>
                      <option value="06:00 PM - 10:00 PM">06:00 PM - 10:00 PM (Evening Rehearsal)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    Expected Participant Turnout
                  </label>
                  <input
                    type="number"
                    value={form.attendees}
                    onChange={(e) => setForm({ ...form, attendees: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                    Logistics & Infrastructure Requisitions
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.soundSystem}
                        onChange={(e) => setForm({ ...form, soundSystem: e.target.checked })}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span>High-Power Sound System & Wireless Mics</span>
                    </label>

                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.powerBackup}
                        onChange={(e) => setForm({ ...form, powerBackup: e.target.checked })}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span>3-Phase Generator Standby (For AV & stage lights)</span>
                    </label>

                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.securityNeeded}
                        onChange={(e) => setForm({ ...form, securityNeeded: e.target.checked })}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span>Security Deployment (Crowd control for outside college entries)</span>
                    </label>
                  </div>
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
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer shadow-xs"
                  >
                    Submit for Gymkhana Clearance
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
