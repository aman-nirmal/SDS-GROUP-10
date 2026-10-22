import { createClient } from '@supabase/supabase-js'
import { config } from './env.js'

let supabaseClient = null

if (config.supabaseUrl && config.supabaseKey) {
  try {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseKey)
    console.log('[Database] Supabase PostgreSQL client initialized.')
  } catch (error) {
    console.warn('[Database] Failed to initialize Supabase client:', error.message)
  }
} else {
  console.log('[Database] Supabase credentials not found in env. Running in resilient local mode.')
}

export const supabase = supabaseClient
