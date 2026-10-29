import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Check,
  X,
  Calendar,
  Users,
  Building2,
  AlertCircle,
  QrCode,
  Search,
  ArrowRight,
  Stamp,
  FlaskConical,
  Layers
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'
import PersonaVenuesView from './PersonaVenuesView'
import { INITIAL_BOOKINGS } from './AdminPanel'
import { bookingsApi } from '../lib/api'
import { isLabVenue } from '../App'

export default function DeanPortal({
  currentUser,
  onNavigateLogin,
  bookings: propBookings,
  venues = [],
  onUpdateStatus,
  onBookVenue
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

  const [activeTab, setActiveTab] = useState('pending') // 'pending' | 'cleared' | 'declined' | 'all'
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmModal, setConfirmModal] = useState(null) // { type: 'approve' | 'reject', booking: object }
  const [remarks, setRemarks] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)

  const showToast = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  // Filter requests that require Dean sanction (students, clubs, and faculty event/inter-dept bookings)
  const relevantBookings = allBookings.filter((b) => {
    // Already auto-confirmed curriculum classroom lectures skip the queue
    if (b.applicantRole === 'Faculty' && (b.status === 'Confirmed' || b.status === 'Approved') && !b.deanApproval) {
      return false
    }
    return true
  })

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
    if (departmentFilter === 'All') return true
    const bDept = b.venueDepartment || b.department || ''
    return bDept.toLowerCase().includes(departmentFilter.toLowerCase())
  })

  // Filter by tab
  const tabFiltered = deptFiltered.filter((b) => {
    const isPendingDean = b.status === 'Pending Dean Approval'
    const isCleared = b.status === 'Confirmed' || b.status === 'Approved'
    const isDeclined = (b.status === 'Rejected' || b.status === 'Cancelled') && b.approvalStage === 'Dean'

    if (activeTab === 'pending') return isPendingDean
    if (activeTab === 'cleared') return isCleared
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
  const pendingDeanCount = deptFiltered.filter(
    (b) => b.status === 'Pending Dean Approval'
  ).length

  const clearedCount = deptFiltered.filter(
    (b) => b.status === 'Confirmed' || b.status === 'Approved'
  ).length

  const handleDecision = async () => {
    if (!confirmModal) return
    const { type, booking } = confirmModal
    const bookingId = booking.id || booking.ref
    const venueName = booking.venueName || booking.venue || 'Venue'
    const decidedAt = new Date().toISOString().replace('T', ' ').slice(0, 16)
    const reviewerName = currentUser?.name || 'Dean Academics & Student Affairs'

    setIsSubmitting(true)
    const isApproval = type === 'approve'
    const nextStatus = isApproval ? 'Confirmed' : 'Rejected'

    try {
      if (onUpdateStatus) {
        onUpdateStatus(bookingId, nextStatus)
      }

      setLocalBookings((prev) => {
        const updated = prev.map((b) => {
          if (b.id !== bookingId && b.ref !== bookingId) return b
          const copy = { ...b, status: nextStatus, decidedBy: reviewerName, decisionNotes: remarks }

          if (isApproval) {
            copy.approvalStage = 'Completed'
            copy.deanApproval = {
              status: 'Approved',
              approvedBy: reviewerName,
              decidedAt,
              notes: remarks || 'Institutional clearance granted by Dean'
            }
            if (!copy.digitalPassCode) {
              copy.digitalPassCode = `COEP-SANCTION-${Math.floor(1000 + Math.random() * 9000)}-PASS`
            }
          } else {
            copy.approvalStage = 'Rejected'
            copy.deanApproval = {
              status: 'Rejected',
              approvedBy: reviewerName,
              decidedAt,
              notes: remarks || 'Declined by Dean'
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
          ? `✓ Final Dean clearance granted for ${venueName}! Digital Pass & QR Code issued.`
          : `Reservation request for ${venueName} was declined.`,
        isApproval ? 'success' : 'warning'
      )
    } catch (err) {
      showToast(err.message || 'Failed to update clearance status', 'warning')
    } finally {
      setIsSubmitting(false)
      setConfirmModal(null)
      setRemarks('')
    }
  }

  return (
    <ProtectedGate
      allowedRoles={['Dean', 'Administrator']}
      portalName="Dean Institutional Clearance Portal"
      portalDescription="Apex administrative desk for the Dean to grant final venue clearance, issue verifiable QR gate passes, and authorize campus events after HOD endorsement."
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
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Dean Clearance Console
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Stage 2 Clearance (Final)
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Final clearance authority for all campus spaces. Approving here creates the official digital QR gate pass and dispatches email confirmations to students and security.
                </p>
              </div>

              {/* Department Jurisdiction Selector */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">Venue Dept:</span>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                >
                  <option value="All">All Campus Venues</option>
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
                    ? 'bg-blue-600 text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/60 hover:bg-blue-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pending Dean Clearance ({pendingDeanCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cleared')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border flex items-center gap-2 ${
                  activeTab === 'cleared'
                    ? 'bg-emerald-600 text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-500" />
                <span>Cleared & Pass Active ({clearedCount})</span>
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

              <button
                type="button"
                onClick={() => setActiveTab('venues')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border flex items-center gap-2 ${
                  activeTab === 'venues'
                    ? 'bg-blue-600 text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-blue-800 dark:text-blue-300 border-blue-300/80 dark:border-blue-800/80 hover:bg-blue-50/60'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Campus Venues & Facilities</span>
              </button>
            </div>

            {/* Search */}
            {activeTab !== 'venues' && (
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search venue or applicant..."
                  className="w-full h-10 px-3 pl-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            )}
          </div>
        </div>

        {/* Requests Feed OR Campus Venues Under Dean */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {activeTab === 'venues' ? (
            <PersonaVenuesView
              currentUser={currentUser}
              persona="dean"
              venues={venues}
              campusBookings={allBookings}
              onBookVenue={onBookVenue}
              defaultDepartment="All"
            />
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                No requests found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No requests requiring Dean clearance match your current filter.
              </p>
            </div>
          ) : (
            filteredBookings.map((b) => {
              const bookingId = b.id || b.ref
              const venueName = b.venueName || b.venue || 'Venue'
              const venueDept = b.venueDepartment || b.department || 'Central Campus'
              const isLab = isLabVenue({ name: venueName, new_hall_name: venueName, type: 'Laboratories' }) || venueName.toLowerCase().includes('lab')
              const isPendingDean = b.status === 'Pending Dean Approval'
              const isCleared = b.status === 'Confirmed' || b.status === 'Approved'
              const isDeclined = b.status === 'Rejected' || b.status === 'Cancelled'
              const hodInfo = b.hodApproval || {}
              const deanInfo = b.deanApproval || {}

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
                        {isLab && b.labAssistantApproval?.status === 'Approved' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
                            <span>Stage 1: Lab Assistant Cleared</span>
                          </span>
                        )}
                        {b.hodApproval?.status === 'Approved' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Stage 2: HOD Sanctioned</span>
                          </span>
                        )}
                        {isPendingDean && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <Clock className="w-3.5 h-3.5 animate-pulse text-blue-500" />
                            <span>Action Required: Final Dean Clearance</span>
                          </span>
                        )}
                        {isCleared && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Dean Cleared &bull; Digital QR Pass Active</span>
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
                        Date: {b.bookingDate || b.date}
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

                    {/* Prominent Stage 1 HOD Endorsement Banner */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Stamp className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                            Stage 1 HOD Endorsement Received
                          </span>
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                            {hodInfo.decidedAt || 'Endorsed'}
                          </span>
                        </div>
                        <p className="text-emerald-800 dark:text-emerald-300 text-[11px]">
                          Sanctioned by <strong>{hodInfo.approvedBy || `${venueDept} HOD`}</strong>.
                          {hodInfo.notes ? ` "${hodInfo.notes}"` : ' Verified for departmental availability and academic integrity.'}
                        </p>
                      </div>
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
                          Slot & Timing
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {b.bookingDate || b.date}
                        </span>
                        <div className="text-[11px] text-slate-500">{b.timeSlot || b.slot}</div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Attendees & Capacity
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {b.attendees || b.capacity || 50} Attendees
                        </span>
                        <div className="text-[11px] text-slate-500">Hall Capacity: {b.capacity || 60}</div>
                      </div>
                    </div>

                    {/* Declared Requirements */}
                    {b.notes && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <strong className="text-slate-800 dark:text-slate-200">Equipment & Logistic Demands:</strong> {b.notes}
                      </div>
                    )}

                    {/* Dean Clearance Notes (if cleared) */}
                    {deanInfo.notes && (
                      <div className="text-xs text-slate-700 dark:text-slate-300 italic p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
                        Dean Remarks ({deanInfo.approvedBy}): "{deanInfo.notes}"
                      </div>
                    )}

                    {/* Direct Action Panel */}
                    {isPendingDean && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Granting Dean clearance validates this reservation, generates a scannable QR pass, and dispatches gate access permits.
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
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <QrCode className="w-4 h-4" />
                            <span>Grant Final Clearance & Issue Pass</span>
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
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                  }`}
                >
                  {confirmModal.type === 'approve' ? (
                    <ShieldCheck className="w-6 h-6" />
                  ) : (
                    <X className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {confirmModal.type === 'approve' ? 'Grant Final Dean Clearance' : 'Decline Venue Request'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {confirmModal.booking.venueName || confirmModal.booking.venue} &bull; {confirmModal.booking.applicantName}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                {confirmModal.type === 'approve'
                  ? 'This grants the final administrative authorization. The student will immediately receive their digital QR gate pass.'
                  : 'Please specify the reason for withholding final clearance.'}
              </p>

              <div className="space-y-2 mb-5">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Dean Clearance Order / Conditions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={
                    confirmModal.type === 'approve'
                      ? 'e.g., Sanctioned under Dean Academic quota. Sound limit to 65dB after 06:00 PM.'
                      : 'e.g., Conflict with campus convocation schedule.'
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
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
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : confirmModal.type === 'approve' ? 'Grant Clearance & Issue Pass' : 'Confirm Decline'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedGate>
  )
}
