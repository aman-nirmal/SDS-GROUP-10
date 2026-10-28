import React, { useState, useEffect } from 'react'
import {
  GraduationCap,
  Plus,
  Trash2,
  XCircle,
  CheckCircle2,
  Clock,
  Check,
  X,
  Inbox,
  Calendar,
  Users,
  Building2,
  AlertCircle
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'
import { INITIAL_BOOKINGS } from './AdminPanel'

export default function FacultyPortal({
  currentUser,
  onNavigateLogin,
  bookings: propBookings,
  onUpdateStatus,
  onAddBooking
}) {
  // Local bookings fallback if prop not provided
  const [localBookings, setLocalBookings] = useState(() => {
    if (propBookings && propBookings.length > 0) return propBookings
    try {
      const stored = localStorage.getItem('locus_admin_bookings')
      return stored ? JSON.parse(stored) : INITIAL_BOOKINGS
    } catch {
      return INITIAL_BOOKINGS
    }
  })

  // Keep local bookings in sync when propBookings updates
  useEffect(() => {
    if (propBookings && propBookings.length > 0) {
      setLocalBookings(propBookings)
    }
  }, [propBookings])

  const activeBookingsList = propBookings || localBookings

  const [activeTab, setActiveTab] = useState('requests') // 'requests' | 'my-lectures'
  const [filterDepartmentOnly, setFilterDepartmentOnly] = useState(true)
  const [requestStatusFilter, setRequestStatusFilter] = useState('All') // 'All' | 'Pending' | 'Confirmed' | 'Rejected'
  const [notification, setNotification] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    venue: 'ND01 (North Drawing Hall)',
    purpose: '',
    date: '2026-10-29',
    timeSlot: '10:00 AM - 12:00 PM',
    attendees: 60
  })

  const showToast = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  // Handle approving or rejecting an incoming request
  const handleUpdateStatus = (bookingId, newStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(bookingId, newStatus)
    } else {
      setLocalBookings((prev) => {
        const updated = prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        try {
          localStorage.setItem('locus_admin_bookings', JSON.stringify(updated))
        } catch {
          // ignore
        }
        return updated
      })
    }

    const targetBooking = activeBookingsList.find((b) => b.id === bookingId)
    const venueName = targetBooking?.venueName || targetBooking?.venue || 'Venue'

    if (newStatus === 'Confirmed') {
      showToast(`Sanctioned & Approved: ${venueName} for ${targetBooking?.applicantName || 'Student'}`, 'success')
    } else if (newStatus === 'Rejected' || newStatus === 'Cancelled') {
      showToast(`Declined request for ${venueName}`, 'warning')
    }
  }

  // Handle creating a new faculty lecture booking
  const handleCreateBooking = (e) => {
    e.preventDefault()
    if (!form.purpose.trim()) return

    const newId = `COEP-FAC-${Math.floor(1000 + Math.random() * 9000)}`
    const newBooking = {
      id: newId,
      ref: newId,
      venueName: form.venue,
      venue: form.venue,
      applicantName: currentUser?.name || 'Dr. V. K. Kulkarni',
      applicantEmail: currentUser?.email || 'faculty@coeptech.ac.in',
      applicantRole: 'Faculty',
      department: currentUser?.department || 'Computer Engineering',
      purpose: form.purpose,
      bookingDate: form.date,
      date: form.date,
      timeSlot: form.timeSlot,
      slot: form.timeSlot,
      attendees: Number(form.attendees),
      capacity: Number(form.attendees),
      status: 'Confirmed',
      submittedAt: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    if (onAddBooking) {
      onAddBooking(newBooking)
    } else {
      setLocalBookings((prev) => {
        const updated = [newBooking, ...prev]
        try {
          localStorage.setItem('locus_admin_bookings', JSON.stringify(updated))
        } catch {
          // ignore
        }
        return updated
      })
    }

    setIsModalOpen(false)
    setForm({
      venue: 'ND01 (North Drawing Hall)',
      purpose: '',
      date: '2026-10-29',
      timeSlot: '10:00 AM - 12:00 PM',
      attendees: 60
    })
    showToast(`Lecture Hall Reserved: ${form.venue}`, 'success')
  }

  const handleDelete = (id) => {
    handleUpdateStatus(id, 'Cancelled')
  }

  // Department requests: requests submitted by students, clubs, or external applicants
  const departmentRequests = activeBookingsList.filter((b) => {
    const isStudentOrClub = b.applicantRole !== 'Faculty'
    if (!isStudentOrClub) return false

    if (filterDepartmentOnly && currentUser?.department) {
      const deptMatches =
        b.department?.toLowerCase() === currentUser.department.toLowerCase() ||
        b.facultyInCharge?.toLowerCase().includes(currentUser.name?.toLowerCase()) ||
        b.venueName?.toLowerCase().includes('computer')
      return deptMatches
    }
    return true
  })

  // Pending count for badge
  const pendingRequestsCount = departmentRequests.filter(
    (b) => b.status === 'Pending' || b.status === 'Pending Sanction'
  ).length

  // Filtered requests by status
  const filteredRequests = departmentRequests.filter((b) => {
    if (requestStatusFilter === 'All') return true
    if (requestStatusFilter === 'Pending') {
      return b.status === 'Pending' || b.status === 'Pending Sanction'
    }
    return b.status === requestStatusFilter
  })

  // Faculty's own scheduled sessions
  const facultyLectures = activeBookingsList.filter((b) => {
    return (
      b.applicantRole === 'Faculty' ||
      b.applicantEmail === currentUser?.email ||
      b.id?.startsWith('FAC-BK') ||
      b.id?.startsWith('COEP-FAC')
    )
  })

  return (
    <ProtectedGate
      allowedRoles={['Faculty', 'Administrator']}
      portalName="Venue Approvals"
      portalDescription="Review booking requests and manage departmental lecture halls."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
    >
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors">
        {/* Toast Notification */}
        {notification && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl animate-in slide-in-from-top duration-200 border border-slate-700">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Venue Approvals
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Review booking requests from students and clubs, or schedule lecture halls.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Reserve Lecture Hall</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'requests'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              <span>Booking Requests</span>
              {pendingRequestsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('my-lectures')}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'my-lectures'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              <span>My Lectures ({facultyLectures.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Department Requests & Clearances */}
        {activeTab === 'requests' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {/* Filter bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Incoming Venue Sanctions ({filteredRequests.length})
                    </h2>
                    {pendingRequestsCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3 h-3" />
                        {pendingRequestsCount} Pending Action
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Review and sanction student projects, technical clubs, and academic seminar reservations.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterDepartmentOnly(!filterDepartmentOnly)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      filterDepartmentOnly
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {filterDepartmentOnly ? `${currentUser?.department || 'My Department'} Only` : 'All Departments'}
                  </button>

                  <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
                    {['All', 'Pending', 'Confirmed', 'Rejected'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setRequestStatusFilter(status)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                          requestStatusFilter === status
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Booking Ref</th>
                      <th className="py-3 px-4">Requested Venue</th>
                      <th className="py-3 px-4">Applicant & Role</th>
                      <th className="py-3 px-4">Event Purpose</th>
                      <th className="py-3 px-4">Date & Slot</th>
                      <th className="py-3 px-4">Attendees</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Faculty Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredRequests.map((b) => {
                      const isPending = b.status === 'Pending' || b.status === 'Pending Sanction'
                      const isConfirmed = b.status === 'Confirmed' || b.status === 'Approved'
                      const isRejected = b.status === 'Rejected' || b.status === 'Cancelled'

                      return (
                        <tr key={b.id || b.ref} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {b.id || b.ref}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{b.venueName || b.venue}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">{b.department || 'COEP Tech'}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{b.applicantName || 'Student'}</div>
                            <div className="text-[11px] text-slate-400">
                              <span className="inline-block px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium mr-1">
                                {b.applicantRole || 'Student'}
                              </span>
                              {b.applicantEmail}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate" title={b.purpose}>
                            {b.purpose}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800 dark:text-slate-200">{b.bookingDate || b.date}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">{b.timeSlot || b.slot}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                            {b.attendees || b.capacity || 50} pax
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                isConfirmed
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : isPending
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse'
                                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              }`}
                            >
                              {isConfirmed && <Check className="w-3 h-3" />}
                              {isPending && <Clock className="w-3 h-3" />}
                              {isRejected && <X className="w-3 h-3" />}
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(b.id || b.ref, 'Confirmed')}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                                  title="Approve and Sanction Venue"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(b.id || b.ref, 'Rejected')}
                                  className="px-2 py-1.5 rounded-lg border border-rose-300 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Reject Request"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1 text-[11px] text-slate-400 font-medium">
                                <span>Sanction complete</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    {filteredRequests.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p className="font-semibold text-slate-600 dark:text-slate-300">No requests found in this view.</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {filterDepartmentOnly
                              ? 'Try clicking "All Departments" to see all campus booking requests.'
                              : 'New student submissions will appear here automatically.'}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Faculty Scheduled Lectures */}
        {activeTab === 'my-lectures' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    My Scheduled Lectures & Labs ({facultyLectures.length})
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your scheduled academic classes, research evaluations, and departmental lectures.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Lecture</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
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
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {facultyLectures.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{b.id}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{b.venueName || b.venue}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{b.purpose}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">{b.bookingDate || b.date}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">{b.timeSlot || b.slot}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{b.attendees} students</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'Confirmed'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(b.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="Cancel Reservation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {facultyLectures.length === 0 && (
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
        )}

        {/* Modal: Reserve Hall */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Reserve Lecture Hall</h3>
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
                    Hall / Classroom
                  </label>
                  <select
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="ND01 (North Drawing Hall)">ND01 (North Drawing Hall)</option>
                    <option value="Computer Department Seminar Hall">Computer Department Seminar Hall</option>
                    <option value="NC24 Smart Classroom">NC24 Smart Classroom</option>
                    <option value="Auditorium (Bhau Institute)">Auditorium (Bhau Institute)</option>
                    <option value="Conference Room (Bhau Institute)">Conference Room (Bhau Institute)</option>
                    <option value="Classroom 1 (Bhau Institute)">Classroom 1 (Bhau Institute)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                    Subject / Academic Purpose
                  </label>
                  <input
                    type="text"
                    required
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    placeholder="e.g. Distributed Operating Systems - Lecture 12"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-blue-500"
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
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                      Time Slot
                    </label>
                    <select
                      value={form.timeSlot}
                      onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                      <option value="12:30 PM - 01:30 PM">12:30 PM - 01:30 PM</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                    Expected Class Strength
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={form.attendees}
                    onChange={(e) => setForm({ ...form, attendees: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-blue-500"
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
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-sm transition-colors"
                  >
                    Confirm Lecture
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
