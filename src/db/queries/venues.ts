import { db } from "@/db";
import { venues, venueImages, venueAmenities, amenities, reviews, users, inquiries } from "@/db/schema";
import { eq, and, ilike, gte, lte, desc, sql, count, avg } from "drizzle-orm";

export interface VenueFilters {
  city?: string;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  page?: number;
  limit?: number;
}

export async function getVenues(filters: VenueFilters = {}) {
  const { city, category, search, minPrice, maxPrice, minCapacity, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const conditions = [eq(venues.status, "live")];

  if (city) conditions.push(ilike(venues.city, `%${city}%`));
  if (category) conditions.push(eq(venues.category, category as "open_air" | "theatre" | "concert_hall" | "palatial"));
  if (search) conditions.push(ilike(venues.name, `%${search}%`));
  if (minPrice) conditions.push(gte(venues.pricePerEvening, String(minPrice)));
  if (maxPrice) conditions.push(lte(venues.pricePerEvening, String(maxPrice)));
  if (minCapacity) conditions.push(gte(venues.seatingCapacity, minCapacity));

  const [venueList, totalCount] = await Promise.all([
    db
      .select({
        id: venues.id,
        name: venues.name,
        slug: venues.slug,
        city: venues.city,
        state: venues.state,
        category: venues.category,
        seatingCapacity: venues.seatingCapacity,
        pricePerEvening: venues.pricePerEvening,
        heroImageUrl: venues.heroImageUrl,
        isCurated: venues.isCurated,
        demandLabel: venues.demandLabel,
        status: venues.status,
        avgRating: sql<string>`COALESCE(AVG(${reviews.ratingOverall}), 0)`,
        reviewCount: sql<number>`COUNT(DISTINCT ${reviews.id})`,
      })
      .from(venues)
      .leftJoin(reviews, eq(reviews.venueId, venues.id))
      .where(and(...conditions))
      .groupBy(venues.id)
      .orderBy(desc(venues.isCurated), desc(venues.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(venues)
      .where(and(...conditions)),
  ]);

  return {
    venues: venueList,
    total: totalCount[0]?.count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((totalCount[0]?.count ?? 0) / limit),
  };
}

export async function getVenueById(id: string) {
  const venue = await db
    .select()
    .from(venues)
    .where(eq(venues.id, id))
    .limit(1);

  if (!venue[0]) return null;

  const [images, venueAmenitiesData, owner, ratingStats] = await Promise.all([
    db
      .select()
      .from(venueImages)
      .where(eq(venueImages.venueId, id))
      .orderBy(venueImages.position),
    db
      .select({ amenity: amenities })
      .from(venueAmenities)
      .leftJoin(amenities, eq(amenities.id, venueAmenities.amenityId))
      .where(eq(venueAmenities.venueId, id)),
    db
      .select({
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        whatsapp: users.whatsapp,
        hostSince: users.hostSince,
        responseTime: users.responseTime,
        isSuperhost: users.isSuperhost,
      })
      .from(users)
      .where(eq(users.id, venue[0].ownerId))
      .limit(1),
    db
      .select({
        avgOverall: sql<string>`COALESCE(AVG(${reviews.ratingOverall}), 0)`,
        avgAcoustics: sql<string>`COALESCE(AVG(${reviews.ratingAcoustics}), 0)`,
        avgCommunication: sql<string>`COALESCE(AVG(${reviews.ratingCommunication}), 0)`,
        avgCleanliness: sql<string>`COALESCE(AVG(${reviews.ratingCleanliness}), 0)`,
        avgLocation: sql<string>`COALESCE(AVG(${reviews.ratingLocation}), 0)`,
        reviewCount: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(eq(reviews.venueId, id)),
  ]);

  return {
    ...venue[0],
    images,
    amenities: venueAmenitiesData.map((va) => va.amenity).filter(Boolean),
    owner: owner[0] ?? null,
    ratingStats: ratingStats[0],
  };
}

export async function getVenueBySlug(slug: string) {
  const venue = await db
    .select()
    .from(venues)
    .where(eq(venues.slug, slug))
    .limit(1);
  return venue[0] ?? null;
}

export async function createVenue(
  data: typeof venues.$inferInsert,
  images?: string[]
) {
  const result = await db.insert(venues).values(data).returning();
  const venue = result[0];

  // Save all images to venue_images table
  if (images && images.length > 0) {
    await db.insert(venueImages).values(
      images.map((url, i) => ({
        venueId: venue.id,
        url,
        isHero: i === 0,
        position: i,
      }))
    );
  }

  return venue;
}

export async function updateVenue(
  id: string,
  data: Partial<typeof venues.$inferInsert>,
  images?: string[]
) {
  const result = await db
    .update(venues)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(venues.id, id))
    .returning();

  // Replace images if a new array was provided
  if (images !== undefined) {
    await db.delete(venueImages).where(eq(venueImages.venueId, id));
    if (images.length > 0) {
      await db.insert(venueImages).values(
        images.map((url, i) => ({
          venueId: id,
          url,
          isHero: i === 0,
          position: i,
        }))
      );
    }
  }

  return result[0];
}

export async function getVenuesByOwner(ownerId: string) {
  return db
    .select({
      id: venues.id,
      name: venues.name,
      slug: venues.slug,
      status: venues.status,
      seatingCapacity: venues.seatingCapacity,
      heroImageUrl: venues.heroImageUrl,
      demandLabel: venues.demandLabel,
      address: venues.address,
      city: venues.city,
      createdAt: venues.createdAt,
    })
    .from(venues)
    .where(eq(venues.ownerId, ownerId))
    .orderBy(desc(venues.createdAt));
}

/** Alias used by Owner Dashboard page */
export const getOwnerVenues = getVenuesByOwner;

export async function getOwnerVenueStats(ownerId: string) {
  const stats = await db
    .select({
      total: count(),
      live: sql<number>`COUNT(*) FILTER (WHERE ${venues.status} = 'live')`,
      draft: sql<number>`COUNT(*) FILTER (WHERE ${venues.status} = 'draft')`,
      archived: sql<number>`COUNT(*) FILTER (WHERE ${venues.status} = 'archived')`,
      pendingReview: sql<number>`COUNT(*) FILTER (WHERE ${venues.status} = 'pending_review')`,
    })
    .from(venues)
    .where(eq(venues.ownerId, ownerId));
  return stats[0];
}

/**
 * Aggregate stats for the owner dashboard —
 * active listings, today's inquiries, monthly revenue.
 */
export async function getOwnerStats(ownerId: string) {
  const today = new Date().toISOString().split("T")[0];

  const [venueStats, todayInquiries] = await Promise.all([
    getOwnerVenueStats(ownerId),
    db
      .select({ cnt: count() })
      .from(inquiries)
      .where(
        and(
          eq(inquiries.ownerId, ownerId),
          sql`DATE(${inquiries.createdAt}) = ${today}::date`
        )
      ),
  ]);

  return {
    activeListings: venueStats?.live ?? 0,
    inquiriesToday: todayInquiries[0]?.cnt ?? 0,
    monthlyRevenue: 0, // expand later from bookings
    ...venueStats,
  };
}
