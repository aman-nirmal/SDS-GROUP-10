import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  Check,
  X,
  Plus,
  Trash2,
  Building2,
  QrCode,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  CreditCard
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'
import DigitalPassQR from './DigitalPassQR'
import { INITIAL_BOOKINGS } from './AdminPanel'
import { bookingsApi } from '../lib/api'

const INITIAL_STUDENT_PASSES = [
  {
    id: 'STU-BK-902',
    venue: 'Central Library Discussion Room B',
    venueName: 'Central Library Discussion Room B',
    venueDepartment: 'Central Library',
    purpose: 'Final Year Capstone Project Coding',
    date: '2026-10-24',
    timeSlot: '02:00 PM - 04:00 PM',
    attendees: 4,
    status: 'Approved',
    digitalPassCode: 'COEP-LIB-8849-PASS'
  },
  {
    id: 'STU-BK-903',
    venue: 'Turing Computer Lab (Workstation 14-16)',
    venueName: 'Turing Computer Lab (Workstation 14-16)',
    venueDepartment: 'Computer Engineering',
    purpose: 'Distributed Systems Practical Lab Simulation',
    date: '2026-10-27',
    timeSlot: '10:00 AM - 12:00 PM',
    attendees: 2,
    status: 'Approved',
    digitalPassCode: 'COEP-LAB-4412-PASS'
  }
]

export default function StudentPortal({
  currentUser,
  onNavigateLogin,
  campusBookings = [],
  onExploreVenues,
  onUpdateStatus
}) {
  const [selectedPass, setSelectedPass] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All') // 'All' | 'Pending' | 'Confirmed' | 'Cancelled'
  const [notification, setNotification] = useState(null)

  // Local passes fallback merged with student bookings
  const [localPasses, setLocalPasses] = useState(() => {
    try {
      const stored = localStorage.getItem('locus_student_study_passes')
      return stored ? JSON.parse(stored) : INITIAL_STUDENT_PASSES
    } catch {
      return INITIAL_STUDENT_PASSES
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('locus_student_study_passes', JSON.stringify(localPasses))
    } catch {
      // ignore
    }
  }, [localPasses])

  const showToast = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3500)
  }

  // Filter campus venue bookings belonging to this user
  const userVenueBookings = campusBookings.filter((b) => {
    if (!currentUser) return true
    if (currentUser.role === 'Administrator') return true
    const userEmail = (currentUser.email || '').toLowerCase()
    const userName = (currentUser.name || '').toLowerCase()
    const bEmail = (b.applicantEmail || '').toLowerCase()
    const bName = (b.applicantName || '').toLowerCase()

    if (bEmail && userEmail && bEmail === userEmail) return true
    if (bName && userName && (bName === userName || bName.includes(userName) || userName.includes(bName))) return true

    if (currentUser.role === 'Student') {
      return b.applicantRole === 'Student' || b.id === 'COEP-BK-8954' || b.id === 'BK-2026-001'
    }
    if (currentUser.role === 'Faculty') {
      return b.applicantRole === 'Faculty'
    }
    return false
  })

  // Combine campus bookings and active local passes into a single unified list
  const combinedBookings = [...userVenueBookings]
  if (currentUser?.role === 'Student') {
    localPasses.forEach((p) => {
      if (!combinedBookings.some((b) => b.id === p.id || b.ref === p.id || b.digitalPassCode === p.digitalPassCode)) {
        combinedBookings.push({
          ...p,
          ref: p.id,
          venueName: p.venue,
          applicantName: currentUser?.name || 'Verified Student',
          applicantRole: 'Student',
          bookingDate: p.date
        })
      }
    })
  }

  // Filtered by status
  const filteredBookings = combinedBookings.filter((b) => {
    if (statusFilter === 'All') return true
    if (statusFilter === 'Pending') {
      return (
        b.status === 'Pending' ||
        b.status === 'Pending Sanction' ||
        b.status === 'Pending HOD Approval' ||
        b.status === 'Pending Dean Approval'
      )
    }
    if (statusFilter === 'Confirmed') {
      return b.status === 'Confirmed' || b.status === 'Approved'
    }
    if (statusFilter === 'Cancelled') {
      return b.status === 'Cancelled' || b.status === 'Rejected'
    }
    return true
  })

  // Cancel reservation
  const handleCancelBooking = (bookingId) => {
    if (onUpdateStatus) {
      onUpdateStatus(bookingId, 'Cancelled')
    }
    setLocalPasses((prev) => prev.filter((p) => p.id !== bookingId))
    bookingsApi
      .updateStatus(bookingId, 'Cancelled', 'Cancelled by applicant', currentUser?.name || 'User')
      .catch(console.warn)

    showToast('Reservation has been cancelled.', 'warning')
  }

  return (
    <ProtectedGate
      allowedRoles={['Student', 'Faculty', 'Club Lead', 'Club Coordinator', 'HOD', 'Dean', 'Administrator']}
      portalName="My Bookings"
      portalDescription="View your venue reservations, approval status, and digital QR gate passes."
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  My Bookings
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {combinedBookings.length} Total
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Track your venue reservations, multi-tier HOD and Dean clearance, and view scannable digital passes.
              </p>
            </div>

            {/* Single clean Book a Venue action */}
            <button
              type="button"
              onClick={onExploreVenues}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Book a Venue</span>
            </button>
          </div>

          {/* Status Filter Tabs */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 py-2.5 overflow-x-auto">
            {[
              { id: 'All', label: `All Bookings (${combinedBookings.length})` },
              {
                id: 'Pending',
                label: `In Review (${
                  combinedBookings.filter(
                    (b) =>
                      b.status === 'Pending' ||
                      b.status === 'Pending Sanction' ||
                      b.status === 'Pending HOD Approval' ||
                      b.status === 'Pending Dean Approval'
                  ).length
                })`
              },
              {
                id: 'Confirmed',
                label: `Approved & Pass Ready (${
                  combinedBookings.filter((b) => b.status === 'Confirmed' || b.status === 'Approved').length
                })`
              },
              {
                id: 'Cancelled',
                label: `Cancelled (${
                  combinedBookings.filter((b) => b.status === 'Cancelled' || b.status === 'Rejected').length
                })`
              }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Bookings List */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {filteredBookings.map((b) => {
            const bookingId = b.id || b.ref
            const isConfirmed = b.status === 'Confirmed' || b.status === 'Approved'
            const isPendingDean = b.status === 'Pending Dean Approval'
            const isPendingHod = b.status === 'Pending HOD Approval' || b.status === 'Pending' || b.status === 'Pending Sanction'
            const isCancelled = b.status === 'Cancelled' || b.status === 'Rejected'

            const venueDepartment = b.venueDepartment || b.department || 'Central Campus'
            const passCode = b.digitalPassCode || b.passCode || (isConfirmed ? `COEP-PASS-${bookingId}` : null)

            return (
              <div
                key={bookingId}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Left Column: Venue Details */}
                  <div className="md:col-span-7 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {bookingId}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.attendees || 50} Attendees</span>
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>Dept: {venueDepartment}</span>
                      </span>
                      {(b.paymentStatus === 'Paid' || b.paidAmount || b.paymentId) && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shadow-2xs">
                            <CreditCard className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Paid ₹{b.paidAmount || b.amount || 1180} (Cashfree PG)</span>
                          </span>
                        </>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        {b.venueName || b.venue}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {b.purpose || 'Academic Session / Campus Event'}
                      </p>
                    </div>

                    {b.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        Special requirements: {b.notes}
                      </p>
                    )}
                  </div>

                  {/* Right Column: Schedule & Status Pill */}
                  <div className="md:col-span-5 flex flex-col md:items-end justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 w-full">
                    {/* Two-Tier Status Pill */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                        isConfirmed
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : isPendingDean
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : isPendingHod
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {isConfirmed && <Check className="w-3.5 h-3.5" />}
                      {isPendingDean && <Clock className="w-3.5 h-3.5 text-blue-500 animate-pulse" />}
                      {isPendingHod && <Clock className="w-3.5 h-3.5 text-amber-500" />}
                      {isCancelled && <X className="w-3.5 h-3.5" />}
                      <span>
                        {isConfirmed
                          ? 'Approved (Pass Active)'
                          : isPendingDean
                          ? 'Step 2: Awaiting Dean Clearance'
                          : isPendingHod
                          ? 'Step 1: Awaiting HOD Sanction'
                          : 'Cancelled'}
                      </span>
                    </span>

                    {/* Date & Time */}
                    <div className="text-left md:text-right space-y-0.5">
                      <div className="flex items-center md:justify-end gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{b.bookingDate || b.date}</span>
                      </div>
                      <div className="flex items-center md:justify-end gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.timeSlot || b.slot}</span>
                      </div>
                    </div>

                    {/* Action Buttons: View QR Pass or Cancel */}
                    <div className="flex items-center gap-2 pt-1">
                      {isConfirmed && (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedPass({
                              ...b,
                              digitalPassCode: passCode,
                              venue: b.venueName || b.venue
                            })
                          }
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs border border-transparent dark:border-slate-700"
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                          <span>View QR Pass</span>
                        </button>
                      )}

                      {!isCancelled && !isConfirmed && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(bookingId)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Cancel Reservation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Permission Progress Stepper */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {/* Stage 1: Submitted */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-[11px]">
                          1. Application Submitted
                        </div>
                        <div className="text-[10px] text-slate-500">Queued for review</div>
                      </div>
                    </div>

                    {/* Stage 2: HOD Review */}
                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        isConfirmed || isPendingDean
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                          : isPendingHod
                          ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60'
                      }`}
                    >
                      {isConfirmed || isPendingDean ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-[11px]">
                          2. {venueDepartment} HOD
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {isConfirmed || isPendingDean ? '✓ HOD Sanctioned' : 'Awaiting HOD sign-off'}
                        </div>
                      </div>
                    </div>

                    {/* Stage 3: Dean Clearance */}
                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        isConfirmed
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                          : isPendingDean
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60'
                      }`}
                    >
                      {isConfirmed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isPendingDean ? (
                        <Clock className="w-4 h-4 text-blue-500 shrink-0 animate-pulse" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-[11px]">
                          3. Dean Final Clearance
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {isConfirmed
                            ? '✓ Full Clearance Granted'
                            : isPendingDean
                            ? 'Awaiting Dean signature'
                            : 'Unlocks after HOD'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {filteredBookings.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 py-16 px-6 text-center text-slate-400 shadow-2xs space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No venue bookings found</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  You do not have any bookings matching this filter. Browse campus spaces to reserve rooms and get permissions.
                </p>
              </div>
              <button
                type="button"
                onClick={onExploreVenues}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Browse Campus Venues</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal: View Digital Pass Slip with Legit Scannable QR */}
        {selectedPass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {selectedPass.status || 'Approved'} Gate Pass
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">
                  {selectedPass.venue || selectedPass.venueName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedPass.purpose}</p>
              </div>

              {/* Real, Scannable QR Code */}
              <DigitalPassQR
                passCode={selectedPass.digitalPassCode}
                passData={selectedPass}
                userEmail={currentUser?.email}
                size={180}
              />

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-left space-y-1 font-mono text-slate-700 dark:text-slate-300">
                <div>
                  Pass Code: <strong className="text-blue-700 dark:text-blue-400">{selectedPass.digitalPassCode}</strong>
                </div>
                <div>
                  Slot: <span className="font-sans font-medium">{selectedPass.date || selectedPass.bookingDate} • {selectedPass.timeSlot || selectedPass.slot}</span>
                </div>
                <div>
                  Team: <span className="font-sans font-medium">{selectedPass.attendees || 50} Persons</span>
                </div>
                <div>
                  Pass Holder: <span className="font-sans font-medium">{currentUser?.name || 'Verified Student'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPass(null)}
                className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors border border-transparent dark:border-slate-700"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedGate>
  )
}
