import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function GET() {
  try {
    const result = await db.insert(users).values({
      name: "Test Owner",
      email: "testowner2@venuego.dev",
      passwordHash: "dummyhash",
      role: "owner"
    }).returning();

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message, 
      stack: err.stack,
      detail: err.detail,
      code: err.code
    }, { status: 500 });
  }
}
