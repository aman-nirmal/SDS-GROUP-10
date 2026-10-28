import React, { useState, useEffect } from 'react'
import {
  CheckCircle2,
  Clock,
  Check,
  X,
  Inbox,
  Calendar,
  Users,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  FileText,
  Building2
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'
import { INITIAL_BOOKINGS } from './AdminPanel'

export default function FacultyPortal({
  currentUser,
  onNavigateLogin,
  bookings: propBookings,
  onUpdateStatus
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

  const [requestStatusFilter, setRequestStatusFilter] = useState('All') // 'All' | 'Pending' | 'Confirmed' | 'Rejected'
  const [notification, setNotification] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null) // { type: 'Approve' | 'Reject', booking: object }

  // Track expanded cards. Default pending requests to expanded so reviewer sees details right away.
  const [expandedIds, setExpandedIds] = useState(() => {
    const pending = (propBookings || INITIAL_BOOKINGS)
      .filter((b) => b.applicantRole !== 'Faculty' && (b.status === 'Pending' || b.status === 'Pending Sanction'))
      .map((b) => b.id || b.ref)
    return new Set(pending)
  })

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

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
      showToast(`Approved request for ${venueName}`, 'success')
    } else if (newStatus === 'Rejected' || newStatus === 'Cancelled') {
      showToast(`Rejected request for ${venueName}`, 'warning')
    }
  }

  // Requests submitted by students and clubs
  const requests = activeBookingsList.filter((b) => b.applicantRole !== 'Faculty')

  // Pending count for badge
  const pendingRequestsCount = requests.filter(
    (b) => b.status === 'Pending' || b.status === 'Pending Sanction'
  ).length

  // Filtered requests by status
  const filteredRequests = requests.filter((b) => {
    if (requestStatusFilter === 'All') return true
    if (requestStatusFilter === 'Pending') {
      return b.status === 'Pending' || b.status === 'Pending Sanction'
    }
    return b.status === requestStatusFilter
  })

  const allExpanded = filteredRequests.length > 0 && filteredRequests.every((b) => expandedIds.has(b.id || b.ref))

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedIds(new Set())
    } else {
      setExpandedIds(new Set(filteredRequests.map((b) => b.id || b.ref)))
    }
  }

  return (
    <ProtectedGate
      allowedRoles={['Faculty', 'Administrator']}
      portalName="Venue Approvals"
      portalDescription="Review and approve venue requests from students and clubs."
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
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Venue Approvals
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Review and respond to venue booking requests.
              </p>
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-800 self-start sm:self-auto">
              {['All', 'Pending', 'Confirmed', 'Rejected'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setRequestStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    requestStatusFilter === status
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {status === 'Confirmed' ? 'Approved' : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Requests Feed */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Requests ({filteredRequests.length})
              </h2>
              {pendingRequestsCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Clock className="w-3.5 h-3.5" />
                  {pendingRequestsCount} Pending
                </span>
              )}
            </div>

            {filteredRequests.length > 0 && (
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {allExpanded ? 'Collapse All' : 'Expand All'}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {filteredRequests.map((b) => {
              const bookingId = b.id || b.ref
              const isExpanded = expandedIds.has(bookingId)
              const isPending = b.status === 'Pending' || b.status === 'Pending Sanction'
              const isConfirmed = b.status === 'Confirmed' || b.status === 'Approved'
              const isRejected = b.status === 'Rejected' || b.status === 'Cancelled'

              return (
                <div
                  key={bookingId}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all shadow-2xs ${
                    isExpanded
                      ? 'border-blue-300 dark:border-blue-900/60 ring-2 ring-blue-500/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Card Header (Summary Row) */}
                  <div className="p-5 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start lg:items-center">
                      {/* Left: Metadata, Venue, and Purpose preview */}
                      <div className="lg:col-span-7 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {bookingId}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {b.applicantName || 'Student'}
                          </span>
                          {b.applicantRole && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                              {b.applicantRole}
                            </span>
                          )}
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>{b.attendees || b.capacity || 50} attendees</span>
                          </span>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-baseline gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                              {b.venueName || b.venue}
                            </h3>
                            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                              • {b.department || 'COEP Tech'}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                            {b.purpose}
                          </p>
                        </div>
                      </div>

                      {/* Right: Date, Status & Expand Toggle */}
                      <div className="lg:col-span-5 flex flex-col lg:items-end justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 lg:pl-6 w-full">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                              isConfirmed
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : isPending
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {isConfirmed && <Check className="w-3.5 h-3.5" />}
                            {isPending && <Clock className="w-3.5 h-3.5" />}
                            {isRejected && <X className="w-3.5 h-3.5" />}
                            <span>{isPending ? 'Pending' : isConfirmed ? 'Approved' : 'Rejected'}</span>
                          </span>
                        </div>

                        <div className="text-left lg:text-right space-y-0.5">
                          <div className="flex items-center lg:justify-end gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>{b.bookingDate || b.date}</span>
                          </div>
                          <div className="flex items-center lg:justify-end gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{b.timeSlot || b.slot}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleExpand(bookingId)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 pt-1 cursor-pointer transition-colors"
                        >
                          <span>{isExpanded ? 'Hide Details' : 'Review Details'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Container Details */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 p-5 sm:p-6 rounded-b-2xl space-y-5 animate-in fade-in-50 duration-200">
                      {/* Grid of Key Request Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-500" />
                            <span>Venue & Attendance</span>
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {b.venueName || b.venue}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {b.attendees || b.capacity || 50} Expected Attendees
                          </div>
                        </div>

                        <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Organizer Contact</span>
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {b.applicantName || 'Student'}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                            {b.applicantEmail || 'student@coeptech.ac.in'}
                          </div>
                        </div>

                        <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>Submission Info</span>
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {b.submittedAt || `${b.bookingDate || b.date} • Standard Submission`}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Department: {b.department || 'COEP Tech'}
                          </div>
                        </div>
                      </div>

                      {/* Full Purpose / Justification */}
                      <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Event Purpose</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                          {b.purpose}
                        </p>
                      </div>

                      {/* Faculty Reviewer Decision Bar */}
                      {isPending ? (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40">
                          <div className="text-xs text-slate-700 dark:text-slate-300">
                            <span className="font-bold text-slate-900 dark:text-white">Reviewer Action: </span>
                            Please confirm room availability and approve or reject this booking request.
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => setConfirmModal({ type: 'Approve', booking: b })}
                              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            >
                              <Check className="w-4 h-4" />
                              <span>Approve Request</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmModal({ type: 'Reject', booking: b })}
                              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      ) : isConfirmed ? (
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-semibold">This booking has been approved. The digital pass is active for the applicant.</span>
                          </div>
                          <span className="font-bold uppercase text-[11px] px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-200">
                            Approved
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs">
                          <div className="flex items-center gap-2">
                            <X className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            <span className="font-semibold">This booking request was rejected. The venue remains available for other bookings.</span>
                          </div>
                          <span className="font-bold uppercase text-[11px] px-2.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-200">
                            Rejected
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {filteredRequests.length === 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 py-12 px-6 text-center text-slate-400 shadow-2xs">
                <Inbox className="w-9 h-9 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No booking requests</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  New requests from students and clubs will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    confirmModal.type === 'Approve'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {confirmModal.type === 'Approve' ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <X className="w-5 h-5 stroke-[2.5]" />
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {confirmModal.type === 'Approve'
                      ? 'Confirm Venue Approval'
                      : 'Confirm Rejection'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {confirmModal.type === 'Approve'
                      ? 'Are you sure you want to approve this request? The room will be booked and a digital pass will be issued.'
                      : 'Are you sure you want to reject this request? The venue will remain available for other bookings.'}
                  </p>
                </div>
              </div>

              {/* Booking Summary Box */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-300 text-[11px]">
                    {confirmModal.booking.id || confirmModal.booking.ref}
                  </span>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    {confirmModal.booking.attendees} attendees
                  </span>
                </div>

                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {confirmModal.booking.venueName || confirmModal.booking.venue}
                </div>

                <div className="text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {confirmModal.booking.applicantName}
                  </span>
                  {confirmModal.booking.applicantRole && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {' '}• {confirmModal.booking.applicantRole}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>{confirmModal.booking.bookingDate || confirmModal.booking.date}</span>
                  <span>•</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{confirmModal.booking.timeSlot || confirmModal.booking.slot}</span>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const bookingId = confirmModal.booking.id || confirmModal.booking.ref
                    const newStatus = confirmModal.type === 'Approve' ? 'Confirmed' : 'Rejected'
                    handleUpdateStatus(bookingId, newStatus)
                    setConfirmModal(null)
                  }}
                  className={`px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors ${
                    confirmModal.type === 'Approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {confirmModal.type === 'Approve' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Approve</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      <span>Reject Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedGate>
  )
}
