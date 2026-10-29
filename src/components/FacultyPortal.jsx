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
  Building2,
  ShieldCheck,
  ArrowRight,
  Stamp,
  Lock,
  Sparkles,
  FileCheck2,
  FileText
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'
import { INITIAL_BOOKINGS } from './AdminPanel'
import { bookingsApi } from '../lib/api'

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

  const [requestStatusFilter, setRequestStatusFilter] = useState('All') // 'All' | 'HOD_Pending' | 'Dean_Pending' | 'Confirmed' | 'Rejected'
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [notification, setNotification] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null) // { type: 'HOD_Approve' | 'Dean_Approve' | 'Reject', booking: object }
  const [reviewerRemarks, setReviewerRemarks] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Track expanded cards. Default pending requests to expanded.
  const [expandedIds, setExpandedIds] = useState(() => {
    const pending = (propBookings || INITIAL_BOOKINGS)
      .filter((b) => b.applicantRole !== 'Faculty' && (b.status === 'Pending' || b.status === 'Pending HOD Approval' || b.status === 'Pending Dean Approval'))
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
    setTimeout(() => setNotification(null), 4500)
  }

  // Handle approving or rejecting an incoming request in the two-tier pipeline
  const handleConfirmDecision = async () => {
    if (!confirmModal) return
    const { type, booking } = confirmModal
    const bookingId = booking.id || booking.ref
    const venueName = booking.venueName || booking.venue || 'Venue'
    const remarks = reviewerRemarks.trim()

    let nextStatus = 'Confirmed'
    let toastMsg = ''

    if (type === 'HOD_Approve') {
      nextStatus = 'Pending Dean Approval'
      toastMsg = `Sanctioned by HOD for ${venueName}. Escalated to Dean for final clearance.`
    } else if (type === 'Dean_Approve') {
      nextStatus = 'Confirmed'
      toastMsg = `Final Dean clearance granted for ${venueName}! Digital pass & QR dispatched to applicant.`
    } else if (type === 'Reject') {
      nextStatus = 'Rejected'
      toastMsg = `Reservation request for ${venueName} was rejected.`
    }

    setIsSubmitting(true)

    try {
      if (onUpdateStatus) {
        onUpdateStatus(bookingId, nextStatus)
      }

      setLocalBookings((prev) => {
        const decidedAt = new Date().toISOString().replace('T', ' ').slice(0, 16)
        const updated = prev.map((b) => {
          if (b.id !== bookingId && b.ref !== bookingId) return b
          const copy = { ...b, status: nextStatus, decisionNotes: remarks, decidedBy: currentUser?.name || 'Reviewer' }

          if (type === 'HOD_Approve') {
            copy.approvalStage = 'Dean'
            copy.hodApproval = {
              status: 'Approved',
              department: b.venueDepartment || b.department,
              approvedBy: currentUser?.name || 'Department HOD',
              decidedAt,
              notes: remarks || 'Sanctioned by Department HOD'
            }
            copy.deanApproval = {
              status: 'Pending',
              approvedBy: null,
              decidedAt: null,
              notes: ''
            }
          } else if (type === 'Dean_Approve') {
            copy.approvalStage = 'Completed'
            copy.deanApproval = {
              status: 'Approved',
              approvedBy: currentUser?.name || 'Dean',
              decidedAt,
              notes: remarks || 'Final clearance granted by Dean'
            }
            if (!copy.digitalPassCode) {
              copy.digitalPassCode = `COEP-SANCTION-${Math.floor(1000 + Math.random() * 9000)}-PASS`
            }
          } else if (type === 'Reject') {
            copy.approvalStage = 'Rejected'
            if (b.status === 'Pending Dean Approval') {
              copy.deanApproval = { status: 'Rejected', approvedBy: currentUser?.name || 'Dean', decidedAt, notes: remarks }
            } else {
              copy.hodApproval = { status: 'Rejected', approvedBy: currentUser?.name || 'HOD', decidedAt, notes: remarks }
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

      await bookingsApi.updateStatus(bookingId, nextStatus, remarks, currentUser?.name || 'Reviewer')
      showToast(toastMsg, type === 'Reject' ? 'warning' : 'success')
    } catch (err) {
      showToast(err.message || 'Failed to update reservation status', 'warning')
    } finally {
      setIsSubmitting(false)
      setConfirmModal(null)
      setReviewerRemarks('')
    }
  }

  // Requests submitted by students and clubs
  const requests = activeBookingsList.filter((b) => b.applicantRole !== 'Faculty')

  // Extract distinct venue departments for filtering
  const distinctDepartments = Array.from(
    new Set(
      requests
        .map((b) => b.venueDepartment || b.department)
        .filter(Boolean)
    )
  ).sort()

  // Counts for pipeline badges
  const pendingHodCount = requests.filter(
    (b) => b.status === 'Pending' || b.status === 'Pending HOD Approval'
  ).length

  const pendingDeanCount = requests.filter(
    (b) => b.status === 'Pending Dean Approval'
  ).length

  // Filtered requests by pipeline status and department
  const filteredRequests = requests.filter((b) => {
    // Department Filter
    const bDept = b.venueDepartment || b.department || 'Central'
    if (departmentFilter !== 'All' && bDept !== departmentFilter) return false

    // Status Filter
    if (requestStatusFilter === 'All') return true
    if (requestStatusFilter === 'HOD_Pending') {
      return b.status === 'Pending' || b.status === 'Pending HOD Approval'
    }
    if (requestStatusFilter === 'Dean_Pending') {
      return b.status === 'Pending Dean Approval'
    }
    if (requestStatusFilter === 'Confirmed') {
      return b.status === 'Confirmed' || b.status === 'Approved'
    }
    if (requestStatusFilter === 'Rejected') {
      return b.status === 'Rejected' || b.status === 'Cancelled'
    }
    return true
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
      portalName="Venue Permission Sanctions"
      portalDescription="Two-tier digital approval pipeline: Department HOD sanction followed by Dean final clearance."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
    >
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors">
        {/* Toast Notification */}
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

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Venue Permissions & Sanctions
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  HOD ➔ Dean Pipeline
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Venues require endorsement by the <strong>Department HOD</strong> where the venue is located, followed by <strong>Dean</strong> final clearance before passes are issued.
              </p>
            </div>

            {/* Department Jurisdiction Selector */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Jurisdiction:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="All">All Department Venues</option>
                {distinctDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filter Pills & Overview Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setRequestStatusFilter('All')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer border ${
                  requestStatusFilter === 'All'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                All Requests ({requests.length})
              </button>

              <button
                type="button"
                onClick={() => setRequestStatusFilter('HOD_Pending')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer border flex items-center gap-1.5 ${
                  requestStatusFilter === 'HOD_Pending'
                    ? 'bg-amber-600 text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60 hover:bg-amber-50'
                }`}
              >
                <Stamp className="w-3.5 h-3.5" />
                <span>Step 1: HOD Review ({pendingHodCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setRequestStatusFilter('Dean_Pending')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer border flex items-center gap-1.5 ${
                  requestStatusFilter === 'Dean_Pending'
                    ? 'bg-blue-600 text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/60 hover:bg-blue-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Step 2: Dean Clearance ({pendingDeanCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setRequestStatusFilter('Confirmed')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer border ${
                  requestStatusFilter === 'Confirmed'
                    ? 'bg-emerald-600 text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-50'
                }`}
              >
                Cleared & Active
              </button>

              <button
                type="button"
                onClick={() => setRequestStatusFilter('Rejected')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer border ${
                  requestStatusFilter === 'Rejected'
                    ? 'bg-rose-600 text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50'
                }`}
              >
                Rejected
              </button>
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
        </div>

        {/* Requests Feed */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {filteredRequests.map((b) => {
            const bookingId = b.id || b.ref
            const isExpanded = expandedIds.has(bookingId)

            const isPendingHod = b.status === 'Pending' || b.status === 'Pending HOD Approval'
            const isPendingDean = b.status === 'Pending Dean Approval'
            const isConfirmed = b.status === 'Confirmed' || b.status === 'Approved'
            const isRejected = b.status === 'Rejected' || b.status === 'Cancelled'

            const venueDepartment = b.venueDepartment || b.department || 'Central Department'
            const hodInfo = b.hodApproval || {}
            const deanInfo = b.deanApproval || {}

            return (
              <div
                key={bookingId}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all shadow-2xs ${
                  isExpanded
                    ? 'border-blue-300 dark:border-blue-900/60 ring-2 ring-blue-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Card Header (Clickable Summary Row) */}
                <div
                  onClick={() => toggleExpand(bookingId)}
                  className="p-5 sm:p-6 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors select-none"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start lg:items-center">
                    {/* Left: Metadata, Venue, and Purpose preview */}
                    <div className="lg:col-span-7 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {bookingId}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {b.applicantName || 'Applicant'}
                        </span>
                        {b.applicantRole && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                            {b.applicantRole}
                          </span>
                        )}
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        {/* Owning Venue Department Badge */}
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-indigo-500" />
                          <span>Venue Dept: {venueDepartment}</span>
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                          {b.venueName || b.venue}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                          {b.purpose}
                        </p>
                      </div>
                    </div>

                    {/* Right: Date, Two-Tier Status & Expand Toggle */}
                    <div className="lg:col-span-5 flex flex-col lg:items-end justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 lg:pl-6 w-full">
                      <div className="flex items-center gap-2">
                        {isPendingHod && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                            <span>Step 1: Awaiting HOD Sanction</span>
                          </span>
                        )}
                        {isPendingDean && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 animate-bounce" />
                            <span>Step 2: Awaiting Dean Clearance</span>
                          </span>
                        )}
                        {isConfirmed && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Approved by HOD & Dean</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <X className="w-3.5 h-3.5 text-rose-600" />
                            <span>Rejected</span>
                          </span>
                        )}
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
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleExpand(bookingId)
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 pt-1 cursor-pointer transition-colors"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'Review Sanctions'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details & Sequential Stepper */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 p-5 sm:p-6 rounded-b-2xl space-y-5 animate-in fade-in-50 duration-200">
                    {/* Visual 3-Stage Pipeline Stepper */}
                    <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                        Approval Chain of Custody
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Stage 1: Student Submission */}
                        <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>1. Request Submitted</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                            By {b.applicantName} ({b.submittedAt || 'Initial Entry'})
                          </p>
                        </div>

                        {/* Stage 2: Venue HOD Sanction */}
                        <div
                          className={`p-3 rounded-xl border ${
                            hodInfo.status === 'Approved' || isConfirmed
                              ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30'
                              : isPendingHod
                              ? 'border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30'
                              : isRejected && b.approvalStage === 'HOD'
                              ? 'border-rose-200 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/30'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold">
                              {hodInfo.status === 'Approved' || isConfirmed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : isPendingHod ? (
                                <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                              ) : isRejected && b.approvalStage === 'HOD' ? (
                                <X className="w-4 h-4 text-rose-600" />
                              ) : (
                                <Stamp className="w-4 h-4 text-slate-400" />
                              )}
                              <span>2. {venueDepartment} HOD</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/70 dark:bg-black/30">
                              {hodInfo.status === 'Approved' || isConfirmed
                                ? 'Sanctioned'
                                : isPendingHod
                                ? 'In Review'
                                : isRejected && b.approvalStage === 'HOD'
                                ? 'Rejected'
                                : 'Pending'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                            {hodInfo.approvedBy
                              ? `Sanctioned by ${hodInfo.approvedBy} (${hodInfo.decidedAt || 'Stamped'})`
                              : `Requires sign-off from Head of ${venueDepartment}`}
                          </p>
                          {hodInfo.notes && (
                            <p className="text-[11px] text-slate-700 dark:text-slate-300 italic mt-0.5">
                              "{hodInfo.notes}"
                            </p>
                          )}
                        </div>

                        {/* Stage 3: Dean Clearance */}
                        <div
                          className={`p-3 rounded-xl border ${
                            isConfirmed || deanInfo.status === 'Approved'
                              ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30'
                              : isPendingDean
                              ? 'border-blue-300 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/30'
                              : isRejected && b.approvalStage === 'Dean'
                              ? 'border-rose-200 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/30'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold">
                              {isConfirmed || deanInfo.status === 'Approved' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : isPendingDean ? (
                                <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
                              ) : (
                                <Lock className="w-4 h-4 text-slate-400" />
                              )}
                              <span>3. Dean Clearance</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/70 dark:bg-black/30">
                              {isConfirmed ? 'Cleared' : isPendingDean ? 'Ready for Dean' : 'Locked'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                            {isConfirmed
                              ? `Cleared by ${deanInfo.approvedBy || 'Dean'} (${deanInfo.decidedAt || 'Approved'})`
                              : isPendingDean
                              ? 'HOD sanctioned. Awaiting Dean sign-off.'
                              : 'Unlocks only after HOD approval'}
                          </p>
                          {deanInfo.notes && (
                            <p className="text-[11px] text-slate-700 dark:text-slate-300 italic mt-0.5">
                              "{deanInfo.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Request Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                        <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-500" />
                          <span>Venue Jurisdiction</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {venueDepartment}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Space: {b.venueName || b.venue}
                        </div>
                      </div>

                      <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                        <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Applicant & Team</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {b.applicantName} ({b.applicantRole || 'Student'})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {b.applicantEmail || 'applicant@coeptech.ac.in'} • {b.attendees || 50} Attendees
                        </div>
                      </div>

                      <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                        <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-500" />
                          <span>Slot & Timing</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {b.bookingDate || b.date}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {b.timeSlot || b.slot}
                        </div>
                      </div>
                    </div>

                    {/* Declared Purpose & Notes */}
                    <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Declared Event Purpose & Equipment Requirements
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                        "{b.purpose}"
                      </p>
                      {b.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-2">
                          <strong className="text-slate-700 dark:text-slate-300">Special Requirements:</strong> {b.notes}
                        </p>
                      )}
                    </div>

                    {/* Action Panel Based on Current Pipeline Stage */}
                    {isPendingHod ? (
                      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                            <Stamp className="w-4 h-4 text-amber-600" />
                            <span>Step 1 Action: Department HOD Sanction Required</span>
                          </div>
                          <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                            As Head of <strong>{venueDepartment}</strong>, approving will automatically forward this request to the Dean for final clearance.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModal({
                                type: 'HOD_Approve',
                                booking: b,
                                title: `Sanction as HOD (${venueDepartment})`,
                                description: `Are you sure you want to sanction ${venueName} for ${b.applicantName}? This will automatically escalate the request to the Dean.`
                              })
                            }
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Check className="w-4 h-4" />
                            <span>Sanction (Forward to Dean)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModal({
                                type: 'Reject',
                                booking: b,
                                title: 'Reject Request as HOD',
                                description: `Provide rejection remarks for ${venueName} request submitted by ${b.applicantName}.`
                              })
                            }
                            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ) : isPendingDean ? (
                      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            <span>Step 2 Action: Final Dean Sanction Required</span>
                          </div>
                          <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 mt-0.5">
                            HOD has stamped approval. Dean's approval will issue the digital gate pass with QR code directly to {b.applicantName}.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModal({
                                type: 'Dean_Approve',
                                booking: b,
                                title: 'Grant Final Dean Approval & Gate Pass',
                                description: `Confirm final clearance for ${venueName}. This will officially activate the reservation and email the scannable gate pass to ${b.applicantName}.`
                              })
                            }
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Grant Dean Clearance</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModal({
                                type: 'Reject',
                                booking: b,
                                title: 'Reject Request as Dean',
                                description: `Provide reason for declining final sanction for ${venueName}.`
                              })
                            }
                            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ) : isConfirmed ? (
                      <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Fully Sanctioned by Department HOD and Dean. Gate pass code:{' '}
                            <strong className="font-mono">{b.digitalPassCode || b.ref}</strong>
                          </span>
                        </div>
                        <span className="font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                          Cleared
                        </span>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <X className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>
                            Request rejected at {b.approvalStage || 'Review'} stage.{' '}
                            {b.decisionNotes ? `Remarks: "${b.decisionNotes}"` : ''}
                          </span>
                        </div>
                        <span className="font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
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
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No booking requests found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No requests currently match the selected status filter and department jurisdiction.
              </p>
            </div>
          )}
        </div>

        {/* Confirmation & Sanction Remarks Modal */}
        {confirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    confirmModal.type === 'Reject'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                      : confirmModal.type === 'HOD_Approve'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                      : 'bg-blue-100 dark:bg-blue-950 text-blue-600'
                  }`}
                >
                  {confirmModal.type === 'Reject' ? (
                    <X className="w-5 h-5 stroke-[2.5]" />
                  ) : confirmModal.type === 'HOD_Approve' ? (
                    <Stamp className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {confirmModal.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {confirmModal.description}
                  </p>
                </div>
              </div>

              {/* Remarks Textarea */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Reviewer Remarks / Conditions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reviewerRemarks}
                  onChange={(e) => setReviewerRemarks(e.target.value)}
                  placeholder={
                    confirmModal.type === 'Reject'
                      ? 'Explain reason for rejection...'
                      : 'e.g. Sanctioned subject to lab tech supervision and audio setup by 4 PM.'
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs outline-none focus:border-blue-500 resize-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDecision}
                  disabled={isSubmitting}
                  className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition-colors cursor-pointer shadow-sm ${
                    confirmModal.type === 'Reject'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : confirmModal.type === 'HOD_Approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm Decision'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedGate>
  )
}
