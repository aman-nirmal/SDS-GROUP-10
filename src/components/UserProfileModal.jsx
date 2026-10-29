import React, { useState, useEffect } from 'react'
import {
  X,
  User,
  Shield,
  GraduationCap,
  Trophy,
  BookOpen,
  ShieldCheck,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building
} from 'lucide-react'

const AVAILABLE_ROLES = [
  'Student',
  'Faculty',
  'Head of Department (HOD)',
  'Dean',
  'Club Lead',
  'Security Guard',
  'Administrator'
]

export default function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  roleRequests = [],
  onSubmitRequest
}) {
  const [requestedRole, setRequestedRole] = useState('Club Lead')
  const [departmentOrClub, setDepartmentOrClub] = useState('')
  const [justification, setJustification] = useState('')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

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

  // User's own request history
  const userRequests = (roleRequests || []).filter(
    (r) => currentUser?.email && r.userEmail && r.userEmail.toLowerCase() === currentUser.email.toLowerCase()
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (requestedRole === currentUser.role) {
      setFormError(`You already possess the "${currentUser.role}" role credentials.`)
      return
    }

    if (!justification.trim() || justification.trim().length < 15) {
      setFormError('Please provide a substantive justification (at least 15 characters).')
      return
    }

    // Call submit callback
    const newRequest = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      userName: currentUser.name,
      userEmail: currentUser.email,
      currentRole: currentUser.role,
      requestedRole,
      department: currentUser.department || departmentOrClub || 'Central Campus',
      clubName: requestedRole === 'Club Lead' ? departmentOrClub || 'Student Organization' : '',
      justification: justification.trim(),
      submittedAt: new Date().toISOString().slice(0, 10),
      status: 'Pending'
    }

    onSubmitRequest(newRequest)
    setFormSuccess('Role elevation request submitted successfully! An administrator will review your application.')
    setJustification('')
    setDepartmentOrClub('')
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Administrator':
        return <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
      case 'Faculty':
        return <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
      case 'Club Lead':
        return <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      case 'Security Guard':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      case 'Student':
      default:
        return <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
    }
  }

  if (!isOpen || !currentUser) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Account & Institutional Profile
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your campus identity and credentials elevation.
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

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* User Details Banner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {currentUser.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {currentUser.email}
              </div>
              {currentUser.department && (
                <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.department}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:items-end gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Authorization
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {getRoleIcon(currentUser.role)}
                <span>{currentUser.role}</span>
              </span>
            </div>
          </div>

          {/* Form: Request Role Change */}
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Submit Role Elevation Request</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Need permissions to book auditoriums, schedule departmental lectures, or moderate campus venues? Apply for role elevation below.
              </p>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Requested Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
                  >
                    {AVAILABLE_ROLES.map((role) => (
                      <option key={role} value={role} disabled={role === currentUser.role}>
                        {role} {role === currentUser.role ? '(Current Role)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Affiliated Organization / Club / Dept
                  </label>
                  <input
                    type="text"
                    value={departmentOrClub}
                    onChange={(e) => setDepartmentOrClub(e.target.value)}
                    placeholder="e.g. Robot Study Circle or Civil Engineering"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Justification & Designation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explain why you require this role (e.g., elected Secretary of E-Cell for academic year 2026-2027, appointed course instructor for CS301, etc.)."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>

          {/* History: User's previous role change requests */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Your Request History ({userRequests.length})</span>
              </h3>
            </div>

            {userRequests.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                You have not submitted any role change requests yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {userRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                          {req.id}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Requested: {req.requestedRole}
                        </span>
                      </div>

                      <div>
                        {req.status === 'Pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3 h-3" />
                            Pending Review
                          </span>
                        )}
                        {req.status === 'Approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved
                          </span>
                        )}
                        {req.status === 'Rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {req.justification}
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                      <span>Submitted: {req.submittedAt}</span>
                      {req.rejectionReason && (
                        <span className="text-rose-600 dark:text-rose-400 font-medium">
                          Note: {req.rejectionReason}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

