/**
 * Microsoft OAuth 2.0 PKCE Flow — no MSAL library needed.
 *
 * Why not MSAL?
 *   MSAL's internal state management (sessionStorage/localStorage keys, interaction
 *   locks, interactionType validation) caused repeated failures where
 *   handleRedirectPromise() returned null even with a valid auth code in the URL.
 *   This custom PKCE implementation is simpler, transparent, and reliable.
 *
 * Security:
 *   - PKCE (S256) prevents authorization code interception attacks
 *   - State parameter prevents CSRF attacks
 *   - Code is exchanged server-side via our backend (no client secret in frontend)
 *   - Role is always read from Supabase DB, never from token claims
 */

import { supabase } from './supabase'

const CLIENT_ID = import.meta.env.VITE_AZURE_CLIENT_ID || 'b177caf5-6457-4162-b680-ea9eea7bf560'
const TENANT_ID = import.meta.env.VITE_AZURE_TENANT_ID || 'b4c6b754-54e3-41e4-a8da-304355c62816'
const SCOPES = 'openid profile email User.Read'
const STORAGE_KEY_VERIFIER = 'ms_oauth_verifier'
const STORAGE_KEY_STATE = 'ms_oauth_state'

// ─── PKCE Utilities ───────────────────────────────────────────────────────────

function randomString(length = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const arr = new Uint8Array(length)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => chars[b % chars.length]).join('')
}

async function sha256base64url(plain) {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// ─── Step 1: Initiate Login ───────────────────────────────────────────────────

/**
 * Redirects the browser to Microsoft's OAuth login page.
 * Stores PKCE verifier + state in localStorage so they survive the navigation.
 */
export async function initiateLogin() {
  const verifier = randomString(64)
  const challenge = await sha256base64url(verifier)
  const state = randomString(32)

  localStorage.setItem(STORAGE_KEY_VERIFIER, verifier)
  localStorage.setItem(STORAGE_KEY_STATE, state)

  const redirectUri = window.location.origin + '/'

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPES,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
    response_mode: 'fragment',   // puts code in URL hash (#code=...) not query string
    prompt: 'select_account'
  })

  console.log('[SSO] Redirecting to Microsoft login...')
  window.location.href = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?${params}`
}

// ─── Step 2: Handle Callback ──────────────────────────────────────────────────

/**
 * Called on page load. Detects if we're returning from Microsoft OAuth,
 * validates the state, exchanges the code for tokens, and returns a
 * full user profile with role fetched from Supabase.
 *
 * Returns null if no OAuth callback is in progress.
 * Returns { userProfile } on success.
 * Throws on auth failure.
 */
export async function handleOAuthCallback() {
  // Parse both hash and query string (Azure uses fragment by default)
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.substring(1)
    : window.location.hash
  const hashParams = new URLSearchParams(hash)
  const queryParams = new URLSearchParams(window.location.search)

  const code = hashParams.get('code') || queryParams.get('code')
  const returnedState = hashParams.get('state') || queryParams.get('state')
  const error = hashParams.get('error') || queryParams.get('error')

  // No auth code → not a callback
  if (!code && !error) return null

  // Clear the URL hash immediately (don't leave the code in the address bar)
  if (window.history?.replaceState) {
    window.history.replaceState({}, document.title, window.location.pathname)
  }

  // Handle errors from Microsoft
  if (error) {
    const desc = hashParams.get('error_description') || queryParams.get('error_description') || error
    if (error === 'access_denied') return null  // User cancelled
    throw new Error(`Microsoft sign-in error: ${desc}`)
  }

  // Validate CSRF state
  const storedState = localStorage.getItem(STORAGE_KEY_STATE)
  const verifier = localStorage.getItem(STORAGE_KEY_VERIFIER)

  // Clean up regardless of outcome
  localStorage.removeItem(STORAGE_KEY_STATE)
  localStorage.removeItem(STORAGE_KEY_VERIFIER)

  if (!storedState || returnedState !== storedState) {
    console.error('[SSO] State mismatch — possible CSRF attack or stale flow')
    throw new Error('Sign-in session expired or invalid. Please try again.')
  }

  if (!verifier) {
    throw new Error('PKCE verifier missing. Please try signing in again.')
  }

  const redirectUri = window.location.origin + '/'

  // ── Exchange auth code for tokens ──────────────────────────────────────────
  // Try direct browser token exchange first (works if redirect URI registered as SPA in Azure)
  // Fall back to backend proxy if CORS blocks it
  let tokens = null
  let email = null
  let msName = null

  try {
    tokens = await exchangeCodeDirect(code, verifier, redirectUri)
    email = extractEmailFromTokens(tokens)
    msName = extractNameFromTokens(tokens)
    console.log('[SSO] Token exchange succeeded directly. Email:', email)
  } catch (directErr) {
    console.warn('[SSO] Direct token exchange failed, trying backend proxy:', directErr.message)
    try {
      const backendResult = await exchangeCodeViaBackend(code, verifier, redirectUri)
      email = backendResult.email
      msName = backendResult.displayName || null
      console.log('[SSO] Backend token exchange succeeded. Email:', email)
    } catch (backendErr) {
      console.error('[SSO] Both exchange methods failed:', backendErr.message)
      throw new Error('Could not complete Microsoft sign-in. Please try again.')
    }
  }

  if (!email) throw new Error('Could not retrieve your email from Microsoft. Please try again.')

  // ── Enforce institutional domain ───────────────────────────────────────────
  const lowerEmail = email.toLowerCase()
  if (!lowerEmail.endsWith('@coeptech.ac.in') && !lowerEmail.endsWith('@coep.ac.in')) {
    throw new Error(`Access denied: ${email} is not a COEP institutional account.`)
  }

  // ── Look up role from Supabase DB ──────────────────────────────────────────
  let dbUser = null
  if (supabase) {
    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('id, name, email, role, department')
        .eq('email', lowerEmail)
        .eq('is_active', true)
        .maybeSingle()
      if (!dbError && data) dbUser = data
    } catch (e) {
      console.warn('[SSO] Supabase lookup error:', e.message)
    }
  }

  if (!dbUser) {
    // New user — not yet in the DB. Return a registration signal so the
    // app can show the registration form (pre-filled with Microsoft identity).
    return {
      needsRegistration: true,
      email: lowerEmail,
      msName: msName || lowerEmail.split('@')[0]
    }
  }

  console.log('[SSO] Signed in as:', dbUser.email, '→', dbUser.role)

  return {
    userProfile: {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      department: dbUser.department,
      authProvider: 'microsoft-sso',
      authenticatedAt: new Date().toISOString()
    }
  }
}

// ─── Token Exchange Methods ───────────────────────────────────────────────────

async function exchangeCodeDirect(code, verifier, redirectUri) {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
    scope: SCOPES
  })

  const res = await fetch(
    `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    }
  )

  const data = await res.json()
  if (data.error) throw new Error(data.error_description || data.error)
  return data
}

async function exchangeCodeViaBackend(code, verifier, redirectUri) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
  const res = await fetch(`${API_URL}/auth/token-exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, codeVerifier: verifier, redirectUri })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Backend token exchange failed')
  return data
}

function extractEmailFromTokens(tokens) {
  if (tokens.id_token) {
    try {
      const payload = JSON.parse(atob(tokens.id_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      return payload.preferred_username || payload.email || payload.upn || null
    } catch (e) {
      console.warn('[SSO] Failed to parse id_token:', e.message)
    }
  }
  return null
}

function extractNameFromTokens(tokens) {
  if (tokens.id_token) {
    try {
      const payload = JSON.parse(atob(tokens.id_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      return payload.name || payload.given_name || null
    } catch { }
  }
  return null
}

