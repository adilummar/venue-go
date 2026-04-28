import { NextRequest, NextResponse } from "next/server";
import { getVenues, createVenue } from "@/db/queries/venues";
import { venueFilterSchema, createVenueSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";
import { updateUser } from "@/db/queries/users";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const parsed = venueFilterSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await getVenues(parsed.data);
    return NextResponse.json(
      { data: result, error: null, meta: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages } },
      { status: 200 }
    );
  } catch (err) {
    console.error("[GET /api/venues]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "owner" && session.user.role !== "admin") {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createVenueSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { amenityIds, whatsapp, pricePerEvening, status, images, ...venueData } = parsed.data;
    const slug = generateSlug(venueData.name);

    // Save WhatsApp to owner profile if provided
    if (whatsapp) {
      await updateUser(session.user.id, { whatsapp }).catch(() => {});
    }

    const venue = await createVenue(
      {
        ...venueData,
        pricePerEvening: pricePerEvening.toString(),
        slug,
        ownerId: session.user.id,
        // First image becomes heroImageUrl
        heroImageUrl: images?.[0] ?? venueData.heroImageUrl,
        status: (status ?? "pending_review") as "draft" | "pending_review" | "live" | "archived",
      },
      images
    );

    return NextResponse.json({ data: venue, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/venues]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
