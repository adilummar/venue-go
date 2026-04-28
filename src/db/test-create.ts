import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { users } from "./schema";
import bcrypt from "bcryptjs";

async function testCreate() {
  try {
    const passwordHash = await bcrypt.hash("test1234", 10);
    const result = await db.insert(users).values({
      name: "Test Owner",
      email: "testowner@venuego.dev",
      passwordHash,
      role: "owner"
    }).returning();
    console.log("Success:", result);
  } catch (err) {
    console.error("Error creating user:", err);
  }
  process.exit(0);
}

testCreate();
