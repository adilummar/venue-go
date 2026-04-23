import { NextRequest, NextResponse } from "next/server";
import { getReviewsByVenue } from "@/db/queries/reviews";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");

    const result = await getReviewsByVenue(venueId, page, limit);
    return NextResponse.json(
      {
        data: result,
        error: null,
        meta: { total: result.total, page, limit, totalPages: result.totalPages },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[GET /api/reviews/[venueId]]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
