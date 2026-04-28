import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { users } from "./schema";
import bcrypt from "bcryptjs";
import { inArray } from "drizzle-orm";

async function updatePasswords() {
  console.log("Updating existing users with secure passwords...");
  const defaultPasswordHash = await bcrypt.hash("password123", 10);

  const updated = await db
    .update(users)
    .set({ passwordHash: defaultPasswordHash })
    .where(inArray(users.email, ["owner@venuego.dev", "customer@venuego.dev"]))
    .returning();

  console.log(`Updated ${updated.length} users with password 'password123'.`);
  process.exit(0);
}

updatePasswords().catch((err) => {
  console.error("Failed to update passwords:", err);
  process.exit(1);
});
