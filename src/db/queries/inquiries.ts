import { db } from "@/db";
import { inquiries, venues, users } from "@/db/schema";
import { eq, and, desc, count, gte, sql } from "drizzle-orm";

export async function createInquiry(data: typeof inquiries.$inferInsert) {
  const result = await db.insert(inquiries).values(data).returning();
  return result[0];
}

export async function getInquiriesByOwner(
  ownerId: string,
  options: { status?: string; limit?: number; offset?: number } = {}
) {
  const { status, limit = 50, offset = 0 } = options;

  const conditions = [eq(inquiries.ownerId, ownerId)];
  if (status) {
    conditions.push(eq(inquiries.status, status as "new" | "responded" | "archived"));
  }

  return db
    .select({
      id: inquiries.id,
      eventDate: inquiries.eventDate,
      guestCount: inquiries.guestCount,
      message: inquiries.message,
      status: inquiries.status,
      whatsappSent: inquiries.whatsappSent,
      createdAt: inquiries.createdAt,
      venue: {
        id: venues.id,
        name: venues.name,
        address: venues.address,
        city: venues.city,
        pricePerEvening: venues.pricePerEvening,
        heroImageUrl: venues.heroImageUrl,
      },
      customer: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        whatsapp: users.whatsapp,
        phone: users.phone,
      },
    })
    .from(inquiries)
    .leftJoin(venues, eq(venues.id, inquiries.venueId))
    .leftJoin(users, eq(users.id, inquiries.customerId))
    .where(and(...conditions))
    .orderBy(desc(inquiries.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getInquiriesByCustomer(customerId: string) {
  return db
    .select({
      id: inquiries.id,
      eventDate: inquiries.eventDate,
      guestCount: inquiries.guestCount,
      message: inquiries.message,
      status: inquiries.status,
      createdAt: inquiries.createdAt,
      venue: {
        id: venues.id,
        name: venues.name,
        city: venues.city,
        heroImageUrl: venues.heroImageUrl,
      },
    })
    .from(inquiries)
    .leftJoin(venues, eq(venues.id, inquiries.venueId))
    .where(eq(inquiries.customerId, customerId))
    .orderBy(desc(inquiries.createdAt));
}

export async function updateInquiryStatus(
  id: string,
  status: "new" | "responded" | "archived",
  whatsappSent?: boolean
) {
  const result = await db
    .update(inquiries)
    .set({
      status,
      ...(whatsappSent !== undefined ? { whatsappSent } : {}),
      updatedAt: new Date(),
    })
    .where(eq(inquiries.id, id))
    .returning();
  return result[0];
}

export async function getOwnerInquiryStats(ownerId: string) {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [statsResult] = await db
    .select({
      total: count(),
      pendingWhatsApp: sql<number>`COUNT(*) FILTER (WHERE ${inquiries.status} = 'new' AND ${inquiries.whatsappSent} = false)`,
    })
    .from(inquiries)
    .where(and(eq(inquiries.ownerId, ownerId), gte(inquiries.createdAt, weekAgo)));

  const [revenueResult] = await db
    .select({
      potentialRevenue: sql<number>`COALESCE(SUM(${venues.pricePerEvening}::numeric), 0)`,
    })
    .from(inquiries)
    .leftJoin(venues, eq(venues.id, inquiries.venueId))
    .where(
      and(
        eq(inquiries.ownerId, ownerId),
        eq(inquiries.status, "new"),
        gte(inquiries.createdAt, weekAgo)
      )
    );

  return {
    total: statsResult?.total ?? 0,
    pendingWhatsApp: statsResult?.pendingWhatsApp ?? 0,
    potentialRevenue: revenueResult?.potentialRevenue ?? 0,
  };
}
