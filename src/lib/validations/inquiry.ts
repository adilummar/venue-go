import { z } from "zod";

export const createInquirySchema = z.object({
  venueId: z.string().uuid("Invalid venue ID"),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  guestCount: z.coerce
    .number()
    .int()
    .positive("Guest count must be at least 1")
    .max(10000, "Guest count seems too high"),
  message: z
    .string()
    .max(1000, "Message must be under 1000 characters")
    .optional(),
});

export const updateInquiryStatusSchema = z.object({
  status: z.enum(["new", "responded", "archived"]),
  whatsappSent: z.boolean().optional(),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type UpdateInquiryStatusInput = z.infer<typeof updateInquiryStatusSchema>;
