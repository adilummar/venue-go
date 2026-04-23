import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Please add it to your .env.local file.\n" +
      "Get a free database at https://neon.tech or https://supabase.com"
  );
}

// Singleton pattern to prevent multiple Pool instances in development (HMR)
const globalForDb = globalThis as unknown as { pool: Pool };

export const pool =
  globalForDb.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000, // 5s timeout (was 2s)
    allowExitOnIdle: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });

export type DB = typeof db;
