// ─── Venue Types ──────────────────────────────────────────────────────────────
export interface VenueSummary {
  id: string;
  name: string;
  slug: string;
  city: string;
  state?: string | null;
  category: "open_air" | "theatre" | "concert_hall" | "palatial";
  seatingCapacity: number;
  pricePerEvening: string;
  heroImageUrl?: string | null;
  isCurated?: boolean | null;
  demandLabel?: string | null;
  status: "draft" | "pending_review" | "live" | "archived";
  avgRating: string;
  reviewCount: number;
}

export interface VenueImage {
  id: string;
  venueId: string;
  url: string;
  isHero?: boolean | null;
  position?: number | null;
  createdAt?: Date | null;
}

export interface Amenity {
  id: number;
  name: string;
  icon?: string | null;
}

export interface VenueRatingStats {
  avgOverall: string;
  avgAcoustics: string;
  avgCommunication: string;
  avgCleanliness: string;
  avgLocation: string;
  reviewCount: number;
}

export interface VenueOwner {
  id: string;
  name: string;
  avatarUrl?: string | null;
  whatsapp?: string | null;
  hostSince?: number | null;
  responseTime?: string | null;
  isSuperhost?: boolean | null;
}

export interface VenueDetail extends VenueSummary {
  description?: string | null;
  address: string;
  latitude?: string | null;
  longitude?: string | null;
  images: VenueImage[];
  amenities: Amenity[];
  owner: VenueOwner | null;
  ratingStats: VenueRatingStats;
}

// ─── User Types ───────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  role: "customer" | "owner" | "admin";
  membership?: "standard" | "patron_circle" | null;
  hostSince?: number | null;
  responseTime?: string | null;
  isSuperhost?: boolean | null;
  createdAt?: Date | null;
}

// ─── Inquiry Types ────────────────────────────────────────────────────────────
export interface InquiryWithVenue {
  id: string;
  eventDate?: string | null;
  expectedGuests?: number | null;
  guestCount?: number | null;
  message?: string | null;
  status: "new" | "responded" | "archived" | "pending";
  whatsappSent?: boolean | null;
  createdAt?: Date | null;
  venue: {
    id: string;
    name: string;
    address?: string | null;
    city?: string | null;
    pricePerEvening: string;
    heroImageUrl?: string | null;
  } | null;
  customer: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    whatsapp?: string | null;
    phone?: string | null;
  } | null;
}

// ─── Booking Types ────────────────────────────────────────────────────────────
export interface BookingWithVenue {
  id: string;
  bookingRef: string;
  eventName?: string | null;
  area?: string | null;
  eventDate: string;
  startTime?: string | null;
  endTime?: string | null;
  guestCount?: number | null;
  status: "processing" | "confirmed" | "completed" | "cancelled";
  receiptUrl?: string | null;
  createdAt?: Date | null;
  venue: {
    id: string;
    name: string;
    city: string;
    heroImageUrl?: string | null;
  } | null;
}

// ─── Review Types ─────────────────────────────────────────────────────────────
export interface ReviewWithCustomer {
  id: string;
  ratingOverall: string;
  ratingAcoustics?: string | null;
  ratingCommunication?: string | null;
  ratingCleanliness?: string | null;
  ratingLocation?: string | null;
  body?: string | null;
  createdAt?: Date | null;
  customer: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  } | null;
}

// ─── API Response Types ───────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

// ─── Owner Dashboard Types ────────────────────────────────────────────────────
export interface OwnerStats {
  activeListings: number;
  inquiriesToday: number;
  monthlyRevenue: number;
  total?: number;
  live?: number;
  draft?: number;
  archived?: number;
  pendingReview?: number;
}

export interface OwnerInquiryStats {
  total: number;
  pendingWhatsApp: number;
  potentialRevenue: number;
  totalInquiries?: number;
  newInquiries?: number;
  inquiriesToday?: number;
  pendingWhatsapp?: number;
}

// ─── Owner Venue Listing ──────────────────────────────────────────────────────
export interface OwnerVenueListing {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "pending_review" | "live" | "archived";
  seatingCapacity: number;
  heroImageUrl?: string | null;
  demandLabel?: string | null;
  address?: string | null;
  city: string;
  createdAt?: Date | null;
}
