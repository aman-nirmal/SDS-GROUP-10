import React, { useState, useEffect } from 'react'
import {
  CheckCircle2,
  Clock,
  Check,
  X,
  Inbox,
  Calendar,
  Users,
  AlertCircle
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
          </div>

          <div className="space-y-4">
            {filteredRequests.map((b) => {
              const isPending = b.status === 'Pending' || b.status === 'Pending Sanction'
              const isConfirmed = b.status === 'Confirmed' || b.status === 'Approved'
              const isRejected = b.status === 'Rejected' || b.status === 'Cancelled'

              return (
                <div
                  key={b.id || b.ref}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start lg:items-center">
                    {/* Left Column (7 cols): Details */}
                    <div className="lg:col-span-7 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {b.id || b.ref}
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
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {b.purpose}
                        </p>
                      </div>

                      {b.applicantEmail && (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          {b.applicantEmail}
                        </div>
                      )}
                    </div>

                    {/* Right Column (5 cols): Schedule, Status & Actions */}
                    <div className="lg:col-span-5 flex flex-col lg:items-end justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 lg:pl-6 w-full">
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

                      {isPending ? (
                        <div className="flex items-center gap-2 pt-1 w-full lg:w-auto">
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(b.id || b.ref, 'Confirmed')}
                            className="flex-1 lg:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(b.id || b.ref, 'Rejected')}
                            className="flex-1 lg:flex-none px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : isConfirmed ? (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-lg border border-emerald-200/80 dark:border-emerald-900/50">
                          Approved
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-3 py-1 rounded-lg border border-rose-200/80 dark:border-rose-900/50">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
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
      </div>
    </ProtectedGate>
  )
}
