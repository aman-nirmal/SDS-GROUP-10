import React, { useState } from 'react'
import {
  Calendar,
  Clock,
  Building,
  GraduationCap,
  PlusCircle,
  CheckCircle2,
  BookOpen,
  Users,
  MapPin,
  FileCheck2,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'

export default function FacultyPortal({
  currentUser,
  onNavigateLogin,
  bookings: propBookings = [],
  onAddBooking
}) {
  const [activeTab, setActiveTab] = useState('bookings') // 'bookings' | 'reserve' | 'schedule'
  const [selectedVenue, setSelectedVenue] = useState('Computer Engineering Lecture Hall 1')
  const [date, setDate] = useState('2026-10-30')
  const [slot, setSlot] = useState('09:00 AM - 11:00 AM')
  const [purpose, setPurpose] = useState('')
  const [courseCode, setCourseCode] = useState('CS-302')
  const [attendees, setAttendees] = useState(70)
  const [successNotice, setSuccessNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter bookings submitted by faculty or relevant to current faculty
  const facultyBookings = propBookings.filter(
    (b) =>
      b.applicantRole === 'Faculty' ||
      (currentUser?.email && b.applicantEmail?.toLowerCase() === currentUser.email.toLowerCase())
  )

  const handleCreateFacultyBooking = async (e) => {
    e.preventDefault()
    if (!purpose.trim()) return

    setIsSubmitting(true)
    const refNumber = 'FAC-BK-' + Math.floor(100 + Math.random() * 900)
    const newBooking = {
      id: refNumber,
      ref: refNumber,
      venueName: selectedVenue,
      venue: selectedVenue,
      department: currentUser?.department || 'Computer Engineering',
      venueDepartment: currentUser?.department || 'Computer Engineering',
      applicantName: currentUser?.name || 'Dr. V. K. Kulkarni',
      applicantEmail: currentUser?.email || 'faculty@coeptech.ac.in',
      applicantRole: 'Faculty',
      date,
      bookingDate: date,
      slot,
      timeSlot: slot,
      purpose: `[${courseCode}] ${purpose}`,
      capacity: Number(attendees),
      attendees: Number(attendees),
      status: 'Confirmed', // Faculty academic reservations are auto-confirmed for curriculum
      approvalStage: 'Completed',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    }

    if (onAddBooking) {
      await onAddBooking(newBooking)
    }

    setIsSubmitting(false)
    setSuccessNotice(`Hall ${selectedVenue} reserved successfully for ${courseCode} (${slot})!`)
    setPurpose('')
    setActiveTab('bookings')
    setTimeout(() => setSuccessNotice(''), 5000)
  }

  // Predefined academic timetable slots for faculty
  const timetableSlots = [
    { day: 'Monday', time: '09:00 AM - 11:00 AM', course: 'CS-302: Operating Systems', venue: 'NC-27 (Computer Dept Hall A)', type: 'Theory Lecture' },
    { day: 'Monday', time: '02:00 PM - 04:00 PM', course: 'CS-304: Distributed Systems Lab', venue: 'Cognizant Lab (COG-LAB)', type: 'Practical Batch A' },
    { day: 'Wednesday', time: '11:00 AM - 01:00 PM', course: 'CS-401: Cloud Computing', venue: 'AC 101 (NC01)', type: 'Theory Lecture' },
    { day: 'Thursday', time: '09:00 AM - 11:00 AM', course: 'CS-302: Operating Systems', venue: 'NC-27 (Computer Dept Hall A)', type: 'Tutorial & Quiz' },
    { day: 'Friday', time: '02:00 PM - 05:00 PM', course: 'B.Tech Capstone Project Viva', venue: 'Seminar Hall No 1 (SC10)', type: 'Viva Assessment' }
  ]

  return (
    <ProtectedGate
      allowedRoles={['Faculty', 'Administrator']}
      portalName="Faculty Academic Desk"
      portalDescription="Academic scheduling and lecture hall reservation platform for COEP faculty members and professors."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
    >
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors">
        {/* Success Banner */}
        {successNotice && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl animate-in slide-in-from-top duration-200 border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Faculty Academic Desk
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Curriculum & Lectures
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                Signed in as <strong>{currentUser?.name || 'Faculty Member'}</strong> &bull; {currentUser?.department || 'COEP Technological University'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('reserve')}
                className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Reserve Hall for Class / Viva</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border flex items-center gap-2 ${
                activeTab === 'bookings'
                  ? 'bg-blue-600 text-white border-transparent shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>My Reserved Halls ({facultyBookings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border flex items-center gap-2 ${
                activeTab === 'schedule'
                  ? 'bg-blue-600 text-white border-transparent shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Academic Timetable</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reserve')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border flex items-center gap-2 ${
                activeTab === 'reserve'
                  ? 'bg-blue-600 text-white border-transparent shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Direct Reservation</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Faculty Bookings */}
        {activeTab === 'bookings' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            {facultyBookings.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  No active classroom reservations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
                  You haven't reserved any additional halls for tests, vivas, or guest talks yet.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('reserve')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Reserve Hall Now
                </button>
              </div>
            ) : (
              facultyBookings.map((b) => (
                <div
                  key={b.id || b.ref}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                        {b.ref || b.id}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {b.venueName || b.venue}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmed Academic Slot</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {b.purpose}
                    </h4>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {b.bookingDate || b.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {b.timeSlot || b.slot}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {b.attendees || b.capacity || 60} Students
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <FileCheck2 className="w-4 h-4" />
                      <span>Timetable Cleared</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Academic Timetable */}
        {activeTab === 'schedule' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Curricular Weekly Schedule
                  </h3>
                  <p className="text-xs text-slate-500">
                    Allocated classroom slots for course lectures and laboratory sessions.
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
                  Semester I &bull; 2026-27
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {timetableSlots.map((slot, idx) => (
                  <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white w-24">
                          {slot.day}
                        </span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                          {slot.time}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {slot.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {slot.course}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span>{slot.venue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Direct Reservation Form */}
        {activeTab === 'reserve' && (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Direct Hall Reservation for Faculty
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Book classrooms and seminar halls for end-sem vivas, remedial lectures, guest sessions, or project demos.
                </p>
              </div>

              <form onSubmit={handleCreateFacultyBooking} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Select Classroom / Seminar Hall
                  </label>
                  <select
                    value={selectedVenue}
                    onChange={(e) => setSelectedVenue(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  >
                    <option value="Computer Engineering Lecture Hall 1">Computer Engineering Lecture Hall 1 (NC-27)</option>
                    <option value="Computer Dept Hall B (NC-28)">Computer Dept Hall B (NC-28)</option>
                    <option value="AC 101 (NC01) Academics Complex">AC 101 (NC01) Academics Complex</option>
                    <option value="Cognizant Lab (COG-LAB)">Cognizant Lab (COG-LAB)</option>
                    <option value="Seminar Hall No 1 (SC10)">Seminar Hall No 1 (SC10)</option>
                    <option value="Mechanical Drawing Hall (ND01)">Mechanical Drawing Hall (ND01)</option>
                    <option value="Civil Old Wing (SC06)">Civil Old Wing (SC06)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Time Slot
                    </label>
                    <select
                      value={slot}
                      onChange={(e) => setSlot(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                    >
                      <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (Morning Session)</option>
                      <option value="11:30 AM - 01:30 PM">11:30 AM - 01:30 PM (Midday Session)</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon Practical)</option>
                      <option value="04:30 PM - 06:30 PM">04:30 PM - 06:30 PM (Evening Viva/Exam)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Course Code / Subject
                    </label>
                    <input
                      type="text"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      placeholder="e.g. CS-302, ME-201"
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Expected Student Count
                    </label>
                    <input
                      type="number"
                      value={attendees}
                      onChange={(e) => setAttendees(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Academic Purpose / Topic
                  </label>
                  <textarea
                    rows={3}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g., Mid-Semester Practical Evaluation & Code Review for SY CS Batch 1"
                    required
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Confirming Reservation...' : 'Confirm Faculty Booking'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedGate>
  )
}
