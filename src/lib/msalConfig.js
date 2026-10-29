import { PublicClientApplication, LogLevel } from '@azure/msal-browser'
import { supabase } from './supabase'

const DEFAULT_AZURE_CLIENT_ID = 'b177caf5-6457-4162-b680-ea9eea7bf560'
const DEFAULT_AZURE_TENANT_ID = 'b4c6b754-54e3-41e4-a8da-304355c62816'

// Retrieve active Azure Client ID from localStorage (runtime dynamic) or Vite environment variables
export function getAzureClientId() {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('azure_client_id')
    if (stored && stored.trim() && stored.trim() !== 'your-azure-app-client-id') {
      return stored.trim()
    }
  }
  const envVal = import.meta.env.VITE_AZURE_CLIENT_ID
  if (envVal && envVal.trim() && envVal.trim() !== 'your-azure-app-client-id') {
    return envVal.trim()
  }
  return DEFAULT_AZURE_CLIENT_ID
}

export function getAzureTenantId() {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('azure_tenant_id')
    if (stored && stored.trim()) {
      return stored.trim()
    }
  }
  return import.meta.env.VITE_AZURE_TENANT_ID || DEFAULT_AZURE_TENANT_ID
}

export function setAzureConfig(clientId, tenantId = 'common') {
  if (typeof window !== 'undefined') {
    if (clientId) {
      window.localStorage.setItem('azure_client_id', clientId.trim())
    } else {
      window.localStorage.removeItem('azure_client_id')
    }
    if (tenantId) {
      window.localStorage.setItem('azure_tenant_id', tenantId.trim())
    } else {
      window.localStorage.removeItem('azure_tenant_id')
    }
    // Invalidate cached MSAL instance to rebuild with new client ID
    msalInstance = null
    initializationPromise = null
  }
}

export function isAzureConfigured() {
  return Boolean(getAzureClientId())
}

/**
 * Clears any abandoned or hung interaction flags from browser storage
 * to resolve and prevent "interaction_in_progress" errors.
 */
export function clearStaleMsalInteractionStatus() {
  if (typeof window === 'undefined') return
  try {
    const storageTargets = [window.sessionStorage, window.localStorage]
    for (const store of storageTargets) {
      if (!store) continue
      const keysToRemove = []
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i)
        if (
          key &&
          (key.includes('interaction.status') ||
            key.includes('interaction_status') ||
            key.includes('request.state') ||
            key.includes('msal.interaction'))
        ) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((key) => store.removeItem(key))
    }
  } catch (e) {
    console.warn('[MSAL] Interaction status cleanup warning:', e)
  }
}

export const loginRequest = {
  scopes: ['User.Read'],
  prompt: 'select_account'
}

let msalInstance = null
let currentClientId = null
let currentTenantId = null
let initializationPromise = null

export async function getMsalInstance(overrideClientId, overrideTenantId) {
  const clientId = overrideClientId || getAzureClientId()
  const tenantId = overrideTenantId || getAzureTenantId()

  if (!clientId) {
    throw new Error('AZURE_NOT_CONFIGURED')
  }

  if (msalInstance && currentClientId === clientId && currentTenantId === tenantId) {
    return msalInstance
  }

  initializationPromise = (async () => {
    const config = {
      auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri: `${window.location.origin}/`,
        postLogoutRedirectUri: `${window.location.origin}/`,
        navigateToLoginRequestUrl: false
      },
      cache: {
        // localStorage persists across page navigations (redirect flow)
        // sessionStorage gets cleared on some browser configs during OAuth redirects
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: true  // IE11 / Safari fallback
      },
      system: {
        loggerOptions: {
          loggerCallback: (level, message, containsPii) => {
            if (containsPii) return
            // Log all MSAL messages so we can debug in browser console
            const prefix = '[MSAL]'
            if (level === LogLevel.Error)   console.error(prefix, message)
            else if (level === LogLevel.Warning) console.warn(prefix, message)
            else if (level === LogLevel.Info)    console.info(prefix, message)
            else                                  console.debug(prefix, message)
          },
          logLevel: LogLevel.Warning
        }
      }
    }

    const pca = new PublicClientApplication(config)
    await pca.initialize()
    msalInstance = pca
    currentClientId = clientId
    currentTenantId = tenantId
    return pca
  })()

  return initializationPromise
}

/**
 * Converts MSAL login response into a Campus User Profile.
 * Identity is proven by Microsoft OAuth. Role comes from Supabase DB.
 * Exported so main.jsx can call it during early redirect processing.
 */
export async function buildUserProfileFromLoginResponse(loginResponse) {
  const account = loginResponse.account

  // Fetch real name/email/department from Microsoft Graph
  let graphData = null
  if (loginResponse.accessToken) {
    try {
      const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${loginResponse.accessToken}` }
      })
      if (graphResponse.ok) graphData = await graphResponse.json()
    } catch (graphErr) {
      console.warn('[MSAL] Microsoft Graph fetch skipped:', graphErr.message)
    }
  }

  const email = (account?.username || graphData?.mail || graphData?.userPrincipalName || '').toLowerCase()
  const msName = account?.name || graphData?.displayName || email.split('@')[0]
  const msDepartment = graphData?.department || 'COEP Technological University'

  // Enforce institutional domain
  const isInstitutional = email.endsWith('@coeptech.ac.in') || email.endsWith('@coep.ac.in')
  if (!isInstitutional) {
    const domainError = new Error(
      `Access restricted: The Microsoft account (${email}) is not from @coeptech.ac.in or @coep.ac.in.`
    )
    domainError.code = 'NON_INSTITUTIONAL_DOMAIN'
    throw domainError
  }

  // Look up the user's role from Supabase — DB is the source of truth
  let dbRole = 'Student'
  let dbName = msName
  let dbDepartment = msDepartment
  let dbId = account?.homeAccountId || `COEP-${Math.floor(1000 + Math.random() * 9000)}`

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, role, department')
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle()

      if (!error && data) {
        dbRole = data.role || 'Student'
        dbName = data.name || msName
        dbDepartment = data.department || msDepartment
        dbId = data.id || dbId
      }
    } catch (dbErr) {
      console.warn('[MSAL] Supabase role lookup failed, defaulting to Student:', dbErr.message)
    }
  }

  return {
    success: true,
    account,
    userProfile: {
      id: dbId,
      name: dbName,
      email,
      department: dbDepartment,
      role: dbRole,
      authProvider: 'microsoft-outlook-msal',
      isInstitutional: true,
      authenticatedAt: new Date().toISOString()
    }
  }
}

/**
 * Formats MSAL errors into clean user-facing errors
 */
function formatMsalError(error) {
  if (error.errorCode === 'user_cancelled') {
    const err = new Error('Microsoft sign-in window was closed before completion.')
    err.code = 'USER_CANCELLED'
    return err
  }
  if (error.errorCode === 'popup_window_error' || error.message?.includes('popup_window_error')) {
    const err = new Error('Browser blocked the sign-in pop-up. Please check your browser address bar and allow pop-ups for this site.')
    err.code = 'POPUP_BLOCKED'
    return err
  }
  if (error.errorCode === 'interaction_in_progress' || error.message?.includes('interaction_in_progress')) {
    clearStaleMsalInteractionStatus()
    const err = new Error('A previous sign-in window was still open or interrupted. The session has been refreshed — please click Sign In again.')
    err.code = 'INTERACTION_RESET'
    return err
  }
  return error
}

/**
 * Triggers Microsoft 365 / Outlook login via FULL-PAGE REDIRECT.
 *
 * Why redirect instead of popup?
 * - Popup mode caused the OAuth code to land in the main window URL with
 *   interactionType:"popup" in the state, which handleRedirectPromise() refuses
 *   to process — leaving the user stuck on the login page.
 * - Redirect mode is consistent: loginRedirect() → Microsoft → back to app →
 *   handleMsalRedirect() in App.jsx processes the code cleanly.
 *
 * Returns nothing — the browser will navigate away.
 * Result is handled by handleMsalRedirect() called in App.jsx on startup.
 */
export async function loginWithOutlook() {
  clearStaleMsalInteractionStatus()
  const pca = await getMsalInstance()

  // If already signed in silently, return immediately without redirect
  const accounts = pca.getAllAccounts()
  if (accounts.length > 0) {
    try {
      const silentResponse = await pca.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0]
      })
      if (silentResponse) {
        return await buildUserProfileFromLoginResponse(silentResponse)
      }
    } catch {
      // Silent failed — fall through to redirect
    }
  }

  // Use redirect mode — consistent with Azure SPA redirect flow
  await pca.loginRedirect({
    ...loginRequest,
    redirectUri: window.location.origin + '/'
  })
  // Browser navigates away here. Result handled by handleMsalRedirect() on return.
  return null
}

// Role is now derived exclusively from Supabase DB (see buildUserProfileFromLoginResponse).
// deriveRoleFromClaims has been removed — email-substring guessing is not secure.

/**
 * Logout from Microsoft session.
 */
export async function logoutFromOutlook() {
  try {
    const pca = await getMsalInstance()
    const activeAccount = pca.getActiveAccount() || pca.getAllAccounts()[0]
    if (activeAccount) {
      await pca.logoutRedirect({ account: activeAccount, postLogoutRedirectUri: window.location.origin + '/' })
    }
  } catch (err) {
    console.warn('[MSAL] Logout exception:', err)
  }
}

/**
 * Called once on app startup (main.jsx).
 * Processes any pending Microsoft OAuth redirect response.
 * Returns { userProfile } if a login just completed, or null otherwise.
 */
export async function handleMsalRedirect() {
  const hash = window.location.hash + window.location.search
  const hasAuthCode = hash.includes('code=') || hash.includes('id_token=')

  console.log('[MSAL Redirect] URL hash:', window.location.hash.slice(0, 60) || '(empty)')
  console.log('[MSAL Redirect] Has auth code:', hasAuthCode)

  if (!hasAuthCode) return null

  try {
    const pca = await getMsalInstance()
    console.log('[MSAL Redirect] MSAL initialized, calling handleRedirectPromise...')
    const response = await pca.handleRedirectPromise()
    console.log('[MSAL Redirect] handleRedirectPromise result:', response ? 'GOT RESPONSE' : 'NULL (state mismatch or already consumed)')

    if (!response) {
      // Clear the stale hash so the app doesn't loop
      if (window.history?.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname)
      }
      return null
    }

    console.log('[MSAL Redirect] Account email:', response.account?.username)
    const result = await buildUserProfileFromLoginResponse(response)
    console.log('[MSAL Redirect] Final profile:', result?.userProfile?.email, '→', result?.userProfile?.role)
    return result
  } catch (err) {
    console.error('[MSAL Redirect] Error:', err.message)
    if (window.history?.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    return null
  }
}

// loginWithOutlookRedirect is now the same as loginWithOutlook (redirect mode)
export { loginWithOutlook as loginWithOutlookRedirect }

