import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

// Lazy singleton — Pool is only created on first use inside a request,
// not at module instantiation time. This prevents build failures when
// DATABASE_URL is not set in the build environment.
let _db: NodePgDatabase<typeof schema> | null = null

export function getDb(): NodePgDatabase<typeof schema> {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
    })
    _db = drizzle({ client: pool, schema })
  }
  return _db
}

// Convenience proxy — callers can use `db.select()...` as before
export const db: NodePgDatabase<typeof schema> = new Proxy(
  {} as NodePgDatabase<typeof schema>,
  {
    get(_target, prop) {
      return getDb()[prop as keyof NodePgDatabase<typeof schema>]
    },
  }
)
