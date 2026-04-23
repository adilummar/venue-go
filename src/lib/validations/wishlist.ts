import { z } from "zod";

export const toggleWishlistSchema = z.object({
  venueId: z.string().uuid("Invalid venue ID"),
});

export type ToggleWishlistInput = z.infer<typeof toggleWishlistSchema>;
