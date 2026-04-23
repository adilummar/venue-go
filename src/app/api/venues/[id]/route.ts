import { NextRequest, NextResponse } from "next/server";
import { getVenueById, updateVenue } from "@/db/queries/venues";
import { updateVenueSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const venue = await getVenueById(id);

    if (!venue) {
      return NextResponse.json({ data: null, error: "Venue not found" }, { status: 404 });
    }

    return NextResponse.json({ data: venue, error: null }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/venues/[id]]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const venue = await getVenueById(id);
    if (!venue) {
      return NextResponse.json({ data: null, error: "Venue not found" }, { status: 404 });
    }

    if (venue.ownerId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateVenueSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { pricePerEvening, ...rest } = parsed.data;
    const updateData = {
      ...rest,
      ...(pricePerEvening !== undefined ? { pricePerEvening: pricePerEvening.toString() } : {}),
    };
    const updated = await updateVenue(id, updateData);
    return NextResponse.json({ data: updated, error: null }, { status: 200 });
  } catch (err) {
    console.error("[PATCH /api/venues/[id]]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
