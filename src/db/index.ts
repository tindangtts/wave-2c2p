import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Lazy singleton — neon() is only called on first use inside a request,
// not at module instantiation time. This prevents build failures when
// DATABASE_URL is not set in the build environment.
let _db: NeonHttpDatabase<typeof schema> | null = null

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    const sql = neon(process.env.DATABASE_URL)
    _db = drizzle({ client: sql, schema })
  }
  return _db
}

// Convenience proxy — callers can use `db.select()...` as before
export const db: NeonHttpDatabase<typeof schema> = new Proxy(
  {} as NeonHttpDatabase<typeof schema>,
  {
    get(_target, prop) {
      return getDb()[prop as keyof NeonHttpDatabase<typeof schema>]
    },
  }
)
