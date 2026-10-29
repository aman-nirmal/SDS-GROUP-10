import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle2, Clock, User, BookOpen, Building2, Mail, Hash, ShieldCheck, ArrowRight } from 'lucide-react'

const DEPARTMENTS = [
  'Civil Engineering',
  'Computer Engineering',
  'Electrical Engineering',
  'Electronics & Telecommunication Engineering',
  'Mechanical Engineering',
  'Metallurgy & Material Science',
  'Manufacturing Engineering & Industrial Management',
  'AI & ML Engineering',
  'Applied Sciences & Humanities',
  'Management Studies',
  'Central Administration & Estate',
  'Other'
]

const REQUESTABLE_ROLES = [
  { value: 'Student', label: 'Student', desc: 'Instant access for campus bookings & study passes' },
  { value: 'Faculty', label: 'Faculty / Professor', desc: 'Departmental venue scheduling & approvals' },
  { value: 'Club Lead', label: 'Club / Event Lead', desc: 'Organize campus events & club requests' },
  { value: 'Lab Assistant', label: 'Lab Assistant', desc: 'Laboratory equipment & session management' },
]

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

export default function RegistrationForm({ email: initialEmail = '', msName = '', onClose, onSuccess }) {
  const [email, setEmail] = useState(initialEmail || '')
  const [name, setName] = useState(msName || '')
  const [department, setDepartment] = useState('')
  const [role, setRole] = useState('Student')
  const [rollNo, setRollNo] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [registeredUser, setRegisteredUser] = useState(null)
  const [error, setError] = useState('')

  const isVerifiedEmail = Boolean(initialEmail)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      setError('Please provide your institutional email address.')
      return
    }
    if (!cleanEmail.endsWith('@coeptech.ac.in') && !cleanEmail.endsWith('@coep.ac.in')) {
      setError('Registration is restricted to official @coeptech.ac.in or @coep.ac.in institutional emails.')
      return
    }
    if (!name.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!department) {
      setError('Please select your department.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: name.trim(),
          department,
          role,
          rollNo: rollNo.trim() || null,
          reason: reason.trim() || null
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')

      if (data.user) {
        setRegisteredUser(data.user)
      }
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Success view ---
  if (submitted) {
    const isAutoApproved = Boolean(registeredUser)
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${
            isAutoApproved ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
          }`}>
            {isAutoApproved ? <ShieldCheck size={36} /> : <Clock size={36} />}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {isAutoApproved ? 'Account Activated!' : 'Registration Submitted!'}
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            {isAutoApproved
              ? `Welcome to COEP Locus, ${name.trim()}! Your Student account is active and verified.`
              : `Your registration request for ${role} in ${department} has been dispatched to the administrator for verification.`}
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 mb-6 text-left border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
            <div className="text-slate-500 dark:text-slate-400 flex justify-between">
              <span>Account:</span>
              <strong className="text-slate-900 dark:text-white font-medium">{email}</strong>
            </div>
            <div className="text-slate-500 dark:text-slate-400 flex justify-between">
              <span>Role:</span>
              <strong className="text-slate-900 dark:text-white font-medium">{role}</strong>
            </div>
            <div className="text-slate-500 dark:text-slate-400 flex justify-between">
              <span>Department:</span>
              <strong className="text-slate-900 dark:text-white font-medium">{department}</strong>
            </div>
          </div>

          {isAutoApproved && onSuccess ? (
            <button
              onClick={() => {
                onSuccess(registeredUser)
                if (onClose) onClose()
              }}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Continue to Student Portal</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>,
      document.body
    )
  }

  // --- Registration modal ---
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose() }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              CL
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Register for COEP Locus</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Institutional Venue & Resource Platform</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Verified SSO status badge (if arrived via Microsoft SSO) */}
        {isVerifiedEmail && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-xs text-emerald-900 dark:text-emerald-200">
              Microsoft verified: <strong className="font-semibold">{email}</strong>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email input if not pre-verified via SSO */}
          {!isVerifiedEmail && (
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                <Mail size={13} />
                <span>University Email *</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="name@coeptech.ac.in"
                disabled={isSubmitting}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 outline-none transition-colors"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Must be an official @coeptech.ac.in or @coep.ac.in address.</p>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              <User size={13} />
              <span>Full Name *</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="e.g. Aman Nirmal"
              disabled={isSubmitting}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {/* Role selector */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              <BookOpen size={13} />
              <span>Role Selection *</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REQUESTABLE_ROLES.map((r) => {
                const isSelected = role === r.value
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 text-blue-900 dark:text-blue-100 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{r.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{r.desc}</div>
                  </button>
                )
              })}
            </div>
            {role === 'Student' ? (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium flex items-center gap-1">
                <CheckCircle2 size={12} /> Student registrations are verified and activated instantly!
              </p>
            ) : (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 font-medium flex items-center gap-1">
                <Clock size={12} /> Requires Administrator review & approval before activation.
              </p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              <Building2 size={13} />
              <span>Department / Faculty *</span>
            </label>
            <select
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setError('') }}
              disabled={isSubmitting}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 outline-none transition-colors"
            >
              <option value="">Select your department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Roll No (Student) */}
          {role === 'Student' && (
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                <Hash size={13} />
                <span>PRN / MIS Roll Number (Optional)</span>
              </label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="e.g. 112103045"
                disabled={isSubmitting}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          )}

          {/* Reason (Non-student) */}
          {role !== 'Student' && (
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                <span>Access Justification (Optional)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly state your designation, lab, or club coordinator role."
                rows={2}
                disabled={isSubmitting}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 outline-none transition-colors resize-none"
              />
            </div>
          )}

          {/* Error notice */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 h-11 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? 'Registering...' : role === 'Student' ? 'Complete Registration' : 'Submit Access Request'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
