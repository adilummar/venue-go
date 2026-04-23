export const CATEGORIES = [
  { value: "open_air", label: "Open-air", emoji: "🌿" },
  { value: "theatre", label: "Theatres", emoji: "🎭" },
  { value: "concert_hall", label: "Concert Halls", emoji: "🎶" },
  { value: "palatial", label: "Palatial", emoji: "🏛️" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const AMENITIES = [
  { id: 1, name: "Central AC", label: "Central AC", icon: "ac", emoji: "❄️" },
  { id: 2, name: "Stage Cam", label: "Stage Cam", icon: "camera", emoji: "📹" },
  { id: 3, name: "High-speed WiFi", label: "High-speed WiFi", icon: "wifi", emoji: "📶" },
  { id: 4, name: "Grand Piano", label: "Grand Piano", icon: "piano", emoji: "🎹" },
  { id: 5, name: "Parking Lot", label: "Parking Lot", icon: "parking", emoji: "🅿️" },
  { id: 6, name: "Catering Area", label: "Catering Area", icon: "catering", emoji: "🍽️" },
  { id: 7, name: "Green Room", label: "Green Room", icon: "greenroom", emoji: "🎤" },
  { id: 8, name: "Ramps", label: "Ramps", icon: "ramps", emoji: "♿" },
] as const;

export const INDIAN_CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Chandigarh",
  "Kochi",
  "Surat",
  "Vadodara",
  "Indore",
  "Bhopal",
  "Nagpur",
  "Visakhapatnam",
  "Coimbatore",
  "Mysuru",
] as const;

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-600" },
  pending_review: { label: "Pending Review", color: "bg-amber-100 text-amber-700" },
  live: { label: "Live", color: "bg-emerald-100 text-emerald-700" },
  archived: { label: "Archived", color: "bg-red-100 text-red-600" },
};

export const BOOKING_STATUS_LABELS: Record<
  string,
  { label: string; color: string }
> = {
  processing: {
    label: "Processing",
    color: "border border-slate-300 text-slate-600",
  },
  confirmed: { label: "Confirmed", color: "bg-emerald-100 text-emerald-700" },
  completed: { label: "Completed", color: "bg-blue-100 text-blue-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-600" },
};

export const INQUIRY_STATUS_LABELS: Record<
  string,
  { label: string; color: string }
> = {
  new: { label: "New", color: "bg-amber-100 text-amber-700" },
  responded: { label: "Message Sent", color: "bg-emerald-100 text-emerald-700" },
  archived: { label: "Archived", color: "bg-slate-100 text-slate-500" },
};

export const DEMAND_LABELS = [
  "High demand",
  "Popular",
  "Trending",
  "Newly listed",
] as const;

export const WHATSAPP_COLOR = "#25D366";
export const WHATSAPP_BG_CLASS = "bg-[#25D366]";

export const APP_NAME = "VenueGo";
export const APP_VERSION = "2.4.0";
export const SUPPORT_EMAIL = "support@venuego.in";
