import React, { useState, useEffect, useMemo } from 'react'
import {
  X,
  Ban,
  AlertTriangle,
  CheckCircle2,
  Repeat
} from 'lucide-react'
import { BLOCK_TYPES, DEPARTMENTS_LIST } from './mockAdminData'

// Helper to convert time strings (e.g. "09:00 AM" or "14:30") to minutes from midnight
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0
  const clean = timeStr.trim().toLowerCase()
  const isPM = clean.includes('pm')
  const isAM = clean.includes('am')
  const raw = clean.replace(/[apm\s]/g, '')
  const parts = raw.split(':')
  let hours = parseInt(parts[0], 10) || 0
  const minutes = parseInt(parts[1], 10) || 0

  if (isPM && hours < 12) hours += 12
  if (isAM && hours === 12) hours = 0
  return hours * 60 + minutes
}

// Helper to parse "09:00 AM - 11:00 AM" into [startMinutes, endMinutes]
export function parseTimeSlot(slotStr) {
  if (!slotStr) return [0, 0]
  const [start, end] = slotStr.split('-').map((s) => s.trim())
  return [parseTimeToMinutes(start), parseTimeToMinutes(end)]
}

export default function VenueBlockModal({
  isOpen,
  onClose,
  onSaveBlock,
  venues = [],
  existingBookings = [],
  existingTimetable = [],
  preselectedVenue = null
}) {
  const [venueId, setVenueId] = useState('')
  const [activityTitle, setActivityTitle] = useState('')
  const [date, setDate] = useState('2026-10-26')
  const [startTime, setStartTime] = useState('09:00 AM')
  const [endTime, setEndTime] = useState('11:00 AM')
  const [blockType, setBlockType] = useState('Maintenance')
  const [reason, setReason] = useState('')
  const [faculty, setFaculty] = useState('')
  const [department, setDepartment] = useState('')
  const [recurrence, setRecurrence] = useState('none') // 'none' | 'weekly'
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('2026-11-30')

  const [formErrors, setFormErrors] = useState({})
  const [isConfirming, setIsConfirming] = useState(false)

  // Initialize or reset form
  useEffect(() => {
    if (isOpen) {
      if (preselectedVenue) {
        setVenueId(preselectedVenue.id)
        setDepartment(preselectedVenue.department || '')
      } else if (venues.length > 0 && !venueId) {
        setVenueId(venues[0].id)
        setDepartment(venues[0].department || '')
      }
      setIsConfirming(false)
      setFormErrors({})
    }
  }, [isOpen, preselectedVenue, venues])

  // Update department when venue changes
  const handleVenueChange = (newVenueId) => {
    setVenueId(newVenueId)
    const found = venues.find((v) => v.id === newVenueId)
    if (found && !department) {
      setDepartment(found.department)
    }
  }

  // Selected venue object
  const selectedVenue = useMemo(() => {
    return venues.find((v) => v.id === venueId)
  }, [venues, venueId])

  // Conflict Detection Engine
  const conflicts = useMemo(() => {
    if (!selectedVenue || !date || !startTime || !endTime) return []

    const startMin = parseTimeToMinutes(startTime)
    const endMin = parseTimeToMinutes(endTime)
    if (endMin <= startMin) return []

    const foundConflicts = []
    const venueNameNorm = (selectedVenue.name || '').toLowerCase()
    const venueCodeNorm = (selectedVenue.code || selectedVenue.id || '').toLowerCase()

    // 1. Check against existing bookings
    existingBookings.forEach((b) => {
      if (b.status === 'Cancelled' || b.status === 'Rejected') return

      const bVenueNorm = (b.venueName || '').toLowerCase()
      const matchesVenue =
        bVenueNorm.includes(venueNameNorm) ||
        venueNameNorm.includes(bVenueNorm) ||
        bVenueNorm.includes(venueCodeNorm)

      if (matchesVenue && b.bookingDate === date) {
        const [bStartMin, bEndMin] = parseTimeSlot(b.timeSlot)
        // Overlap: !(endMin <= bStartMin || startMin >= bEndMin)
        if (!(endMin <= bStartMin || startMin >= bEndMin)) {
          foundConflicts.push({
            id: b.id,
            type: 'Booking Reservation',
            title: b.purpose || 'Campus Reservation',
            organizer: b.applicantName,
            timeSlot: b.timeSlot,
            date: b.bookingDate,
            severity: 'high'
          })
        }
      }
    })

    // 2. Check against existing timetable blocks
    existingTimetable.forEach((t) => {
      const tVenueNorm = (t.venueName || '').toLowerCase()
      const matchesVenue =
        tVenueNorm.includes(venueNameNorm) ||
        venueNameNorm.includes(tVenueNorm) ||
        (t.venueId && t.venueId === selectedVenue.id)

      if (matchesVenue && t.date === date) {
        const tStartMin = parseTimeToMinutes(t.startTime)
        const tEndMin = parseTimeToMinutes(t.endTime)
        if (!(endMin <= tStartMin || startMin >= tEndMin)) {
          foundConflicts.push({
            id: t.id,
            type: t.blockType || 'Scheduled Block',
            title: t.title,
            organizer: t.faculty || t.department || 'Institute',
            timeSlot: `${t.startTime} - ${t.endTime}`,
            date: t.date,
            severity: 'warning'
          })
        }
      }
    })

    return foundConflicts
  }, [selectedVenue, date, startTime, endTime, existingBookings, existingTimetable])

  // Form Validation
  const validateForm = () => {
    const errors = {}
    if (!venueId) errors.venueId = 'Please select a venue.'
    if (!activityTitle.trim()) errors.activityTitle = 'Activity title or block label is required.'
    if (!date) errors.date = 'Date is required.'
    if (!startTime) errors.startTime = 'Start time is required.'
    if (!endTime) errors.endTime = 'End time is required.'

    const startMin = parseTimeToMinutes(startTime)
    const endMin = parseTimeToMinutes(endTime)
    if (endMin <= startMin) {
      errors.endTime = 'End time must be later than start time.'
    }

    if (recurrence === 'weekly' && !recurrenceEndDate) {
      errors.recurrenceEndDate = 'Recurrence end date is required for weekly recurring blocks.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleProceedToConfirm = (e) => {
    e.preventDefault()
    if (validateForm()) {
      setIsConfirming(true)
    }
  }

  const handleFinalSave = () => {
    const blockPayload = {
      id: `BLK-${Date.now().toString().slice(-4)}`,
      venueId: selectedVenue.id,
      venueName: selectedVenue.name,
      title: activityTitle.trim(),
      date,
      startTime,
      endTime,
      blockType,
      reason: reason.trim(),
      faculty: faculty.trim(),
      department: department.trim() || selectedVenue.department,
      recurrence,
      recurrenceEndDate: recurrence === 'weekly' ? recurrenceEndDate : null,
      createdAt: new Date().toISOString()
    }

    onSaveBlock(blockPayload)
    onClose()
  }

  if (!isOpen) return null

  const TIME_OPTIONS = [
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '08:00 PM'
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="block-modal-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h2 id="block-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                {isConfirming ? 'Confirm Venue Time Slot Block' : 'Block Venue / Schedule Activity'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reserve academic lectures, examinations, maintenance windows, or institute holds.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body or Confirmation Screen */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {!isConfirming ? (
            <form onSubmit={handleProceedToConfirm} className="space-y-4">
              {/* Venue Selection & Block Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Venue <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={venueId}
                    onChange={(e) => handleVenueChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 cursor-pointer"
                  >
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.code || v.id}) • {v.capacity} seats
                      </option>
                    ))}
                  </select>
                  {formErrors.venueId && (
                    <p className="text-[11px] text-rose-500 mt-1">{formErrors.venueId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Block Category / Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={blockType}
                    onChange={(e) => setBlockType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 cursor-pointer"
                  >
                    {BLOCK_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title / Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Activity Title / Block Reason <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="e.g. CS201 Data Structures Lecture or Annual Electrical Transformer Maintenance"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
                {formErrors.activityTitle && (
                  <p className="text-[11px] text-rose-500 mt-1">{formErrors.activityTitle}</p>
                )}
              </div>

              {/* Reason / Description Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason or Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide operational details, lecture topic, or justification for holding this space..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              {/* Timing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                  {formErrors.date && (
                    <p className="text-[11px] text-rose-500 mt-1">{formErrors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 cursor-pointer"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 cursor-pointer"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {formErrors.endTime && (
                    <p className="text-[11px] text-rose-500 mt-1">{formErrors.endTime}</p>
                  )}
                </div>
              </div>

              {/* Optional Faculty & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty / Instructor (Optional)
                  </label>
                  <input
                    type="text"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    placeholder="e.g. Dr. V. K. Kulkarni"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department (Optional)
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 cursor-pointer"
                  >
                    <option value="">Campus Central Estate</option>
                    {DEPARTMENTS_LIST.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recurrence Selection */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Recurrence Schedule
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="recurrence"
                        value="none"
                        checked={recurrence === 'none'}
                        onChange={() => setRecurrence('none')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span>One-Time Only</span>
                    </label>

                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="recurrence"
                        value="weekly"
                        checked={recurrence === 'weekly'}
                        onChange={() => setRecurrence('weekly')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span>Weekly (Semester Long)</span>
                    </label>
                  </div>
                </div>

                {recurrence === 'weekly' && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Repeats every week until:
                    </span>
                    <input
                      type="date"
                      value={recurrenceEndDate}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Conflict Warning Box (If any overlap is detected) */}
              {conflicts.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      Potential Schedule Overlaps Detected ({conflicts.length})
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300/90 leading-relaxed">
                    The requested block overlaps with existing reservations or timetable slots below. The system will never silently remove existing bookings:
                  </p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {conflicts.map((c, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-800/90 border border-amber-200/80 dark:border-amber-800/80 text-xs flex items-center justify-between gap-2"
                      >
                        <div>
                          <strong className="text-slate-900 dark:text-white">{c.title}</strong>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {c.type} • {c.organizer}
                          </div>
                        </div>
                        <div className="text-right text-[11px] font-mono shrink-0">
                          <span className="text-amber-700 dark:text-amber-400 font-bold">{c.timeSlot}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-amber-700 dark:text-amber-300 italic">
                    Note: Backend conflict prevention policies will be enforced in production.
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* Confirmation Screen */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-2">
                <div className="text-xs font-bold text-purple-900 dark:text-purple-300">
                  Please confirm the following block details:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Venue:</span>
                    <strong className="text-slate-900 dark:text-white">{selectedVenue?.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Block Type:</span>
                    <span className="font-semibold text-purple-700 dark:text-purple-300">{blockType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date & Time:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {date} ({startTime} - {endTime})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Recurrence:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {recurrence === 'weekly' ? `Weekly until ${recurrenceEndDate}` : 'One-Time'}
                    </span>
                  </div>
                </div>
              </div>

              {conflicts.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
                  <strong>Notice:</strong> This block has {conflicts.length} overlapping activities. Conflicting reservations will remain flagged for administrator arbitration.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (isConfirming) {
                setIsConfirming(false)
              } else {
                onClose()
              }
            }}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isConfirming ? 'Back to Edit' : 'Cancel'}
          </button>

          {!isConfirming ? (
            <button
              type="button"
              onClick={handleProceedToConfirm}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Review & Confirm Block</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSave}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save & Enforce Block</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

