import React, { useState } from 'react'
import {
  X,
  Building,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Check,
  AlertCircle,
  GraduationCap,
  Mail,
  Lock,
  ArrowRight
} from 'lucide-react'
import {
  getVenueImageUrl,
  getVenueFaculty,
  formatDateDisplay,
  classroomTimeSlots
} from '../../utils/venueUtils'

export default function VenueBookingModal({ venue, defaultDate, onClose, onSubmitBooking, currentUser }) {
  const [date, setDate] = useState(defaultDate || '2026-10-16')
  const [selectedSlot, setSelectedSlot] = useState('12:30 PM - 01:30 PM')
  const [showSchedule, setShowSchedule] = useState(false)
  const [applicantName, setApplicantName] = useState(currentUser?.name || '')
  const [department, setDepartment] = useState(venue?.department || currentUser?.department || 'Computer Engineering')
  const [eventPurpose, setEventPurpose] = useState('')
  const [attendees, setAttendees] = useState(venue?.benches ? venue.benches * 2 : 50)
  const [submitted, setSubmitted] = useState(false)
  const [bookingRef, setBookingRef] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const isAuthorizedRole = Boolean(
    currentUser &&
    ['Administrator', 'Faculty', 'Club Lead', 'Club Member'].includes(currentUser.role)
  )

  const venueTitle = venue?.new_hall_name || venue?.old_hall_name || 'Selected Venue'
  const venuePhoto = getVenueImageUrl(venue)
  const faculty = getVenueFaculty(venue)
  const capacity = venue?.capacity || (venue?.benches ? venue.benches * 2 : 60)
  const benches = venue?.benches || Math.round(capacity / 2)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!applicantName || !eventPurpose || isSubmitting) return

    if (!isAuthorizedRole) {
      setSubmitError('You do not have permission to book this venue. Venue reservation is restricted to Faculty, Club Leads, and Administrators.')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const email = currentUser?.email ||
        (applicantName.toLowerCase().replace(/[^a-z0-9]/g, '.') + '@coeptech.ac.in')

      const bookingPayload = {
        venueName: venue?.new_hall_name || venue?.old_hall_name || 'COEP Venue',
        oldName: venue?.old_hall_name,
        department,
        applicantName,
        applicantEmail: email,
        date,
        slot: selectedSlot,
        purpose: eventPurpose,
        capacity: attendees,
        facultyInCharge: faculty.name,
        status: 'Confirmed'
      }

      let generatedRef = 'LOCUS-' + Math.floor(100000 + Math.random() * 900000)

      if (onSubmitBooking) {
        const result = await onSubmitBooking(bookingPayload)
        if (result && (result.ref || result.booking_ref)) {
          generatedRef = result.ref || result.booking_ref
        }
      }

      setBookingRef(generatedRef)
      setSubmitted(true)
    } catch (err) {
      console.error('Booking submission error:', err)
      setSubmitError(err.message || 'Database booking submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 my-6 flex flex-col text-slate-900 dark:text-slate-100"
      >
        {submitted ? (
          <div className="p-8 text-center py-10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <CheckCircle2 className="w-9 h-9 stroke-[2]" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">
              Reservation Confirmed
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              Slot Reserved Successfully!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed max-w-md mx-auto">
              Your venue reservation for <strong className="text-slate-900 dark:text-white">{venueTitle}</strong> on{' '}
              <strong className="text-slate-900 dark:text-white">{formatDateDisplay(date)}</strong> ({selectedSlot}) has been registered.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-left mb-6 space-y-3 max-w-lg mx-auto">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Reference Code:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">{bookingRef}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Applicant:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{applicantName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Department:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{department}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Faculty In-Charge Notified:</span>
                <span className="font-bold text-blue-700 dark:text-blue-400">{faculty.name} ({faculty.email})</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/80 dark:border-slate-700/80">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Official Request Logged
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-8 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all duration-200 cursor-pointer shadow-xs"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <div>
            {/* 1. Large Image Banner Header */}
            <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-900">
              <img
                src={venuePhoto}
                alt={venueTitle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/coep_building.png'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-black/20" />

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="text-xs font-black tracking-wide text-white bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 shadow-xs">
                  {venue?.new_hall_name || 'Passage Hall'}
                </span>
                <span className="text-[11px] font-bold text-blue-200 bg-blue-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-blue-400/20">
                  {venue?.type || 'Classrooms'}
                </span>
              </div>

              {/* Banner Title & Department */}
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">
                  {venue?.old_hall_name || venue?.new_hall_name}
                </h2>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-200 mt-1">
                  <Building className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  <span>{venue?.department || 'COEP Campus'}</span>
                  {venue?.old_hall_name && venue.new_hall_name && (
                    <span>&bull; Hall Code: {venue.new_hall_name}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-5">
              {/* 2. Venue Specifications Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                    Capacity
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">{capacity} Persons</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                    Benches
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">{benches} Benches</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                    Category
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate block">{venue?.type || 'Classrooms'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                    Status
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Available Now
                  </span>
                </div>
              </div>

              {/* 3. Concise Faculty In-Charge */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Faculty In-Charge:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{faculty.name}</span>
                </div>
                <a
                  href={`mailto:${faculty.email}`}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-[11px] font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  {faculty.email}
                </a>
              </div>

              {/* 4. Installed Facilities & Amenities */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                  Installed Classroom Facilities:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(venue?.features || [
                    'Overhead Projector',
                    'PA Sound System',
                    'Air Conditioned',
                    'Wi-Fi 6'
                  ]).map((feat, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-slate-200/70 dark:border-slate-700"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* 5. Slot Reservation Form */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Date & Time Slot */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      1. Reservation Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        2. Time Slot
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSchedule(!showSchedule)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{showSchedule ? 'Hide Timetable' : 'View Timetable'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSchedule ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Expandable Daily Timetable Strip */}
                    {showSchedule && (
                      <div className="mb-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs animate-in fade-in duration-150">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                          <span>Lecture Hours (10:30 AM – 5:30 PM)</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Green = Free for booking</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium">
                            <span className="font-bold block">08:30 – 10:30 AM</span> Free
                          </div>
                          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-medium line-through">
                            <span className="font-bold block">10:30 – 12:30 PM</span> Lecture
                          </div>
                          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium">
                            <span className="font-bold block">12:30 – 02:30 PM</span> Free Gaps
                          </div>
                          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-medium line-through">
                            <span className="font-bold block">02:30 – 04:30 PM</span> Practical
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Clean Simple Time Slot Buttons (Bottom Options) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {classroomTimeSlots.map((slot, i) => {
                        const isFree = slot.status === 'free'
                        const isSelected = selectedSlot === slot.time
                        return isFree ? (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedSlot(slot.time)}
                            className={`p-2.5 rounded-xl text-xs font-semibold border text-left cursor-pointer transition-colors flex items-center justify-between ${isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-slate-700/60'
                              }`}
                          >
                            <span className="dark:text-slate-100">{slot.time}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-white" />}
                          </button>
                        ) : (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 line-through flex items-center justify-between cursor-not-allowed select-none"
                            title="Occupied for regular classes"
                          >
                            <span>{slot.time}</span>
                            <span className="text-[10px] text-rose-500 dark:text-rose-400 font-semibold">{slot.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Applicant Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Applicant / Faculty Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="e.g. Prof. R. Sharma / Student"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Applicant Department
                      </label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Event Purpose */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Event Purpose / Session Topic *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventPurpose}
                      onChange={(e) => setEventPurpose(e.target.value)}
                      placeholder="e.g. Guest Lecture, Lab Tutorial, Club Meeting"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>
                      Venue Capacity: <strong className="dark:text-slate-200">{capacity} Persons</strong> ({benches} Benches)
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Instant Campus Approval
                    </span>
                  </div>

                  {/* Role Restriction Banner for Students & Guests */}
                  {!isAuthorizedRole && (
                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
                      <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">Booking Restricted</span>
                        <span>
                          You do not have permission to book this venue. Venue reservation is restricted to Faculty, Club Leads, and Administrators. You may view venue capacity and schedules.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error Banner */}
                  {submitError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Submit / Cancel Buttons */}
                  <div className="pt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      {isAuthorizedRole ? 'Cancel' : 'Close Preview'}
                    </button>
                    {isAuthorizedRole ? (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs transition-all shadow-sm cursor-pointer inline-flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Confirming Reservation...</span>
                          </>
                        ) : (
                          <>
                            <span>Confirm Reservation</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-bold text-xs cursor-not-allowed inline-flex items-center justify-center gap-2"
                        title="You do not have permission to book this venue."
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Booking Restricted</span>
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
