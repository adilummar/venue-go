import { db } from "@/db";
import { reviews, users } from "@/db/schema";
import { eq, desc, sql, count } from "drizzle-orm";

export async function getReviewsByVenue(
  venueId: string,
  page = 1,
  limit = 10
) {
  const offset = (page - 1) * limit;

  const [reviewList, totalResult] = await Promise.all([
    db
      .select({
        id: reviews.id,
        ratingOverall: reviews.ratingOverall,
        ratingAcoustics: reviews.ratingAcoustics,
        ratingCommunication: reviews.ratingCommunication,
        ratingCleanliness: reviews.ratingCleanliness,
        ratingLocation: reviews.ratingLocation,
        body: reviews.body,
        createdAt: reviews.createdAt,
        customer: {
          id: users.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(users.id, reviews.customerId))
      .where(eq(reviews.venueId, venueId))
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.venueId, venueId)),
  ]);

  return {
    reviews: reviewList,
    total: totalResult[0]?.count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((totalResult[0]?.count ?? 0) / limit),
  };
}

export async function createReview(data: typeof reviews.$inferInsert) {
  const result = await db.insert(reviews).values(data).returning();
  return result[0];
}

export async function getVenueRatingStats(venueId: string) {
  const result = await db
    .select({
      avgOverall: sql<string>`COALESCE(AVG(${reviews.ratingOverall}), 0)`,
      avgAcoustics: sql<string>`COALESCE(AVG(${reviews.ratingAcoustics}), 0)`,
      avgCommunication: sql<string>`COALESCE(AVG(${reviews.ratingCommunication}), 0)`,
      avgCleanliness: sql<string>`COALESCE(AVG(${reviews.ratingCleanliness}), 0)`,
      avgLocation: sql<string>`COALESCE(AVG(${reviews.ratingLocation}), 0)`,
      reviewCount: count(),
    })
    .from(reviews)
    .where(eq(reviews.venueId, venueId));
  return result[0];
}
