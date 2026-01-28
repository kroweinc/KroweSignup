import { createClient } from '@supabase/supabase-js'
import { ENV } from './env'

export function createServerSupabaseClient() {
  // For now we use anon key.
  // Later you'll switch to a proper server client with cookies.
  return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY)
}
