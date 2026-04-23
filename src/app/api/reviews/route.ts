import { NextRequest, NextResponse } from "next/server";
import { createReview } from "@/db/queries/reviews";
import { createReviewSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const review = await createReview({
      ...parsed.data,
      ratingOverall: String(parsed.data.ratingOverall),
      ratingAcoustics: parsed.data.ratingAcoustics != null ? String(parsed.data.ratingAcoustics) : undefined,
      ratingCommunication: parsed.data.ratingCommunication != null ? String(parsed.data.ratingCommunication) : undefined,
      ratingCleanliness: parsed.data.ratingCleanliness != null ? String(parsed.data.ratingCleanliness) : undefined,
      ratingLocation: parsed.data.ratingLocation != null ? String(parsed.data.ratingLocation) : undefined,
      customerId: session.user.id,
    });

    return NextResponse.json({ data: review, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/reviews]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
