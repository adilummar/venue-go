import { db } from "@/db";
import { bookings, venues } from "@/db/schema";
import { eq, desc, gte, lt, and } from "drizzle-orm";

export async function getBookingsByCustomer(customerId: string) {
  const now = new Date().toISOString().split("T")[0];

  const allBookings = await db
    .select({
      id: bookings.id,
      bookingRef: bookings.bookingRef,
      eventName: bookings.eventName,
      area: bookings.area,
      eventDate: bookings.eventDate,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      guestCount: bookings.guestCount,
      status: bookings.status,
      receiptUrl: bookings.receiptUrl,
      createdAt: bookings.createdAt,
      venue: {
        id: venues.id,
        name: venues.name,
        city: venues.city,
        heroImageUrl: venues.heroImageUrl,
      },
    })
    .from(bookings)
    .leftJoin(venues, eq(venues.id, bookings.venueId))
    .where(eq(bookings.customerId, customerId))
    .orderBy(desc(bookings.eventDate));

  const upcoming = allBookings.filter(
    (b) => b.eventDate >= now && b.status !== "cancelled" && b.status !== "completed"
  );
  const past = allBookings.filter(
    (b) => b.eventDate < now || b.status === "completed" || b.status === "cancelled"
  );

  return { upcoming, past };
}

export async function createBooking(data: typeof bookings.$inferInsert) {
  const result = await db.insert(bookings).values(data).returning();
  return result[0];
}

export async function getBookingById(id: string) {
  const result = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);
  return result[0] ?? null;
}
