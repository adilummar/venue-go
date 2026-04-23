import { NextRequest, NextResponse } from "next/server";
import { getWishlistByUser } from "@/db/queries/wishlists";
import { auth } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const venues = await getWishlistByUser(session.user.id);
    return NextResponse.json({ data: venues, error: null }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/wishlists]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
