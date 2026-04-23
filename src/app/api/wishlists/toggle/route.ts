import { NextRequest, NextResponse } from "next/server";
import { toggleWishlist } from "@/db/queries/wishlists";
import { toggleWishlistSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = toggleWishlistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await toggleWishlist(session.user.id, parsed.data.venueId);
    return NextResponse.json({ data: result, error: null }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/wishlists/toggle]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
