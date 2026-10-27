import React, { useEffect } from 'react'
import {
  X,
  Building,
  Users,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Ban,
  Wrench,
  Edit,
  Tag
} from 'lucide-react'

export default function VenueDetailsModal({
  venue,
  isOpen,
  onClose,
  onEdit,
  onToggleActive,
  onToggleMaintenance,
  onBlockVenue,
  bookings = []
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !venue) return null

  // Find reservations matching this venue
  const venueBookings = bookings.filter((b) => {
    const vName = (venue.name || '').toLowerCase()
    const vCode = (venue.code || venue.id || '').toLowerCase()
    const bVenue = (b.venueName || '').toLowerCase()
    return bVenue.includes(vCode) || bVenue.includes(vName) || vName.includes(bVenue)
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Available
          </span>
        )
      case 'Occupied':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3 h-3" />
            Occupied
          </span>
        )
      case 'Under Maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Wrench className="w-3 h-3" />
            Under Maintenance
          </span>
        )
      case 'Blocked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <Ban className="w-3 h-3" />
            Blocked
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="venue-details-title"
      >
        {/* Header with image banner */}
        <div className="relative h-44 sm:h-52 bg-slate-900 shrink-0 overflow-hidden">
          <img
            src={venue.image || '/coep_building.png'}
            alt={venue.name}
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = '/coep_building.png'
            }}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/50 backdrop-blur-xs"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-blue-600/90 text-white">
                {venue.code || venue.id}
              </span>
              {getStatusBadge(venue.status)}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  venue.isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {venue.isActive ? 'Active Status' : 'Inactive'}
              </span>
            </div>
            <h2 id="venue-details-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {venue.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5 mt-0.5">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>{venue.building}</span>
              <span>•</span>
              <span>{venue.department}</span>
            </p>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>Seating</span>
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {venue.capacity} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">seats</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {venue.benches ? `${venue.benches} benches` : 'Standard row layout'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                <span>Venue Type</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                {venue.type}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Primary facility
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Building</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                {venue.building}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {venue.department}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Reservations</span>
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {venueBookings.length} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">scheduled</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Active schedule
              </div>
            </div>
          </div>

          {/* Description */}
          {venue.description && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Description & Allocation Policies
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                {venue.description}
              </p>
            </div>
          )}

          {/* Features and Installed Equipment */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Installed Equipment & Amenities</span>
            </h3>
            {venue.features && venue.features.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {venue.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 text-xs font-semibold"
                  >
                    <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
                    <span>{feature}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No special equipment listed.</p>
            )}
          </div>

          {/* Current & Upcoming Reservations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Current & Upcoming Reservations ({venueBookings.length})</span>
              </h3>
            </div>

            {venueBookings.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  No upcoming reservations scheduled for this venue.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  The space is clear for academic lectures, club gatherings, or maintenance blocks.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {venueBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {b.purpose}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'Confirmed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : b.status === 'Pending'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{b.applicantName}</span>
                        <span>•</span>
                        <span>{b.department}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px]">{b.id}</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center sm:justify-end gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{b.bookingDate}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center sm:justify-end gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{b.timeSlot}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onToggleActive(venue.id)
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                venue.isActive
                  ? 'border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                  : 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
              }`}
            >
              {venue.isActive ? 'Deactivate Venue' : 'Activate Venue'}
            </button>

            <button
              type="button"
              onClick={() => {
                onToggleMaintenance(venue.id)
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50"
            >
              {venue.status === 'Under Maintenance' ? 'Clear Maintenance' : 'Set Under Maintenance'}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose()
                if (onBlockVenue) onBlockVenue(venue)
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 flex items-center gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Block Venue</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => {
                onClose()
                onEdit(venue)
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Venue</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

