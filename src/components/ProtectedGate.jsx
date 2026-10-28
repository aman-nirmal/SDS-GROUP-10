import React from 'react'
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react'

export default function ProtectedGate({
  allowedRoles = [],
  portalName = 'Institutional Portal',
  portalDescription = 'This area is restricted to authenticated university personnel.',
  currentUser,
  onNavigateLogin,
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

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 text-center animate-in fade-in duration-200">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center mb-5">
          <Lock className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 mb-3">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Access Restricted</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {portalName}
        </h2>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          {portalDescription}
        </p>

        {currentUser ? (
          <div className="mt-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-left text-xs space-y-1">
            <div className="font-bold text-amber-900 dark:text-amber-300">Insufficient Privileges</div>
            <div className="text-amber-800 dark:text-amber-200">
              Signed in as <strong>{currentUser.name}</strong> ({currentUser.role}). This section requires{' '}
              <strong>{allowedRoles.join(' or ')}</strong> clearance.
            </div>
          </div>
        ) : (
          <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 text-left">
            Please sign in with your official university credentials to verify your role.
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={onNavigateLogin}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span>{currentUser ? 'Switch Account' : 'Sign In to Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
