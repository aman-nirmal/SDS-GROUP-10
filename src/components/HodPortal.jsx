import React, { useState, useEffect } from 'react'
import {
  Stamp,
  CheckCircle2,
  Clock,
  Check,
  X,
  Calendar,
  Users,
  Building2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'
import { INITIAL_BOOKINGS } from './AdminPanel'
import { bookingsApi } from '../lib/api'

export default function HodPortal({
  currentUser,
  onNavigateLogin,
  bookings: propBookings,
  onUpdateStatus
}) {
  const [localBookings, setLocalBookings] = useState(() => {
    if (propBookings && propBookings.length > 0) return propBookings
    try {
      const stored = localStorage.getItem('locus_admin_bookings')
      return stored ? JSON.parse(stored) : INITIAL_BOOKINGS
    } catch {
      return INITIAL_BOOKINGS
    }
  })

  useEffect(() => {
    if (propBookings && propBookings.length > 0) {
      setLocalBookings(propBookings)
    }
  }, [propBookings])

  const allBookings = propBookings || localBookings

  // HOD department filtering: default to currentUser's department or 'All'
  const userDept = currentUser?.department || 'Civil Engineering'
  const [selectedDept, setSelectedDept] = useState(userDept)
  const [activeTab, setActiveTab] = useState('pending') // 'pending' | 'sanctioned' | 'declined' | 'all'
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmModal, setConfirmModal] = useState(null) // { type: 'approve' | 'reject', booking: object }
  const [remarks, setRemarks] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)

  const showToast = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  // Filter requests that are for students/clubs (venue bookings requiring sanction)
  const relevantBookings = allBookings.filter((b) => b.applicantRole !== 'Faculty')

  // Extract distinct departments from venues
  const distinctDepartments = Array.from(
    new Set(
      relevantBookings
        .map((b) => b.venueDepartment || b.department)
        .filter(Boolean)
    )
  ).sort()

  // Filter by department
  const deptFiltered = relevantBookings.filter((b) => {
    if (selectedDept === 'All') return true
    const bDept = b.venueDepartment || b.department || ''
    return bDept.toLowerCase().includes(selectedDept.toLowerCase()) || selectedDept.toLowerCase().includes(bDept.toLowerCase())
  })

  // Filter by status tab
  const tabFiltered = deptFiltered.filter((b) => {
    const isPendingHod = b.status === 'Pending' || b.status === 'Pending HOD Approval'
    const isSanctioned = b.status === 'Pending Dean Approval' || b.status === 'Confirmed' || b.status === 'Approved' || b.hodApproval?.status === 'Approved'
    const isDeclined = b.status === 'Rejected' || b.status === 'Cancelled'

    if (activeTab === 'pending') return isPendingHod
    if (activeTab === 'sanctioned') return isSanctioned && !isPendingHod
    if (activeTab === 'declined') return isDeclined
    return true
  })

  // Filter by search query
  const filteredBookings = tabFiltered.filter((b) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      (b.venueName || b.venue || '').toLowerCase().includes(query) ||
      (b.applicantName || '').toLowerCase().includes(query) ||
      (b.purpose || '').toLowerCase().includes(query) ||
      (b.ref || b.id || '').toLowerCase().includes(query)
    )
  })

  // Counts
  const pendingCount = deptFiltered.filter(
    (b) => b.status === 'Pending' || b.status === 'Pending HOD Approval'
  ).length

  const sanctionedCount = deptFiltered.filter(
    (b) => (b.status === 'Pending Dean Approval' || b.status === 'Confirmed' || b.status === 'Approved' || b.hodApproval?.status === 'Approved') &&
      b.status !== 'Pending' && b.status !== 'Pending HOD Approval'
  ).length

  const handleDecision = async () => {
    if (!confirmModal) return
    const { type, booking } = confirmModal
    const bookingId = booking.id || booking.ref
    const venueName = booking.venueName || booking.venue || 'Venue'
    const decidedAt = new Date().toISOString().replace('T', ' ').slice(0, 16)
    const reviewerName = currentUser?.name || 'Department HOD'

    setIsSubmitting(true)
    const isApproval = type === 'approve'
    const nextStatus = isApproval ? 'Pending Dean Approval' : 'Rejected'

    try {
      if (onUpdateStatus) {
        onUpdateStatus(bookingId, nextStatus)
      }

      setLocalBookings((prev) => {
        const updated = prev.map((b) => {
          if (b.id !== bookingId && b.ref !== bookingId) return b
          const copy = { ...b, status: nextStatus, decidedBy: reviewerName, decisionNotes: remarks }

          if (isApproval) {
            copy.approvalStage = 'Dean'
            copy.hodApproval = {
              status: 'Approved',
              department: b.venueDepartment || b.department,
              approvedBy: reviewerName,
              decidedAt,
              notes: remarks || 'Sanctioned by Department HOD'
            }
            copy.deanApproval = {
              status: 'Pending',
              approvedBy: null,
              decidedAt: null,
              notes: ''
            }
          } else {
            copy.approvalStage = 'Rejected'
            copy.hodApproval = {
              status: 'Rejected',
              approvedBy: reviewerName,
              decidedAt,
              notes: remarks || 'Declined by Department HOD'
            }
          }
          return copy
        })

        try {
          localStorage.setItem('locus_admin_bookings', JSON.stringify(updated))
        } catch {
          // ignore
        }
        return updated
      })

      await bookingsApi.updateStatus(bookingId, nextStatus, remarks, reviewerName)
      showToast(
        isApproval
          ? `✓ Sanctioned ${venueName}! Forwarded to Dean for final clearance.`
          : `Reservation request for ${venueName} was declined.`,
        isApproval ? 'success' : 'warning'
      )
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'warning')
    } finally {
      setIsSubmitting(false)
      setConfirmModal(null)
      setRemarks('')
    }
  }

  return (
    <ProtectedGate
      allowedRoles={['Head of Department (HOD)', 'HOD', 'Administrator']}
      portalName="HOD Venue Sanction Portal"
      portalDescription="Authorized gateway for Department Heads to sanction venue reservations under their departmental jurisdiction before Dean clearance."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
    >
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors">
        {/* Toast */}
        {notification && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl animate-in slide-in-from-top duration-200 border border-slate-700">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Executive Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-400">
                    <Stamp className="w-4 h-4" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    HOD Venue Sanction Desk
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Stage 1 Review
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Head of Department review queue. Requests endorsed here automatically escalate to the <strong>Dean</strong> for final institutional clearance.
                </p>
              </div>

              {/* Department Jurisdiction Selector */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">Department:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
                >
                  <option value="All">All Departments</option>
                  {distinctDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-slate-800">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border flex items-center gap-2 ${
                  activeTab === 'pending'
                    ? 'bg-amber-600 text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60 hover:bg-amber-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pending HOD Sanction ({pendingCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sanctioned')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border flex items-center gap-2 ${
                  activeTab === 'sanctioned'
                    ? 'bg-blue-600 text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Sanctioned ({sanctionedCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('declined')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border flex items-center gap-2 ${
                  activeTab === 'declined'
                    ? 'bg-rose-600 text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <X className="w-3.5 h-3.5 text-rose-500" />
                <span>Declined</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
                  activeTab === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                All ({deptFiltered.length})
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search venue or applicant..."
                className="w-full h-10 px-3 pl-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Request Cards Feed */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <Stamp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                No requests found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No venue reservation requests match your current department and status filter.
              </p>
            </div>
          ) : (
            filteredBookings.map((b) => {
              const bookingId = b.id || b.ref
              const venueName = b.venueName || b.venue || 'Venue'
              const venueDept = b.venueDepartment || b.department || 'Central Campus'
              const isPendingHod = b.status === 'Pending' || b.status === 'Pending HOD Approval'
              const isSanctioned = b.status === 'Pending Dean Approval' || b.status === 'Confirmed' || b.status === 'Approved' || b.hodApproval?.status === 'Approved'
              const isDeclined = b.status === 'Rejected' || b.status === 'Cancelled'

              return (
                <div
                  key={bookingId}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Top Status & Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                          {b.ref || b.id}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {venueDept}
                        </span>
                        {isPendingHod && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                            <span>Action Required: Stage 1 HOD Review</span>
                          </span>
                        )}
                        {isSanctioned && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>HOD Sanctioned &bull; Escalated to Dean</span>
                          </span>
                        )}
                        {isDeclined && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <X className="w-3.5 h-3.5 text-rose-600" />
                            <span>Declined</span>
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-slate-400">
                        Submitted: {b.submittedAt || b.bookingDate || b.date}
                      </span>
                    </div>

                    {/* Venue & Purpose Title */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {venueName} {b.oldName && <span className="text-sm font-normal text-slate-400">({b.oldName})</span>}
                      </h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">
                        "{b.purpose}"
                      </p>
                    </div>

                    {/* Details Strip (3 Columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Applicant
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {b.applicantName} ({b.applicantRole || 'Student'})
                        </span>
                        <div className="text-[11px] text-slate-500 truncate">{b.applicantEmail}</div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Date & Slot
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {b.bookingDate || b.date}
                        </span>
                        <div className="text-[11px] text-slate-500">{b.timeSlot || b.slot}</div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Expected Attendees
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {b.attendees || b.capacity || 50} Persons
                        </span>
                        <div className="text-[11px] text-slate-500">Hall Capacity: {b.capacity || 60}</div>
                      </div>
                    </div>

                    {/* Declared Requirements & Notes */}
                    {b.notes && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
                        <strong className="text-amber-900 dark:text-amber-300">Declared Requirements:</strong> {b.notes}
                      </div>
                    )}

                    {/* Review Notes (if already decided) */}
                    {b.hodApproval?.notes && (
                      <div className="text-xs text-slate-700 dark:text-slate-300 italic p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                        HOD Remarks ({b.hodApproval.approvedBy}): "{b.hodApproval.notes}"
                      </div>
                    )}

                    {/* Direct Action Panel */}
                    {isPendingHod && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Sanctioning as <strong>HOD, {venueDept}</strong> endorses this reservation and routes it to the Dean for final clearance.
                        </p>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModal({
                                type: 'approve',
                                booking: b
                              })
                            }
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Check className="w-4 h-4" />
                            <span>Sanction Request (Escalate to Dean)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModal({
                                type: 'reject',
                                booking: b
                              })
                            }
                            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 font-bold text-xs transition-colors cursor-pointer"
                          >
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Confirmation & Remarks Modal */}
        {confirmModal && (
          <div
            onClick={() => setConfirmModal(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    confirmModal.type === 'approve'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                  }`}
                >
                  {confirmModal.type === 'approve' ? (
                    <Stamp className="w-6 h-6" />
                  ) : (
                    <X className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {confirmModal.type === 'approve' ? 'Sanction Venue Reservation' : 'Decline Venue Request'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {confirmModal.booking.venueName || confirmModal.booking.venue} &bull; {confirmModal.booking.applicantName}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                {confirmModal.type === 'approve'
                  ? 'Your departmental endorsement will be stamped on this request and forwarded to the Dean for final clearance.'
                  : 'Please provide a reason for declining this reservation request.'}
              </p>

              <div className="space-y-2 mb-5">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  HOD Endorsement Remarks / Conditions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={
                    confirmModal.type === 'approve'
                      ? 'e.g., Sanctioned for department symposium. Projector and AC cleared.'
                      : 'e.g., Venue already scheduled for academic practical exams on this date.'
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleDecision}
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                    confirmModal.type === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : confirmModal.type === 'approve' ? 'Confirm Sanction' : 'Confirm Decline'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedGate>
  )
}
