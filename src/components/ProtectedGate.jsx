import React from 'react'
import { Lock, ShieldAlert, ArrowRight, UserCheck, KeyRound, Sparkles, Building2 } from 'lucide-react'

const DEMO_PROFILES = {
  Faculty: {
    id: 'FAC-1042',
    name: 'Dr. V. K. Kulkarni',
    email: 'faculty@coeptech.ac.in',
    role: 'Faculty',
    department: 'Computer Engineering',
    authProvider: 'Microsoft Outlook 365'
  },
  Student: {
    id: 'STU-2026-101',
    name: 'Aman Nirmal',
    email: 'student@coeptech.ac.in',
    role: 'Student',
    department: 'Computer Engineering',
    authProvider: 'Microsoft Outlook 365'
  },
  'Club Lead': {
    id: 'CLUB-MS-26',
    name: 'MindSpark Secretarial Lead',
    email: 'mindspark@coeptech.ac.in',
    role: 'Club Lead',
    department: 'Technical Events Secretariat',
    authProvider: 'Email OTP'
  },
  Administrator: {
    id: 'ADM-001',
    name: 'Central Estate Admin',
    email: 'admin@coeptech.ac.in',
    role: 'Administrator',
    department: 'Central Estate & Infrastructure',
    authProvider: 'Password & SSO'
  }
}

export default function ProtectedGate({
  allowedRoles = [],
  portalName = 'Restricted Campus Portal',
  portalDescription = 'This area is restricted to verified university personnel and authenticated accounts.',
  currentUser,
  onNavigateLogin,
  onQuickLogin,
  children
}) {
  const isAuthorized =
    currentUser &&
    (currentUser.role === 'Administrator' ||
      allowedRoles.length === 0 ||
      allowedRoles.includes(currentUser.role))

  if (isAuthorized) {
    return <>{children}</>
  }

  const primaryRole = allowedRoles[0] || 'Administrator'
  const demoCandidate = DEMO_PROFILES[primaryRole]

  return (
    <div className="w-full min-h-[75vh] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-5 shadow-xs">
          <Lock className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 mb-3">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>Institutional Access Control</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {portalName}
        </h2>

        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          {portalDescription}
        </p>

        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Required Authorization
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allowedRoles.map((role) => (
              <span
                key={role}
                className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"
              >
                {role}
              </span>
            ))}
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              Administrator (Superuser)
            </span>
          </div>

          {currentUser ? (
            <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
              <span>Currently signed in as: </span>
              <strong className="text-slate-900">{currentUser.name}</strong>{' '}
              <span className="text-[11px] text-slate-500">({currentUser.role})</span>
              <div className="text-[11px] text-red-600 font-semibold mt-1">
                Your current role does not have authorization for this portal. Please switch accounts.
              </div>
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
              No authenticated university session detected. Please sign in with your official @coeptech.ac.in account.
            </div>
          )}
        </div>

        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            onClick={onNavigateLogin}
            className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <KeyRound className="w-4 h-4" />
            <span>Sign In with University Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {demoCandidate && onQuickLogin && (
            <button
              type="button"
              onClick={() => onQuickLogin(demoCandidate)}
              className="w-full h-11 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>1-Click Test Access: {demoCandidate.name} ({demoCandidate.role})</span>
            </button>
          )}
        </div>

        <div className="mt-5 text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <Building2 className="w-3.5 h-3.5" />
          <span>COEP Technological University Central Estate Governance</span>
        </div>
      </div>
    </div>
  )
}
