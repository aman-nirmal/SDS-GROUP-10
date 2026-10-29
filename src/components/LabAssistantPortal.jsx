import React, { useState, useEffect } from 'react'
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  Building2,
  Search,
  FileCheck2
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'
import PersonaVenuesView from './PersonaVenuesView'
import { isLabVenue } from '../App'

export default function LabAssistantPortal({
  currentUser,
  onNavigateLogin,
  bookings: propBookings = [],
  venues = [],
  onUpdateStatus,
  onBookVenue
}) {
  const [localBookings, setLocalBookings] = useState(propBookings)
  const [activeTab, setActiveTab] = useState('pending') // 'pending' | 'venues' | 'history'
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmModal, setConfirmModal] = useState(null) // { type: 'approve' | 'reject', booking: object }
  const [technicalRemarks, setTechnicalRemarks] = useState('')
  const [equipmentChecked, setEquipmentChecked] = useState(true)
  const [safetyBriefingRequired, setSafetyBriefingRequired] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (propBookings && propBookings.length > 0) {
      setLocalBookings(propBookings)
    }
  }, [propBookings])

  const allBookings = propBookings.length > 0 ? propBookings : localBookings
  const userDept = currentUser?.department || 'Computer Engineering'

  const showToast = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  // Filter bookings that target laboratories
  const labBookings = allBookings.filter((b) => {
    const venueName = (b.venueName || b.venue || '').toLowerCase()
    const isLab = isLabVenue({ name: venueName, new_hall_name: venueName, type: 'Laboratories' }) ||
                  venueName.includes('lab') ||
                  b.approvalStage === 'LabAssistant' ||
                  b.status === 'Pending Lab Assistant Approval'
    return isLab
  })

  // Pending clearances: bookings awaiting Lab Assistant review
  const pendingClearances = labBookings.filter(
    (b) => b.status === 'Pending Lab Assistant Approval' || (b.approvalStage === 'LabAssistant' && b.status !== 'Rejected')
  )

  // Clearance history: bookings already cleared or rejected by lab assistant
  const historyBookings = labBookings.filter(
    (b) => b.status !== 'Pending Lab Assistant Approval' && b.approvalStage !== 'LabAssistant'
  )

  const handleDecision = async () => {
    if (!confirmModal) return
    const { type, booking } = confirmModal
    const bookingId = booking.id || booking.ref
    const isApproval = type === 'approve'
    const nextStatus = isApproval ? 'Pending HOD Approval' : 'Rejected'
    const reviewerName = currentUser?.name || 'Lab Technical Assistant'
    const decidedAt = new Date().toISOString().replace('T', ' ').slice(0, 16)

    setIsSubmitting(true)
    try {
      if (onUpdateStatus) {
        await onUpdateStatus(bookingId, nextStatus)
      }

      setLocalBookings((prev) =>
        prev.map((b) => {
          if (b.id !== bookingId && b.ref !== bookingId) return b
          return {
            ...b,
            status: nextStatus,
            approvalStage: isApproval ? 'HOD' : 'Rejected',
            labAssistantApproval: {
              status: isApproval ? 'Approved' : 'Rejected',
              approvedBy: reviewerName,
              decidedAt,
              equipmentChecked,
              safetyBriefingRequired,
              notes: technicalRemarks || (isApproval ? 'Lab safety & apparatus inventory verified' : 'Declined by Lab Assistant')
            }
          }
        })
      )

      showToast(
        isApproval
          ? `Cleared! Booking ${bookingId} has been verified and escalated to Head of Department (HOD).`
          : `Booking ${bookingId} declined due to technical/safety constraints.`,
        isApproval ? 'success' : 'error'
      )
    } catch (err) {
      console.error('[Lab Assistant Decision Error]', err)
      showToast('Failed to record clearance decision. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
      setConfirmModal(null)
      setTechnicalRemarks('')
    }
  }

  // Filter list by search query
  const displayedPending = pendingClearances.filter((b) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      (b.venueName || b.venue || '').toLowerCase().includes(q) ||
      (b.applicantName || '').toLowerCase().includes(q) ||
      (b.purpose || '').toLowerCase().includes(q) ||
      (b.ref || b.id || '').toLowerCase().includes(q)
    )
  })

  return (
    <ProtectedGate
      allowedRoles={['Lab Assistant', 'Technical Officer', 'Administrator', 'Faculty']}
      portalName="Laboratory Technical Clearance Desk"
      portalDescription="Supervisory desk for Lab Assistants to verify equipment availability, ensure lab safety, and clear bookings before HOD sanction."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
    >
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors">
        {/* Toast Notification */}
        {notification && (
          <div
            className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-top-4 duration-200 ${
              notification.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-rose-600 text-white border-rose-500'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white border-b border-teal-800/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold uppercase tracking-wider">
                  <FlaskConical className="w-3.5 h-3.5 text-teal-300" />
                  Tier 1 Laboratory Authority
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                  Laboratory Clearance & Safety Desk
                </h1>
                <p className="text-xs sm:text-sm text-teal-100/80 max-w-2xl leading-relaxed">
                  Laboratory bookings require verified technical permission from the Lab Assistant to inspect hardware workbenches, GPU clusters, and safety gear before reaching the Head of Department (HOD) and Dean.
                </p>
              </div>

              {/* Persona Pill */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shrink-0 max-w-xs">
                <div className="text-xs text-teal-200 uppercase font-bold tracking-wider">Active Supervisor</div>
                <div className="text-base font-bold text-white mt-0.5">{currentUser?.name || 'Mr. Sachin Patil'}</div>
                <div className="text-xs text-teal-100/70 mt-0.5">
                  {currentUser?.role || 'Senior Technical Assistant'} • {userDept}
                </div>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black text-amber-300">{pendingClearances.length}</div>
                <div className="text-[11px] font-semibold text-teal-200/80 uppercase tracking-wider mt-0.5">
                  Awaiting Clearance
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black text-emerald-300">{historyBookings.length}</div>
                <div className="text-[11px] font-semibold text-teal-200/80 uppercase tracking-wider mt-0.5">
                  Cleared to HOD/Dean
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black text-sky-300">
                  {venues.filter((v) => isLabVenue(v)).length || 7}
                </div>
                <div className="text-[11px] font-semibold text-teal-200/80 uppercase tracking-wider mt-0.5">
                  Laboratories Supervised
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black text-purple-300">100%</div>
                <div className="text-[11px] font-semibold text-teal-200/80 uppercase tracking-wider mt-0.5">
                  Apparatus Compliance
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mt-6 border-b border-teal-800/60 pb-1">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'pending'
                    ? 'bg-white text-teal-950 shadow-md'
                    : 'text-teal-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Clock className="w-4 h-4" />
                Pending Clearances
                {pendingClearances.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-900">
                    {pendingClearances.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('venues')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'venues'
                    ? 'bg-white text-teal-950 shadow-md'
                    : 'text-teal-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <FlaskConical className="w-4 h-4" />
                My Department Laboratories
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'history'
                    ? 'bg-white text-teal-950 shadow-md'
                    : 'text-teal-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                Clearance History
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'venues' ? (
            <PersonaVenuesView
              currentUser={currentUser}
              persona="lab_assistant"
              venues={venues}
              campusBookings={allBookings}
              onBookVenue={onBookVenue}
              defaultDepartment={userDept}
            />
          ) : activeTab === 'pending' ? (
            <div className="space-y-6">
              {/* Informative Governance Alert */}
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-teal-950 dark:text-teal-200">
                    3-Stage Verification Workflow Active
                  </div>
                  <div className="text-xs text-teal-800/90 dark:text-teal-300/80 leading-relaxed">
                    By granting technical clearance here, you confirm that safety guidelines are respected and equipment is available. The booking will automatically advance to <span className="font-semibold underline">Stage 2: Head of Department (HOD)</span> for academic clearance, and then <span className="font-semibold underline">Stage 3: Dean</span> for digital gate pass issuance.
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by lab name, applicant, reference ID, or event purpose..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                />
              </div>

              {displayedPending.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    No Pending Lab Clearances
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    All submitted laboratory reservation requests have been reviewed. New lab bookings will appear here immediately.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedPending.map((b) => (
                    <div
                      key={b.id || b.ref}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-bold">
                            <FlaskConical className="w-3.5 h-3.5" />
                            Step 1/3: Lab Clearance Required
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            {b.ref || b.id}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {b.venueName || b.venue || 'COEP Engineering Lab'}
                          </h4>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {b.venueDepartment || b.department || userDept}
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Applicant:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {b.applicantName} ({b.applicantRole || 'Student'})
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Schedule:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {b.date || b.bookingDate} • {b.slot || b.timeSlot}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Attendees / Batch:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {b.attendees || b.capacity || 40} Students
                            </span>
                          </div>
                          <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                            <span className="text-slate-500 dark:text-slate-400">Purpose: </span>
                            <span className="font-medium text-slate-800 dark:text-slate-200 italic">
                              "{b.purpose}"
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Decision CTA Buttons */}
                      <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => setConfirmModal({ type: 'reject', booking: b })}
                          className="flex-1 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors"
                        >
                          Decline Access
                        </button>
                        <button
                          onClick={() => setConfirmModal({ type: 'approve', booking: b })}
                          className="flex-1 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verify & Clear to HOD
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* History Tab */
            <div className="space-y-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Showing historical laboratory clearances and decisions processed through this desk:
              </div>

              {historyBookings.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                  <p className="text-xs text-slate-400">No past laboratory clearances logged yet.</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-2xs">
                  {historyBookings.map((b) => (
                    <div key={b.id || b.ref} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {b.venueName || b.venue}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'Confirmed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                : b.status === 'Pending Dean Approval'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                                : b.status === 'Pending HOD Approval'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {b.applicantName} • {b.date || b.bookingDate} • {b.slot || b.timeSlot} • "{b.purpose}"
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Lab Assistant Cleared
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Next: {b.approvalStage === 'Completed' ? 'Fully Confirmed' : `${b.approvalStage} Sanction`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {confirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    confirmModal.type === 'approve'
                      ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 border border-teal-200 dark:border-teal-800'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {confirmModal.type === 'approve' ? (
                    <FlaskConical className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {confirmModal.type === 'approve'
                      ? 'Grant Technical Clearance & Forward to HOD'
                      : 'Decline Laboratory Request'}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {confirmModal.booking?.venueName || confirmModal.booking?.venue}
                  </div>
                </div>
              </div>

              {confirmModal.type === 'approve' && (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl text-xs">
                  <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={equipmentChecked}
                      onChange={(e) => setEquipmentChecked(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    Apparatus and computer workstations physically checked & functional
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={safetyBriefingRequired}
                      onChange={(e) => setSafetyBriefingRequired(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    Mandatory laboratory safety briefing to be given at start of session
                  </label>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supervisor Remarks & Apparatus Notes
                </label>
                <textarea
                  value={technicalRemarks}
                  onChange={(e) => setTechnicalRemarks(e.target.value)}
                  placeholder={
                    confirmModal.type === 'approve'
                      ? 'e.g. Lab equipment inspected, 30 GPUs allocated, safe to proceed to HOD.'
                      : 'Reason for declining access (e.g. maintenance work scheduled, shortage of trainer kits).'
                  }
                  rows={3}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDecision}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs ${
                    confirmModal.type === 'approve'
                      ? 'bg-teal-600 hover:bg-teal-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {isSubmitting
                    ? 'Processing...'
                    : confirmModal.type === 'approve'
                    ? 'Confirm & Forward to HOD'
                    : 'Confirm Decline'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedGate>
  )
}
