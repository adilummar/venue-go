import { z } from "zod";

export const createReviewSchema = z.object({
  venueId: z.string().uuid("Invalid venue ID"),
  ratingOverall: z.coerce
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  ratingAcoustics: z.coerce.number().min(1).max(5).optional(),
  ratingCommunication: z.coerce.number().min(1).max(5).optional(),
  ratingCleanliness: z.coerce.number().min(1).max(5).optional(),
  ratingLocation: z.coerce.number().min(1).max(5).optional(),
  body: z.string().max(2000, "Review must be under 2000 characters").optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
