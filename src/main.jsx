import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// ─────────────────────────────────────────────────────────────────────────────
// Microsoft OAuth Callback Handler
//
// We detect #code= in the URL IMMEDIATELY when the module loads — before React
// renders — and start processing. The result promise is passed to <App> so that
// by the time the React useEffect runs, the promise is already resolved.
// ─────────────────────────────────────────────────────────────────────────────

function hasMicrosoftCode() {
  if (typeof window === 'undefined') return false
  const hash = window.location.hash.substring(1)
  const search = window.location.search.substring(1)
  const h = new URLSearchParams(hash)
  const q = new URLSearchParams(search)
  return !!(h.get('code') || q.get('code') || h.get('error') || q.get('error'))
}

// Start processing immediately — don't wait for useEffect
const msalRedirectPromise = hasMicrosoftCode()
  ? import('./lib/msalAuth').then(({ handleOAuthCallback }) => handleOAuthCallback())
      .catch(err => {
        console.error('[main] OAuth callback error:', err.message)
        return { error: err.message }
      })
  : Promise.resolve(null)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App msalRedirectPromise={msalRedirectPromise} />
    </ErrorBoundary>
  </StrictMode>,
)
