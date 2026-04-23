import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely — handles conditional classes and conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian Rupee (INR) currency string.
 * e.g. formatPrice(125000) → "₹1,25,000"
 */
export function formatPrice(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Build a WhatsApp deep link with a prefilled message.
 * Always strip non-digits from the phone number.
 * @param phone - Phone number (any format, e.g. "+91 98765 43210")
 * @param message - Pre-filled message text
 */
export function buildWaLink(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, "");
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

/**
 * Build the WhatsApp inquiry message from the PRD template.
 */
export function buildInquiryMessage({
  venueName,
  date,
  guestCount,
  message,
}: {
  venueName: string;
  date: string;
  guestCount: number;
  message: string;
}): string {
  return `Hi, I'm interested in booking *${venueName}*.\nDate: ${date}\nGuests: ${guestCount}\nMessage: ${message}`;
}

/**
 * Generate a URL-safe slug from a venue name.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Truncate a string to a max length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + "…";
}

/**
 * Format a date string for display.
 * e.g. "2025-12-25" → "25 Dec 2025"
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
