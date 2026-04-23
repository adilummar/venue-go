import { z } from "zod";

export const venueFilterSchema = z.object({
  city: z.string().optional(),
  category: z
    .enum(["open_air", "theatre", "concert_hall", "palatial"])
    .optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  minCapacity: z.coerce.number().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const createVenueSchema = z.object({
  name: z.string().min(3, "Venue name must be at least 3 characters"),
  description: z.string().optional(),
  address: z.string().min(10, "Please enter a full address"),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  category: z.enum(["open_air", "theatre", "concert_hall", "palatial"], {
    required_error: "Please select a category",
  }),
  seatingCapacity: z.coerce
    .number()
    .int()
    .positive("Seating capacity must be a positive number"),
  pricePerEvening: z.coerce
    .number()
    .positive("Price must be a positive number"),
  heroImageUrl: z.string().url().optional(),
  whatsapp: z
    .string()
    .regex(/^\+?91\d{10}$/, "Enter a valid Indian WhatsApp number (+91XXXXXXXXXX)")
    .optional(),
  amenityIds: z.array(z.number().int()).optional(),
  status: z.enum(["draft", "live"]).optional(),
});

export const updateVenueSchema = createVenueSchema.partial().extend({
  status: z
    .enum(["draft", "pending_review", "live", "archived"])
    .optional(),
  isCurated: z.boolean().optional(),
  demandLabel: z.string().optional(),
});

export type VenueFilterInput = z.infer<typeof venueFilterSchema>;
export type CreateVenueInput = z.infer<typeof createVenueSchema>;
export type UpdateVenueInput = z.infer<typeof updateVenueSchema>;
