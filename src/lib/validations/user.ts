import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z
    .string()
    .regex(/^\+?91\d{10}$/, "Enter a valid Indian phone number")
    .optional(),
  whatsapp: z
    .string()
    .regex(/^\+?91\d{10}$/, "Enter a valid Indian WhatsApp number")
    .optional(),
  avatarUrl: z.string().url("Invalid URL").optional(),
  role: z.enum(["customer", "owner"]).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
