import { db } from "@/db";
import { wishlists, venues, reviews } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function toggleWishlist(userId: string, venueId: string) {
  const existing = await db
    .select()
    .from(wishlists)
    .where(and(eq(wishlists.customerId, userId), eq(wishlists.venueId, venueId)))
    .limit(1);

  if (existing[0]) {
    await db
      .delete(wishlists)
      .where(
        and(eq(wishlists.customerId, userId), eq(wishlists.venueId, venueId))
      );
    return { wishlisted: false };
  } else {
    await db.insert(wishlists).values({ customerId: userId, venueId });
    return { wishlisted: true };
  }
}

export async function getWishlistByUser(userId: string) {
  return db
    .select({
      id: venues.id,
      name: venues.name,
      slug: venues.slug,
      city: venues.city,
      category: venues.category,
      seatingCapacity: venues.seatingCapacity,
      pricePerEvening: venues.pricePerEvening,
      heroImageUrl: venues.heroImageUrl,
      isCurated: venues.isCurated,
      avgRating: sql<string>`COALESCE(AVG(${reviews.ratingOverall}), 0)`,
      savedAt: wishlists.createdAt,
    })
    .from(wishlists)
    .leftJoin(venues, eq(venues.id, wishlists.venueId))
    .leftJoin(reviews, eq(reviews.venueId, wishlists.venueId))
    .where(eq(wishlists.customerId, userId))
    .groupBy(venues.id, wishlists.createdAt);
}

export async function isVenueWishlisted(userId: string, venueId: string) {
  const result = await db
    .select()
    .from(wishlists)
    .where(and(eq(wishlists.customerId, userId), eq(wishlists.venueId, venueId)))
    .limit(1);
  return !!result[0];
}
