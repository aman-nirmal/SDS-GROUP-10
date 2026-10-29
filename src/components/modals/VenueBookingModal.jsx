import React, { useState, useEffect, useMemo } from 'react'
import {
  X,
  Calendar,
  Clock,
  Building,
  Check,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  CreditCard,
  Receipt,
  ShieldCheck,
  Images,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  FlaskConical,
  Camera,
  RefreshCw,
  MapPin,
  Mail,
  AlertTriangle
} from 'lucide-react'
import { paymentsApi, bookingsApi } from '../../lib/api'
import {
  formatDateDisplay,
  isLabVenue,
  isClassroomVenue,
  getVenueImages,
  getVenueFaculty,
  classroomTimeSlots,
  extractNumericPrice,
  isDepartmentMatch,
  isAcClassroom
} from '../../utils/venueHelpers'

export default function VenueBookingModal({ venue, defaultDate, onClose, onSubmitBooking, currentUser }) {
  const isFaculty = currentUser?.role === 'Faculty'
  const isLab = isLabVenue(venue)
  const isClassroom = isClassroomVenue(venue)
  const isAC = isAcClassroom(venue)
  const isHomeDept = isDepartmentMatch(currentUser?.department, venue?.department)

  const [date, setDate] = useState(defaultDate || '2026-10-16')
  const [selectedSlot, setSelectedSlot] = useState('12:30 PM - 01:30 PM')
  const [showSchedule, setShowSchedule] = useState(false)
  const [applicantName, setApplicantName] = useState(currentUser?.name || '')
  const [department, setDepartment] = useState(venue?.department || currentUser?.department || 'Computer Engineering')
  const [bookingCategory, setBookingCategory] = useState(isFaculty ? 'lecture' : 'event')
  const [eventPurpose, setEventPurpose] = useState('')
  const [attendees, setAttendees] = useState(venue?.benches ? venue.benches * 2 : 50)
  const [applicantPhone, setApplicantPhone] = useState(currentUser?.phone || '')
  const [submitted, setSubmitted] = useState(false)
  const [bookingRef, setBookingRef] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [conflictError, setConflictError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const venuePhotos = useMemo(() => getVenueImages(venue), [venue])
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)

  useEffect(() => {
    setActivePhotoIdx(0)
  }, [venue])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : venuePhotos.length - 1))
      } else if (e.key === 'ArrowRight') {
        setActivePhotoIdx((prev) => (prev < venuePhotos.length - 1 ? prev + 1 : 0))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [venuePhotos])

  const prevPhoto = (e) => {
    e?.stopPropagation()
    setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : venuePhotos.length - 1))
  }

  const nextPhoto = (e) => {
    e?.stopPropagation()
    setActivePhotoIdx((prev) => (prev < venuePhotos.length - 1 ? prev + 1 : 0))
  }

  const venueTitle = isAC
    ? (venue?.new_hall_name || venue?.code || 'NC01')
    : (venue?.new_hall_name || venue?.old_hall_name || 'Selected Venue')
  const faculty = getVenueFaculty(venue)
  const capacity = venue?.capacity || (venue?.benches ? venue.benches * 2 : 60)
  const benches = venue?.benches || Math.round(capacity / 2)
  const priceDisplay = venue?.price || (Array.isArray(venue?.features) && venue.features.find((f) => typeof f === 'string' && f.startsWith('₹')))
  const termsDisplay = venue?.terms || (venue?.description && venue.description.includes('Terms:') ? venue.description.split('Terms:')[1]?.trim() : (venue?.description && venue.description.includes('ONLY FOR BHAU STARTUPS') ? 'ONLY FOR BHAU STARTUPS. Max 2 hours at a time, gap of an hour between next booking, max 7 days in advance, max 12 hrs/week. Eatables not allowed.' : null))

  const numericPrice = extractNumericPrice(priceDisplay)
  const isPaidVenue = Boolean(numericPrice && numericPrice > 0)

  // Faculty can book classrooms (in their department only) and it will be instant approved.
  // For any event (or outside their department or non-classroom), they need permission from HOD and Dean.
  // For laboratories, 3-stage governance is ALWAYS required (Lab Assistant -> HOD -> Dean).
  const isEvent = bookingCategory === 'event' || /event|seminar|symposium|fest|hackathon|workshop|conference|cultural/i.test(eventPurpose)
  const isFacultyInstantApproved = isFaculty && isClassroom && isHomeDept && !isEvent && !isPaidVenue && !isLab

  // Query live database availability whenever venue or date changes
  useEffect(() => {
    let isMounted = true
    async function loadAvailability() {
      if (!venueTitle || !date) return
      setIsLoadingSlots(true)
      setConflictError('')
      try {
        const res = await bookingsApi.getAvailability(venueTitle, date)
        if (isMounted && res && Array.isArray(res.bookedSlots)) {
          setBookedSlots(res.bookedSlots)
        }
      } catch (err) {
        console.warn('[Supabase Availability Fetch]', err)
      } finally {
        if (isMounted) setIsLoadingSlots(false)
      }
    }
    loadAvailability()
    return () => {
      isMounted = false
    }
  }, [venueTitle, date])

  // Merge default institutional timetable with live database reservations
  const computedTimeSlots = useMemo(() => {
    return classroomTimeSlots.map((slot) => {
      const match = bookedSlots.find((b) => b.timeSlot === slot.time)
      if (match) {
        return {
          time: slot.time,
          status: 'occupied',
          label: 'Reserved',
          purpose: match.purpose || 'Reserved Slot',
          bookingStatus: match.status
        }
      }
      return slot
    })
  }, [bookedSlots])

  // Auto-switch away if currently selected slot is already booked in database
  useEffect(() => {
    const isOccupied = computedTimeSlots.some((s) => s.time === selectedSlot && s.status === 'occupied')
    if (isOccupied) {
      const firstFree = computedTimeSlots.find((s) => s.status === 'free')
      if (firstFree) {
        setSelectedSlot(firstFree.time)
      }
    }
  }, [computedTimeSlots, selectedSlot])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!applicantName || !eventPurpose) return
    setPaymentError('')
    setConflictError('')
    setIsSubmitting(true)

    // Check if selected slot is already occupied
    const slotObj = computedTimeSlots.find((s) => s.time === selectedSlot)
    if (slotObj && slotObj.status === 'occupied') {
      setConflictError(
        `Time slot conflict: ${venueTitle} is already reserved for "${slotObj.purpose || 'Campus Activity'}" on ${formatDateDisplay(date)} (${selectedSlot}). Please pick an open time slot.`
      )
      setIsSubmitting(false)
      return
    }

    const refNumber = 'LOCUS-' + (isPaidVenue ? 'CF-' : '') + Math.floor(100000 + Math.random() * 900000)

    // Handle Paid Venues via Cashfree Production Payment Gateway
    if (isPaidVenue) {
      setIsProcessingPayment(true)
      try {
        const orderRes = await paymentsApi.createOrder({
          venueId: venue?.id,
          venueName: venueTitle,
          rawTariff: priceDisplay,
          amount: numericPrice,
          applicantName,
          applicantEmail: currentUser?.email || 'student@coeptech.ac.in',
          applicantPhone: applicantPhone || '9876543210',
          bookingDate: date,
          timeSlot: selectedSlot,
          purpose: eventPurpose
        })

        if (!orderRes || !orderRes.paymentSessionId) {
          throw new Error(orderRes?.error || 'Unable to initialize Cashfree payment gateway session.')
        }

        const finalizePaidBooking = (paymentInfo = null) => {
          const paymentRecord = {
            orderId: orderRes.orderId,
            cfOrderId: orderRes.cfOrderId,
            amount: numericPrice,
            currency: 'INR',
            paymentId: paymentInfo?.cf_payment_id || orderRes.orderId,
            paidAt: new Date().toISOString()
          }
          setPaymentSuccess(paymentRecord)
          setBookingRef(refNumber)
          setSubmitted(true)

          if (onSubmitBooking) {
            onSubmitBooking({
              id: refNumber,
              ref: refNumber,
              venueName: venueTitle,
              venue: venueTitle,
              oldName: venue?.old_hall_name,
              department,
              venueDepartment: department,
              applicantName,
              applicantEmail: currentUser?.email || 'student@coeptech.ac.in',
              applicantRole: currentUser?.role || 'Student',
              applicantPhone: applicantPhone || '9876543210',
              date,
              bookingDate: date,
              slot: selectedSlot,
              timeSlot: selectedSlot,
              purpose: eventPurpose,
              capacity: Number(attendees) || 50,
              attendees: Number(attendees) || 50,
              facultyInCharge: faculty.name,
              status: 'Pending HOD Approval',
              approvalStage: 'HOD',
              paymentStatus: 'Paid',
              paidAmount: numericPrice,
              paymentId: paymentRecord.paymentId,
              paymentGateway: 'Cashfree PG (Production)',
              cfOrderId: orderRes.cfOrderId,
              submittedAt: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
          }
        }

        // Trigger Cashfree JS Modal Checkout
        if (typeof window !== 'undefined' && window.Cashfree) {
          try {
            const cashfree = window.Cashfree({ mode: 'production' })
            cashfree.checkout({
              paymentSessionId: orderRes.paymentSessionId,
              redirectTarget: '_modal'
            }).then(async (result) => {
              if (result.error) {
                console.warn('[Cashfree Modal Result Error]', result.error)
                setPaymentError(result.error.message || 'Payment window closed or incomplete.')
                setIsProcessingPayment(false)
                return
              }
              finalizePaidBooking(result.paymentDetails)
              setIsProcessingPayment(false)
            }).catch(async (err) => {
              console.warn('[Cashfree Modal Catch]', err)
              // Verify backend for payment status in case redirect occurred
              try {
                const verifyRes = await paymentsApi.verify(orderRes.orderId, refNumber)
                if (verifyRes.isPaid) {
                  finalizePaidBooking(verifyRes.paymentDetails)
                } else {
                  setPaymentError('Payment was not completed. Please try again.')
                }
              } catch {
                setPaymentError('Payment session ended. Please re-try payment.')
              }
              setIsProcessingPayment(false)
            })
          } catch (sdkErr) {
            console.error('[Cashfree SDK Error]', sdkErr)
            setPaymentError('Could not launch payment modal: ' + sdkErr.message)
            setIsProcessingPayment(false)
          }
        } else {
          // Direct fallback to Cashfree checkout
          window.location.href = `https://payments.cashfree.com/order/#${orderRes.paymentSessionId}`
        }
      } catch (err) {
        console.error('[Payment Order Error]', err)
        setPaymentError(err.message || 'Failed to connect to Cashfree payment gateway.')
        setIsProcessingPayment(false)
      }
      return
    }

    // Standard Free Campus Venue Flow
    const initialStatus = isLab
      ? 'Pending Lab Assistant Approval'
      : isFacultyInstantApproved
        ? 'Confirmed'
        : 'Pending HOD Approval'

    const approvalStage = isLab
      ? 'LabAssistant'
      : isFacultyInstantApproved
        ? 'Completed'
        : 'HOD'

    const passCode = isFacultyInstantApproved ? `COEP-PASS-${refNumber}` : null
    const bookingNotes = isLab
      ? '3-Stage Laboratory Clearance: Awaiting Lab Assistant Technical & Safety Review'
      : isFacultyInstantApproved
        ? 'Instant Approved: Faculty Academic Lecture in Home Department'
        : ''

    const bookingPayload = {
      id: refNumber,
      ref: refNumber,
      venueName: venue?.new_hall_name || venue?.old_hall_name || 'COEP Venue',
      venue: venue?.new_hall_name || venue?.old_hall_name || 'COEP Venue',
      oldName: venue?.old_hall_name,
      department,
      venueDepartment: venue?.department || department,
      applicantName,
      applicantEmail: currentUser?.email || 'student@coeptech.ac.in',
      applicantRole: currentUser?.role || 'Student',
      date,
      bookingDate: date,
      slot: selectedSlot,
      timeSlot: selectedSlot,
      purpose: eventPurpose,
      category: bookingCategory,
      capacity: Number(attendees) || 50,
      attendees: Number(attendees) || 50,
      facultyInCharge: faculty.name,
      status: initialStatus,
      approvalStage,
      digitalPassCode: passCode,
      passCode,
      notes: bookingNotes,
      paymentStatus: 'Free',
      submittedAt: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    if (onSubmitBooking) {
      try {
        const res = await onSubmitBooking(bookingPayload)
        if (res && res.success === false) {
          setConflictError(res.error || 'This time slot is no longer available. Please select another slot.')
          setIsSubmitting(false)
          return
        }
      } catch (err) {
        setConflictError(err.message || 'Failed to complete reservation.')
        setIsSubmitting(false)
        return
      }
    }

    setBookingRef(refNumber)
    setSubmitted(true)
    setIsSubmitting(false)
  }

  if (!venue) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl xl:max-w-6xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 my-4 flex flex-col text-slate-900 dark:text-slate-100"
      >
        {submitted ? (
          <div className="p-8 text-center py-10 max-w-xl mx-auto">
            <div className={`w-16 h-16 rounded-2xl ${paymentSuccess || isFacultyInstantApproved ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' : isLab ? 'bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400' : 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'} flex items-center justify-center mx-auto mb-4 shadow-xs`}>
              <CheckCircle2 className="w-9 h-9 stroke-[2]" />
            </div>

            {paymentSuccess ? (
              <>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">
                  Cashfree Payment Verified &bull; Sanction Request Logged
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                  Payment of ₹{paymentSuccess.amount?.toLocaleString('en-IN')} Received!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed max-w-md mx-auto">
                  Your payment for <strong className="text-slate-900 dark:text-white">{venueTitle}</strong> on{' '}
                  <strong className="text-slate-900 dark:text-white">{formatDateDisplay(date)}</strong> has been verified via the official <strong className="text-slate-900 dark:text-white">Cashfree Payment Gateway (Production)</strong>. Request has been routed for Stage 1 HOD sanction.
                </p>
              </>
            ) : isFacultyInstantApproved ? (
              <>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">
                  Faculty Clearance &bull; Instant Approved
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                  Classroom Slot Confirmed!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed max-w-md mx-auto">
                  Your academic reservation for <strong className="text-slate-900 dark:text-white">{venueTitle}</strong> on{' '}
                  <strong className="text-slate-900 dark:text-white">{formatDateDisplay(date)}</strong> ({selectedSlot}) is <strong className="text-emerald-600 dark:text-emerald-400">instantly confirmed</strong> for your department ({currentUser?.department || venue?.department}). Digital gate pass has been activated in My Bookings.
                </p>
              </>
            ) : isLab ? (
              <>
                <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest block mb-1">
                  Stage 1 of 3: Laboratory Technical Clearance
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                  Lab Clearance Request Logged!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed max-w-md mx-auto">
                  Your reservation request for <strong className="text-slate-900 dark:text-white">{venueTitle}</strong> on{' '}
                  <strong className="text-slate-900 dark:text-white">{formatDateDisplay(date)}</strong> ({selectedSlot}) requires 3-stage governance. It has been routed to the <strong className="text-teal-600 dark:text-teal-400">Lab Assistant</strong> for technical & safety review. Once cleared, it will proceed to the <strong className="text-slate-900 dark:text-white">HOD</strong> and <strong className="text-slate-900 dark:text-white">Dean</strong>.
                </p>
              </>
            ) : (
              <>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-1">
                  Stage 1 of 2: Routed to Department HOD
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                  Sanction Request Logged!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed max-w-md mx-auto">
                  Your reservation request for <strong className="text-slate-900 dark:text-white">{venueTitle}</strong> on{' '}
                  <strong className="text-slate-900 dark:text-white">{formatDateDisplay(date)}</strong> ({selectedSlot}) has been routed to the <strong className="text-slate-900 dark:text-white">{venue?.department || department} Head of Department (HOD)</strong>. Once sanctioned by HOD, it will proceed to the Dean for final approval.
                </p>
              </>
            )}

            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-left mb-6 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Reference Code:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">{bookingRef}</span>
              </div>
              {paymentSuccess && (
                <>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Cashfree Order ID:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">{paymentSuccess.orderId}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Amount Paid:</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">₹{paymentSuccess.amount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Payment Gateway:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Cashfree PG (Production)</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Applicant:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{applicantName} ({currentUser?.role || 'Applicant'})</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Department:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{department}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Review Stage:</span>
                <span className="font-bold text-blue-700 dark:text-blue-400">Step 1: Department HOD &rarr; Step 2: Dean</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/80 dark:border-slate-700/80">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  {paymentSuccess ? 'Paid & Pending HOD Approval' : 'Pending HOD Approval'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              {paymentSuccess && (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 h-12 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-8 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all duration-200 cursor-pointer shadow-xs"
              >
                Done & Return
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Top Right Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 z-30 shadow-xs"
              title="Close"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Body with Wide Ergonomic 2-Column Desktop Grid */}
            <div className="p-5 sm:p-7 pt-6 sm:pt-7">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Left Column (5 cols): Photo Gallery (Top-Left), Venue Identity, Specs & Facilities */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Top-Left Photo Gallery Carousel */}
                  <div className="space-y-2">
                    <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-950 select-none group shadow-md border border-slate-200/80 dark:border-slate-800">
                      <img
                        key={activePhotoIdx}
                        src={venuePhotos[activePhotoIdx]}
                        alt={`${venueTitle} - Photo ${activePhotoIdx + 1}`}
                        className="w-full h-full object-cover transition-opacity duration-300"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = '/coep_building.png'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

                      {/* Left / Right Scroll Navigation Arrows */}
                      {venuePhotos.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={prevPhoto}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-md hover:scale-105 active:scale-95 z-20"
                            title="Previous photo (Left Arrow)"
                            aria-label="Previous photo"
                          >
                            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                          </button>
                          <button
                            type="button"
                            onClick={nextPhoto}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-md hover:scale-105 active:scale-95 z-20"
                            title="Next photo (Right Arrow)"
                            aria-label="Next photo"
                          >
                            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                          </button>
                        </>
                      )}

                      {/* Floating Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                        <span className="text-[11px] font-bold text-blue-200 bg-blue-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-blue-400/25 shrink-0 shadow-xs">
                          {venue?.type || 'Classrooms'}
                        </span>
                        {venuePhotos.length > 1 && (
                          <span className="text-[10px] font-bold text-white bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/15 flex items-center gap-1 shrink-0">
                            <Camera className="w-3 h-3 text-blue-400" />
                            {activePhotoIdx + 1} / {venuePhotos.length}
                          </span>
                        )}
                      </div>

                      {/* Dot Indicators */}
                      {venuePhotos.length > 1 && (
                        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 z-10 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                          {venuePhotos.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActivePhotoIdx(idx)}
                              className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === activePhotoIdx ? 'w-4 bg-blue-500' : 'w-1.5 bg-white/50 hover:bg-white'
                                }`}
                              aria-label={`Slide ${idx + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Horizontal Thumbnail Views Bar */}
                    {venuePhotos.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-0.5">
                          <Images className="w-3 h-3 text-blue-500" />
                          Views ({venuePhotos.length}):
                        </span>
                        {venuePhotos.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActivePhotoIdx(idx)}
                            className={`relative shrink-0 w-16 h-11 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${idx === activePhotoIdx
                                ? 'border-blue-600 ring-2 ring-blue-500/30 scale-102'
                                : 'border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                              }`}
                          >
                            <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold text-white bg-black/75 px-1 rounded">
                              {idx + 1}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Venue Header & Identity Details */}
                  <div className="pt-0.5">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-black tracking-wide text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                        {isAC ? 'AC Classrooms' : (venue?.code || venue?.new_hall_name || 'Passage Hall')}
                      </span>
                      {venue?.old_hall_name && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {isAC ? `Ref: ${venue.old_hall_name}` : `Code: ${venue.new_hall_name || venue.code}`}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                      {venueTitle}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-600 dark:text-slate-300 mt-1.5">
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{venue?.department || 'COEP Campus'}</span>
                      </span>
                      {venue?.address && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">{venue.address}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                        Capacity
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{capacity} Persons</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                        {venue?.benches ? 'Benches' : 'Space'}
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {venue?.benches ? `${benches} Benches` : 'Open Floor'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                        Category
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate block">{venue?.type || 'Classrooms'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                        {priceDisplay ? 'Tariff' : 'Status'}
                      </span>
                      {priceDisplay ? (
                        <span className="font-extrabold text-amber-700 dark:text-amber-400 text-xs truncate block" title={priceDisplay}>
                          {priceDisplay}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          Available Now
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Faculty In-Charge */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Faculty Department Coordinator
                    </span>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
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
                  </div>

                  {/* 3-Stage Laboratory Governance Notice */}
                  {isLab && (
                    <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs flex items-start gap-2.5">
                      <FlaskConical className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-teal-950 dark:text-teal-200 block">
                          3-Stage Laboratory Governance Active
                        </span>
                        <p className="text-teal-800 dark:text-teal-300 leading-relaxed text-[11px]">
                          This space requires technical clearance by the <strong>Lab Assistant</strong> (apparatus & safety check) before proceeding to the <strong>HOD</strong> and <strong>Dean</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Installed Facilities & Amenities */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Installed Classroom Facilities:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(venue?.features) && venue.features.length > 0
                        ? venue.features
                        : [
                          'Overhead Projector',
                          'PA Sound System',
                          'Air Conditioned',
                          'Wi-Fi 6'
                        ]
                      ).map((feat, i) => (
                        <span
                          key={i}
                          className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-slate-200/70 dark:border-slate-700 shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Terms and Guidelines if applicable */}
                  {termsDisplay && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-900 dark:text-amber-300 block mb-0.5">Booking Terms & Guidelines</span>
                        <p className="text-amber-800 dark:text-amber-400 leading-relaxed text-[11px]">{termsDisplay}</p>
                      </div>
                    </div>
                  )}

                  {/* Timetable Overview Card */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/60 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        Timetable Guidelines
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Free Gaps Available</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Regular curriculum lectures are priority scheduled during 10:30 AM – 5:30 PM. Recess/lunch hours (12:30–1:30 PM) and morning/evening slots are open for reservations.
                    </p>
                  </div>
                </div>

                {/* Right Column (7 cols): Slot Reservation Form */}
                <div className="lg:col-span-7">
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
                        <div className="flex items-center gap-2">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            2. Time Slot
                          </label>
                          <span className="text-[10px] font-semibold flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <span className={`w-1.5 h-1.5 rounded-full ${isLoadingSlots ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`}></span>
                            {isLoadingSlots ? 'Checking database...' : 'Database verified'}
                          </span>
                        </div>
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

                      {/* Time Slot Buttons — last orphan slot spans full row */}
                      {(() => {
                        const total = computedTimeSlots.length
                        const remainder = total % 3
                        return (
                          <div className="grid grid-cols-3 gap-2">
                            {computedTimeSlots.map((slot, i) => {
                              const isFree = slot.status === 'free'
                              const isSelected = selectedSlot === slot.time
                              // If only 1 slot left on last row → span full row
                              const isLastOrphan = remainder === 1 && i === total - 1
                              const colSpan = isLastOrphan ? 'col-span-3' : ''

                              return isFree ? (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => {
                                    setSelectedSlot(slot.time)
                                    setConflictError('')
                                  }}
                                  className={`${colSpan} p-2.5 rounded-xl text-xs font-semibold border text-left cursor-pointer transition-colors flex items-center justify-between ${isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-slate-700/60'
                                  }`}
                                >
                                  <span>{slot.time}</span>
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                                </button>
                              ) : (
                                <div
                                  key={i}
                                  className={`${colSpan} p-2.5 rounded-xl text-xs font-medium border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/25 text-slate-500 dark:text-slate-400 flex items-center justify-between cursor-not-allowed select-none`}
                                  title={slot.purpose ? `Reserved: "${slot.purpose}"` : 'Occupied'}
                                >
                                  <span className="line-through">{slot.time}</span>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400">
                                    {slot.label}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })()}
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

                    {/* Optional/Required Mobile Phone for Cashfree */}
                    {isPaidVenue && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Contact Mobile (for Cashfree Payment Receipt) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={applicantPhone}
                          onChange={(e) => setApplicantPhone(e.target.value)}
                          placeholder="10-digit mobile number (e.g. 9876543210)"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    )}

                    {/* Faculty Session Nature: Academic Lecture vs Event */}
                    {isFaculty && (
                      <div className="space-y-2 pt-1">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Session Nature / Activity Type *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setBookingCategory('lecture')}
                            className={`p-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 cursor-pointer ${bookingCategory === 'lecture'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                              }`}
                          >
                            <GraduationCap className="w-4 h-4" />
                            <span>Academic Lecture / Class</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setBookingCategory('event')}
                            className={`p-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 cursor-pointer ${bookingCategory === 'event'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                              }`}
                          >
                            <Calendar className="w-4 h-4" />
                            <span>Campus Event / Seminar</span>
                          </button>
                        </div>

                        {/* Dynamic Sanction / Instant Clearance Guidance Card */}
                        {isFacultyInstantApproved ? (
                          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-emerald-900 dark:text-emerald-200 block">⚡ Instant Approval</span>
                              <p className="text-emerald-700 dark:text-emerald-300 text-[11px] mt-0.5 leading-relaxed">
                                As a faculty member reserving a classroom in your home department ({venue?.department || currentUser?.department}), this regular academic lecture is <strong>instantly approved</strong> with an active gate pass.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs flex items-start gap-2.5">
                            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-amber-900 dark:text-amber-200 block">📋 HOD & Dean Permission Required</span>
                              <p className="text-amber-700 dark:text-amber-300 text-[11px] mt-0.5 leading-relaxed">
                                {bookingCategory === 'event'
                                  ? 'Because this session is scheduled as an event, formal permission is required: your request will go to the Department HOD for sanction first, followed by the Dean for clearance.'
                                  : !isHomeDept
                                    ? `This venue belongs to ${venue?.department || 'another department'}. Inter-departmental bookings require sanction from the Department HOD and Dean.`
                                    : 'Non-classroom facilities require sanction from the Department HOD and Dean.'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

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

                    {/* Cashfree PG Highlight Card for Paid Venues */}
                    {isPaidVenue && (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/90 dark:border-blue-800/80 text-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                              ₹
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900 dark:text-white">Commercial Facility Tariff</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">Gateway: Cashfree PG (Production)</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-black text-blue-600 dark:text-blue-400">₹{numericPrice.toLocaleString('en-IN')}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Inclusive of 18% GST</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-200/60 dark:border-blue-800/60 text-[11px] text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" /> UPI, GPay, PhonePe, Cards, NetBanking
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Instant Automated Invoice</span>
                        </div>
                      </div>
                    )}

                    {/* Payment Error Alert */}
                    {paymentError && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{paymentError}</span>
                      </div>
                    )}

                    {/* Reservation Conflict Alert Banner */}
                    {conflictError && (
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 flex-1">
                          <p className="font-bold text-amber-800 dark:text-amber-300">Time Slot Unavailable</p>
                          <p className="leading-relaxed opacity-95 text-slate-700 dark:text-slate-300">{conflictError}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span>
                        Venue Capacity: <strong className="dark:text-slate-200">{capacity} Persons</strong> ({benches} Benches)
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {isPaidVenue ? 'Secured by Cashfree' : 'Instant Campus Routing'}
                      </span>
                    </div>

                    {/* Submit / Cancel Buttons */}
                    <div className="pt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={isProcessingPayment || isSubmitting}
                        className="shrink-0 px-5 h-11 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isProcessingPayment || isSubmitting}
                        className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-all shadow-sm cursor-pointer inline-flex items-center justify-center gap-2.5"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                            <span className="text-sm font-semibold">Verifying...</span>
                          </>
                        ) : isProcessingPayment ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                            <span className="text-sm font-semibold">Connecting to Gateway...</span>
                          </>
                        ) : isPaidVenue ? (
                          <>
                            <CreditCard className="w-4 h-4 shrink-0" />
                            <span className="flex flex-col items-start leading-tight">
                              <span className="text-sm font-bold">Pay ₹{numericPrice.toLocaleString('en-IN')} &amp; Book</span>
                              <span className="text-[10px] font-normal opacity-80">via Cashfree · Instant confirmation</span>
                            </span>
                          </>
                        ) : isFacultyInstantApproved ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span className="text-sm font-semibold">Confirm &amp; Auto-Approve</span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-semibold">Submit for Approval</span>
                            <ArrowRight className="w-4 h-4 shrink-0" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
