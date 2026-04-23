import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// UUID v4 regex — Postgres will throw on non-UUID strings (e.g. Google provider IDs)
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getUserById(id: string) {
  if (!UUID_RE.test(id)) return null; // not a UUID — skip DB call
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Resolves a user from session data.
 * Tries DB UUID first; if the session still holds a Google provider ID
 * (the old broken token), it automatically falls back to email lookup.
 * This lets Google OAuth users use the app without re-logging in.
 */
export async function resolveSessionUser(sessionUser: {
  id: string;
  email?: string | null;
}) {
  const byId = await getUserById(sessionUser.id);
  if (byId) return byId;
  if (sessionUser.email) return getUserByEmail(sessionUser.email);
  return null;
}

export async function updateUser(
  id: string,
  data: Partial<typeof users.$inferInsert>
) {
  const result = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return result[0];
}

export async function createUser(data: typeof users.$inferInsert) {
  const result = await db.insert(users).values(data).returning();
  return result[0];
}
