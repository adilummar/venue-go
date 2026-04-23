import { z } from "zod";

export const createBookingSchema = z.object({
  venueId: z.string().uuid("Invalid venue ID"),
  inquiryId: z.string().uuid().optional(),
  eventName: z.string().min(2, "Event name is required").optional(),
  area: z.string().optional(),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Time must be HH:MM")
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Time must be HH:MM")
    .optional(),
  guestCount: z.coerce.number().int().positive().optional(),
  status: z
    .enum(["processing", "confirmed", "completed", "cancelled"])
    .default("processing"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
