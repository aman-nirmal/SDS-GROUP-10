import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Mail,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react'
import { MicrosoftLogo, OutlookLogo } from './MicrosoftLogo'
import { initiateLogin } from '../../lib/msalAuth'
import { authApi } from '../../lib/api'
import { supabase } from '../../lib/supabase'

// OFFICIAL_COEP_ACCOUNTS — exported for Admin panel reference only.
// Passwords are NOT used for authentication here; all auth goes through DB.
export const OFFICIAL_COEP_ACCOUNTS = [
  { role: 'Administrator',              email: 'admin@coeptech.ac.in',          name: 'Central Estate Admin',         department: 'Central Estate & Infrastructure',          id: 'ADM-001' },
  { role: 'Head of Department (HOD)',   email: 'hod.civil@coeptech.ac.in',      name: 'Dr. Balkrishna M. Dawari',     department: 'Civil Engineering',                        id: 'HOD-CIVIL-01' },
  { role: 'Head of Department (HOD)',   email: 'hod.comp@coeptech.ac.in',       name: 'Dr. V. K. Pachghare',          department: 'Computer Engineering',                     id: 'HOD-COMP-01' },
  { role: 'Dean',                       email: 'dean.academics@coeptech.ac.in', name: 'Dr. P. R. Dhamangaonkar',     department: 'Office of the Dean (Academics)',           id: 'DEAN-ACAD-01' },
  { role: 'Faculty',                    email: 'faculty@coeptech.ac.in',        name: 'Dr. V. K. Kulkarni',           department: 'Computer Engineering',                     id: 'FAC-1042' },
  { role: 'Club Lead',                  email: 'mindspark@coeptech.ac.in',      name: 'MindSpark Secretarial Lead',   department: 'Technical Events Secretariat',             id: 'CLUB-MS-26' },
  { role: 'Student',                    email: 'student@coeptech.ac.in',        name: 'Aman Nirmal',                  department: 'Computer Engineering',                     id: 'STU-2026-101' },
  { role: 'Security Guard',             email: 'security@coeptech.ac.in',       name: 'Officer S. Patil',             department: 'Campus Security & Gate 1 Control',         id: 'SEC-G1-04' },
]

// Password list is kept SERVER-SIDE only. Frontend never stores or checks passwords.

/**
 * Resolves a full user profile from Supabase by email.
 * This is the SINGLE source of truth for role assignment.
 */
async function resolveUserFromDB(email) {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, department')
      .eq('email', email.trim().toLowerCase())
      .eq('is_active', true)
      .maybeSingle()
    if (!error && data) return data
  } catch (e) {
    console.warn('[Auth] DB lookup error:', e.message)
  }
  return null
}

// ─── Fallback SSO email form — only shown when real MSAL popup fails ────────────
// This is NOT a replacement for real Microsoft OAuth. It's a fallback that still
// verifies the email against the Supabase users table (no password = low security,
// but used only when the Azure popup is unavailable, e.g. redirect URI not registered).
function MicrosoftSsoFallback({ onSuccess, onClose }) {
  const [inputEmail, setInputEmail] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async (e) => {
    if (e) e.preventDefault()
    const email = inputEmail.trim().toLowerCase()
    if (!email) { setErrorMsg('Enter your university email.'); return }
    if (!email.endsWith('@coeptech.ac.in') && !email.endsWith('@coep.ac.in')) {
      setErrorMsg('Only @coeptech.ac.in or @coep.ac.in addresses are allowed.')
      return
    }

    setIsLoading(true)
    setErrorMsg('')

    const dbUser = await resolveUserFromDB(email)
    setIsLoading(false)

    if (dbUser) {
      onSuccess({
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        department: dbUser.department,
        authProvider: 'microsoft-sso-fallback',
        authenticatedAt: new Date().toISOString()
      })
    } else {
      setErrorMsg(
        'No account found for this email. Contact your administrator to register your account in the system.'
      )
    }
  }

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        {/* MS Header */}
        <div style={{ padding: '28px 32px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <svg width="21" height="21" viewBox="0 0 23 23" fill="none">
              <rect x="1" y="1" width="10" height="10" fill="#f25022"/>
              <rect x="12" y="1" width="10" height="10" fill="#7fba00"/>
              <rect x="1" y="12" width="10" height="10" fill="#00a4ef"/>
              <rect x="12" y="12" width="10" height="10" fill="#ffb900"/>
            </svg>
            <span style={{ fontSize: '18px', fontWeight: 300, color: '#1b1b1b', letterSpacing: '-0.3px' }}>Microsoft</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#1b1b1b', marginBottom: '6px' }}>Sign in</div>
          <div style={{ fontSize: '13px', color: '#605e5c' }}>Use your COEP Technological University account</div>
          <div style={{ marginTop: '8px', padding: '8px 10px', backgroundColor: '#fff4ce', borderRadius: '4px', fontSize: '11px', color: '#7a6000' }}>
            ⚠ Microsoft popup unavailable — verify your institutional email to continue
          </div>
        </div>

        <div style={{ padding: '0 32px 24px' }}>
          <form onSubmit={handleContinue}>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="email"
                value={inputEmail}
                onChange={e => { setInputEmail(e.target.value); setErrorMsg('') }}
                placeholder="someone@coeptech.ac.in"
                autoFocus
                disabled={isLoading}
                style={{ width: '100%', height: '36px', border: 'none', borderBottom: '2px solid #605e5c', outline: 'none', fontSize: '15px', color: '#1b1b1b', background: 'transparent', boxSizing: 'border-box', paddingBottom: '4px' }}
                onFocus={e => e.target.style.borderBottomColor = '#0078d4'}
                onBlur={e => e.target.style.borderBottomColor = '#605e5c'}
              />
              {errorMsg && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#a80000', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span>⚠</span><span>{errorMsg}</span>
                </div>
              )}
            </div>
            <div style={{ fontSize: '13px', color: '#605e5c', marginBottom: '20px' }}>Your institution controls your account.</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
              <button type="button" onClick={onClose} disabled={isLoading}
                style={{ padding: '6px 20px', border: '1px solid #8a8886', background: 'transparent', borderRadius: '2px', fontSize: '15px', color: '#1b1b1b', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={isLoading}
                style={{ padding: '6px 20px', background: '#0078d4', border: '1px solid #0078d4', borderRadius: '2px', fontSize: '15px', color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: isLoading ? 0.7 : 1 }}>
                {isLoading ? 'Verifying...' : 'Next'}
              </button>
            </div>
          </form>
        </div>

        <div style={{ backgroundColor: '#f3f2f1', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={14} color="#605e5c" />
          <span style={{ fontSize: '11px', color: '#605e5c' }}>Verified against COEP Locus institutional directory</span>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Main LoginForm ─────────────────────────────────────────────────────────────
export function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [authMethod, setAuthMethod] = useState('password')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successNotice, setSuccessNotice] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [showFallback, setShowFallback] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    let t = null
    if (resendCooldown > 0) t = setInterval(() => setResendCooldown(p => p - 1), 1000)
    return () => { if (t) clearInterval(t) }
  }, [resendCooldown])

  // No MSAL session state to clear anymore — clean PKCE flow handles it


  const completeSignIn = (profile) => {
    try { localStorage.setItem('locus_auth_user', JSON.stringify(profile)) } catch { }
    setShowFallback(false)
    setTimeout(() => {
      if (typeof onLoginSuccess === 'function') onLoginSuccess(profile)
    }, 0)
  }

  // ── 1. Microsoft OAuth via PKCE ─────────────────────────────────────────────
  // Calls initiateLogin() which:
  //   1. Generates PKCE verifier + challenge, stores in localStorage
  //   2. Redirects browser to Microsoft login page
  // On return, main.jsx detects #code= and calls handleOAuthCallback() BEFORE
  // React renders. App.jsx receives the resolved promise and signs the user in.
  const handleOutlookSignIn = async () => {
    setErrorMessage('')
    setIsVerifying(true)
    try {
      await initiateLogin()  // page navigates away — no code runs after this
    } catch (err) {
      setIsVerifying(false)
      setErrorMessage('Could not start Microsoft sign-in. Please try again.')
      console.error('[SSO] initiateLogin failed:', err.message)
    }
  }


  // ── 2. Password login — validates via backend API (which checks DB) ───────────
  const handlePasswordSubmit = async (e) => {
    if (e) e.preventDefault()
    setErrorMessage('')
    setSuccessNotice('')

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) { setErrorMessage('Please enter your university email address.'); return }
    if (!trimmedEmail.endsWith('@coeptech.ac.in') && !trimmedEmail.endsWith('@coep.ac.in')) {
      setErrorMessage('Please use your official @coeptech.ac.in or @coep.ac.in university email.')
      return
    }
    if (!password.trim()) { setErrorMessage('Password cannot be blank.'); return }

    setIsVerifying(true)
    try {
      // Authenticate via backend — backend checks DB, never frontend
      const res = await authApi.login(trimmedEmail, password)
      setIsVerifying(false)
      if (res?.user) {
        completeSignIn(res.user)
      } else {
        setErrorMessage('Authentication failed. Please check your credentials.')
      }
    } catch (err) {
      setIsVerifying(false)
      setErrorMessage(err.message || 'Incorrect email or password.')
    }
  }

  // ── 3. Send OTP ───────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    setErrorMessage('')
    const trimmedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.'); return
    }
    setIsVerifying(true)
    try {
      const res = await authApi.sendOtp(trimmedEmail)
      setIsOtpSent(true); setResendCooldown(45)
      setSuccessNotice(res.message || `Verification code sent to ${trimmedEmail}`)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch verification email.')
    } finally { setIsVerifying(false) }
  }

  // ── 4. Verify OTP ─────────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault()
    setErrorMessage('')
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setErrorMessage('Please enter the full 6-digit verification code.'); return
    }
    setIsVerifying(true)
    try {
      const res = await authApi.verifyOtp(email.trim().toLowerCase(), otpCode.trim())
      setIsVerifying(false)
      if (res?.user) {
        completeSignIn(res.user)
      } else {
        setErrorMessage('Verification failed. Please try again.')
      }
    } catch (err) {
      setIsVerifying(false)
      setErrorMessage(err.message || 'Invalid or expired verification code.')
    }
  }

  return (
    <>
      {showFallback && (
        <MicrosoftSsoFallback
          onSuccess={completeSignIn}
          onClose={() => setShowFallback(false)}
        />
      )}

      <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-xl transition-all">
        <div className="mb-6 text-center sm:text-left">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            COEP Campus Sign In
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Access campus venues, auditoriums, and reservation records.
          </p>
        </div>

        {/* Real Microsoft OAuth Button */}
        <div className="mb-5">
          <button
            type="button"
            onClick={handleOutlookSignIn}
            disabled={isVerifying}
            className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer disabled:opacity-75 border border-transparent dark:border-slate-700"
          >
            {isVerifying ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /><span>Opening Microsoft Sign-In...</span></>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <MicrosoftLogo className="w-4 h-4" />
                  <OutlookLogo className="w-4 h-4" />
                </div>
                <span>Sign in with Microsoft 365 / Outlook</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <span className="relative px-3 bg-white dark:bg-slate-900 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            or sign in with credentials
          </span>
        </div>

        {/* Auth Method Toggle */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 text-xs font-bold">
          <button type="button" onClick={() => { setAuthMethod('password'); setErrorMessage('') }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${authMethod === 'password' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}>
            University Password
          </button>
          <button type="button" onClick={() => { setAuthMethod('otp'); setErrorMessage('') }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${authMethod === 'otp' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}>
            Email OTP
          </button>
        </div>

        {errorMessage && (
          <div role="alert" className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successNotice && !errorMessage && (
          <div role="status" className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Password flow */}
        {authMethod === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password-university-email" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">University Email</label>
              <input id="password-university-email" type="email" value={email}
                onChange={e => { setEmail(e.target.value); if (errorMessage) setErrorMessage('') }}
                placeholder="name@coeptech.ac.in" disabled={isVerifying}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors disabled:opacity-60" />
            </div>
            <div>
              <label htmlFor="password-input" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
              <input id="password-input" type="password" value={password}
                onChange={e => { setPassword(e.target.value); if (errorMessage) setErrorMessage('') }}
                placeholder="Enter password" disabled={isVerifying}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors disabled:opacity-60" />
            </div>
            <button type="submit" disabled={isVerifying}
              className="w-full h-11 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60">
              {isVerifying ? 'Authenticating...' : 'Sign In with University Account'}
            </button>
          </form>
        )}

        {/* OTP flow */}
        {authMethod === 'otp' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="otp-university-email" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Institutional Email</label>
              <div className="relative">
                <input id="otp-university-email" type="email" value={email}
                  onChange={e => { setEmail(e.target.value); if (errorMessage) setErrorMessage('') }}
                  placeholder="name@coeptech.ac.in" disabled={isVerifying || isOtpSent}
                  className="w-full h-11 px-3 pl-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors disabled:opacity-60" />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                {isOtpSent && (
                  <button type="button" onClick={() => { setIsOtpSent(false); setOtpCode(''); setSuccessNotice('') }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer">
                    Change
                  </button>
                )}
              </div>
            </div>
            {!isOtpSent ? (
              <button type="button" onClick={handleSendOtp} disabled={isVerifying}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60">
                {isVerifying ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Dispatching code...</span></> : <><Mail className="w-4 h-4" /><span>Send Verification Code</span></>}
              </button>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label htmlFor="six-digit-otp" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">6-Digit Verification Code</label>
                  <input id="six-digit-otp" type="text" maxLength={6} value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit code" autoFocus disabled={isVerifying}
                    className="w-full h-12 text-center tracking-[0.3em] font-mono text-base font-extrabold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors" />
                  <p className="text-[11px] text-slate-500 text-center mt-1.5">Enter the 6-digit code dispatched to your institutional inbox.</p>
                </div>
                <button type="submit" disabled={isVerifying}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60">
                  {isVerifying ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Verifying code...</span></> : <span>Verify Code & Enter</span>}
                </button>
                <div className="text-center text-xs">
                  {resendCooldown > 0
                    ? <span className="text-slate-400 dark:text-slate-500">Resend code in {resendCooldown}s</span>
                    : <button type="button" onClick={handleSendOtp} className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer">Resend verification code</button>}
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default LoginForm
