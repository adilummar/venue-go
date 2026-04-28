import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { bookings, inquiries, venues } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  inquiryId: z.string().uuid(),
  eventName: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

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
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Fetch inquiry — ensure owner owns the venue
    const [inquiry] = await db
      .select({
        id: inquiries.id,
        venueId: inquiries.venueId,
        customerId: inquiries.customerId,
        ownerId: inquiries.ownerId,
        eventDate: inquiries.eventDate,
        guestCount: inquiries.guestCount,
        message: inquiries.message,
        status: inquiries.status,
      })
      .from(inquiries)
      .where(eq(inquiries.id, parsed.data.inquiryId))
      .limit(1);

    if (!inquiry) {
      return NextResponse.json({ data: null, error: "Inquiry not found" }, { status: 404 });
    }

    if (inquiry.ownerId !== session.user.id) {
      return NextResponse.json({ data: null, error: "Forbidden — you don't own this venue" }, { status: 403 });
    }

    if (inquiry.status === "archived") {
      return NextResponse.json({ data: null, error: "Cannot create booking from archived inquiry" }, { status: 400 });
    }

    // Generate booking ref manually (trigger may not be available in all environments)
    const refNum = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `VG-${refNum}`;

    // Create the booking
    const [booking] = await db
      .insert(bookings)
      .values({
        bookingRef,
        venueId: inquiry.venueId,
        customerId: inquiry.customerId,
        inquiryId: inquiry.id,
        eventName: parsed.data.eventName ?? "Event",
        eventDate: inquiry.eventDate,
        startTime: parsed.data.startTime ?? null,
        endTime: parsed.data.endTime ?? null,
        guestCount: inquiry.guestCount,
        status: "confirmed",
      })
      .returning();

    // Update inquiry → responded + whatsapp_sent
    await db
      .update(inquiries)
      .set({ status: "responded", whatsappSent: true, updatedAt: new Date() })
      .where(eq(inquiries.id, inquiry.id));

    return NextResponse.json({ data: booking, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/bookings/from-inquiry]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
