import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail } from "@/db/queries/users";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["customer", "owner"]).default("customer"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    // Check duplicate
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await createUser({
      name,
      email,
      passwordHash,
      role,
    });

    return NextResponse.json(
      { data: { id: user.id, email: user.email, name: user.name, role: user.role } },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json(
      { error: "Internal server error: " + (err.message || err.toString()) },
      { status: 500 }
    );
  }
}
