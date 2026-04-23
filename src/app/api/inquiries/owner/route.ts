import { NextRequest, NextResponse } from "next/server";
import { getInquiriesByOwner, getOwnerInquiryStats } from "@/db/queries/inquiries";
import { auth } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "owner" && session.user.role !== "admin") {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    const [inquiries, stats] = await Promise.all([
      getInquiriesByOwner(session.user.id),
      getOwnerInquiryStats(session.user.id),
    ]);

    return NextResponse.json({ data: { inquiries, stats }, error: null }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/inquiries/owner]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
