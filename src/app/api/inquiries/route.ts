import { NextRequest, NextResponse } from "next/server";
import { createInquiry, getInquiriesByCustomer } from "@/db/queries/inquiries";
import { getVenueById } from "@/db/queries/venues";
import { createInquirySchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendPushNotification } from "@/lib/push";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const inquiries = await getInquiriesByCustomer(session.user.id);
    return NextResponse.json({ data: inquiries, error: null }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/inquiries]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createInquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const venue = await getVenueById(parsed.data.venueId);
    if (!venue) {
      return NextResponse.json({ data: null, error: "Venue not found" }, { status: 404 });
    }

    const inquiry = await createInquiry({
      ...parsed.data,
      customerId: session.user.id,
      ownerId: venue.ownerId,
    });

    // 🔔 Push notification to owner — non-blocking
    sendOwnerPush(venue.ownerId, {
      customerName: session.user.name ?? "Someone",
      venueName: venue.name,
      guestCount: parsed.data.guestCount,
      eventDate: parsed.data.eventDate,
    }).catch(() => {});

    return NextResponse.json({ data: inquiry, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/inquiries]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

async function sendOwnerPush(
  ownerId: string,
  info: { customerName: string; venueName: string; guestCount: number; eventDate: string }
) {
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, ownerId));

  await Promise.all(
    subs.map((sub) =>
      sendPushNotification(sub, {
        title: "📩 New Inquiry!",
        body: `${info.customerName} is interested in ${info.venueName} for ${info.guestCount} guests on ${info.eventDate}.`,
        icon: "/icons/icon-192.png",
        url: "/owner/inquiries",
        tag: "new-inquiry",
      })
    )
  );
}
