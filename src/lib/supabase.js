import { createClient } from '@supabase/supabase-js'

const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}

export const SUPABASE_URL =
  metaEnv.VITE_SUPABASE_URL || 'https://ozdthbfemtuaefrrxwnm.supabase.co'

function getAnonKey() {
  const envKey = metaEnv.VITE_SUPABASE_ANON_KEY
  if (
    envKey &&
    typeof envKey === 'string' &&
    envKey.trim() &&
    !envKey.startsWith('your-') &&
    !envKey.includes('placeholder') &&
    envKey !== 'undefined' &&
    envKey.length > 20
  ) {
    return envKey.trim()
  }
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('locus_supabase_anon_key')
    if (
      stored &&
      typeof stored === 'string' &&
      stored.trim() &&
      !stored.startsWith('your-') &&
      stored.length > 20
    ) {
      return stored.trim()
    }
  }
  return null
}

const supabaseAnonKey = getAnonKey()

export const isSupabaseConfigured = Boolean(SUPABASE_URL && supabaseAnonKey)

// Initialize resilient Supabase client
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null

export function setRuntimeSupabaseKey(key) {
  if (typeof window !== 'undefined') {
    if (key && key.trim()) {
      window.localStorage.setItem('locus_supabase_anon_key', key.trim())
    } else {
      window.localStorage.removeItem('locus_supabase_anon_key')
    }
  }
}
