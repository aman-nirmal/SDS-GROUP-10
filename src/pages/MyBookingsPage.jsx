import React, { useState } from 'react'
import {
  ArrowLeft,
  RefreshCw,
  Calendar,
  Building,
  Users,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'

export default function MyBookingsPage({
  bookings = [],
  isLoading = false,
  error = null,
  onRefresh,
  onCancelBooking,
  onBackHome,
  onExploreVenues,
  currentUser
}) {
  const [activeFilter, setActiveFilter] = useState('All')

  const allBookings = Array.isArray(bookings) ? bookings : []

  const filteredBookings = allBookings.filter((b) => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'Confirmed') return b.status === 'Confirmed' || b.status === 'Approved'
    if (activeFilter === 'Pending') return b.status === 'Pending' || b.status === 'Under Review'
    if (activeFilter === 'Cancelled') return b.status === 'Cancelled' || b.status === 'Rejected'
    return b.status === activeFilter
  })

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            type="button"
            onClick={onBackHome}
            className="group text-xs font-bold text-blue-600 hover:text-blue-700 mb-2 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Venue Bookings
            </h1>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                title="Refresh Bookings from Supabase"
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {currentUser?.email ? (
              <span>Account: <strong className="text-slate-700 dark:text-slate-300">{currentUser.email}</strong> • {currentUser.role}</span>
            ) : (
              <span>Track your slot confirmations, approved timings, and reservation slips across campus.</span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={onExploreVenues}
          className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Error state alert */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>Could not refresh reservations from database: {error}</span>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200/80 dark:border-slate-800 pb-3 overflow-x-auto">
        {['All', 'Confirmed', 'Pending', 'Cancelled'].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setActiveFilter(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              activeFilter === status
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold">Loading your reservations from Supabase...</p>
        </div>
      ) : (
        /* Bookings List */
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isConfirmed = b.status === 'Confirmed' || b.status === 'Approved'
            const isPending = b.status === 'Pending' || b.status === 'Under Review'
            const isCancelled = b.status === 'Cancelled' || b.status === 'Rejected'

            return (
              <div
                key={b.ref || b.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                      {b.ref || b.booking_ref}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {b.venueName || b.venue_name}
                    </span>
                    {(b.oldName || b.old_venue_name) && (
                      <span className="text-xs text-slate-400">
                        ({b.oldName || b.old_venue_name})
                      </span>
                    )}
                    {b.club_name && (
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        {b.club_name}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isConfirmed
                          ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800'
                          : isPending
                          ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800'
                          : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isConfirmed ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                      ></span>
                      {b.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {b.purpose || b.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateDisplay(b.date || b.booking_date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {b.slot || b.time_slot}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {b.department}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {b.applicantName || b.applicant_name} ({b.capacity || b.attendees || 1} cap)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-0 border-slate-100 dark:border-slate-800">
                  {onCancelBooking && !isCancelled && (
                    <button
                      type="button"
                      onClick={() => onCancelBooking(b.ref || b.id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel Reservation
                    </button>
                  )}
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    COEP Admin Verified
                  </span>
                </div>
              </div>
            )
          })}

          {filteredBookings.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              {allBookings.length === 0 ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    No Reservations Yet
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto">
                    You have not reserved any venues. Check venue availability across campus to book a classroom, hall, or lab.
                  </p>
                  <button
                    type="button"
                    onClick={onExploreVenues}
                    className="mt-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Explore & Reserve Venues</span>
                  </button>
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                  No bookings found with status "{activeFilter}".
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
