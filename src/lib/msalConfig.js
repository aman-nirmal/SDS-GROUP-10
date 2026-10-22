import { PublicClientApplication, LogLevel } from '@azure/msal-browser'

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
  return ''
}

export function getAzureTenantId() {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('azure_tenant_id')
    if (stored && stored.trim()) {
      return stored.trim()
    }
  }
  return import.meta.env.VITE_AZURE_TENANT_ID || 'common'
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
        redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/` : 'http://localhost:5173/',
        postLogoutRedirectUri: typeof window !== 'undefined' ? `${window.location.origin}/` : 'http://localhost:5173/',
        navigateToLoginRequestUrl: false
      },
      cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false
      },
      system: {
        loggerOptions: {
          loggerCallback: (level, message, containsPii) => {
            if (containsPii) return
            if (level === LogLevel.Error) {
              console.error('[MSAL Error]', message)
            }
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
 * Converts MSAL login response into standard Campus User Profile
 */
async function buildUserProfileFromLoginResponse(loginResponse) {
  const account = loginResponse.account

  let graphData = null
  if (loginResponse.accessToken) {
    try {
      const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${loginResponse.accessToken}`
        }
      })
      if (graphResponse.ok) {
        graphData = await graphResponse.json()
      }
    } catch (graphErr) {
      console.warn('[MSAL] Microsoft Graph fetch skipped:', graphErr.message)
    }
  }

  const email = (account?.username || graphData?.mail || graphData?.userPrincipalName || '').toLowerCase()
  const name = account?.name || graphData?.displayName || email.split('@')[0]
  const jobTitle = graphData?.jobTitle || ''
  const department = graphData?.department || 'COEP Technological University'

  const isInstitutional = email.endsWith('@coeptech.ac.in') || email.endsWith('@coep.ac.in')

  if (!isInstitutional) {
    const domainError = new Error(
      `Access restricted: The Microsoft account (${email}) is not from @coeptech.ac.in or @coep.ac.in.`
    )
    domainError.code = 'NON_INSTITUTIONAL_DOMAIN'
    throw domainError
  }

  return {
    success: true,
    account,
    userProfile: {
      id: account?.homeAccountId || `COEP-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email,
      jobTitle,
      department,
      role: deriveRoleFromClaims(email, jobTitle),
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
 * Triggers Microsoft 365 / Outlook login popup window.
 * Resolves any stale interaction locks cleanly.
 */
export async function loginWithOutlook(options = {}) {
  const clientId = options.clientId || getAzureClientId()
  const tenantId = options.tenantId || getAzureTenantId()

  if (!clientId) {
    const error = new Error('AZURE_NOT_CONFIGURED')
    error.code = 'AZURE_NOT_CONFIGURED'
    throw error
  }

  // Pre-emptively clear any stale interaction lock before launching
  clearStaleMsalInteractionStatus()

  const pca = await getMsalInstance(clientId, tenantId)

  // 1. Check if an account is already authenticated in session
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
      // If silent acquisition fails (e.g. expired), proceed to interactive popup
    }
  }

  // 2. Launch popup with automatic recovery if an interaction was stuck
  try {
    const loginResponse = await pca.loginPopup(loginRequest)
    return await buildUserProfileFromLoginResponse(loginResponse)
  } catch (error) {
    if (error.errorCode === 'interaction_in_progress' || error.message?.includes('interaction_in_progress')) {
      clearStaleMsalInteractionStatus()
      await new Promise((resolve) => setTimeout(resolve, 200))
      try {
        const retryResponse = await pca.loginPopup(loginRequest)
        return await buildUserProfileFromLoginResponse(retryResponse)
      } catch (retryErr) {
        throw formatMsalError(retryErr)
      }
    }
    throw formatMsalError(error)
  }
}

/**
 * Derives appropriate campus role based on email and Microsoft directory claims.
 */
function deriveRoleFromClaims(email, jobTitle) {
  const lowerEmail = email.toLowerCase()
  const lowerTitle = (jobTitle || '').toLowerCase()

  if (lowerEmail.includes('admin') || lowerTitle.includes('estate') || lowerTitle.includes('admin')) {
    return 'Administrator'
  }
  if (lowerEmail.includes('faculty') || lowerTitle.includes('professor') || lowerTitle.includes('faculty') || lowerTitle.includes('lecturer')) {
    return 'Faculty'
  }
  if (lowerEmail.includes('club') || lowerEmail.includes('mindspark') || lowerEmail.includes('gymkhana')) {
    return 'Club Lead'
  }
  return 'Student'
}

/**
 * Logout from Microsoft session.
 */
export async function logoutFromOutlook() {
  try {
    const clientId = getAzureClientId()
    if (!clientId) return
    const pca = await getMsalInstance()
    const activeAccount = pca.getActiveAccount() || pca.getAllAccounts()[0]
    if (activeAccount) {
      await pca.logoutPopup({ account: activeAccount })
    }
  } catch (err) {
    console.warn('[MSAL] Logout exception:', err)
  }
}
