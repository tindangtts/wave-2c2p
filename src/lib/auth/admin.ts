import { createClient } from '@supabase/supabase-js'

/**
 * Create a Supabase admin client using the SERVICE_ROLE_KEY.
 * This client bypasses Row Level Security (RLS) and must only be used server-side.
 * Never expose this client to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
