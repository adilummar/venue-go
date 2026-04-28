import Image from "next/image";
import { MapPin, Calendar, Clock, CheckCircle } from "lucide-react";
import { Badge } from "./Badge";
import { formatDate } from "@/lib/utils";
import { BookingWithVenue } from "@/types";
import Link from "next/link";

interface BookingCardProps {
  booking: BookingWithVenue;
  variant: "upcoming" | "past";
}

const STATUS_BADGE_MAP: Record<string, "confirmed" | "processing" | "completed" | "cancelled"> = {
  confirmed: "confirmed",
  processing: "processing",
  completed: "completed",
  cancelled: "cancelled",
};

export const BookingCard = ({ booking, variant }: BookingCardProps) => {
  if (variant === "upcoming") {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden h-[500px]">
        {/* Venue image */}
        <div className="relative h-[44] bg-[#222]">
          {booking.venue?.heroImageUrl && (
            booking.venue.heroImageUrl.startsWith("/uploads") ? (
              <img src={booking.venue.heroImageUrl} alt={booking.venue.name ?? ""} className="w-full h-full object-cover" />
            ) : (
              <Image src={booking.venue.heroImageUrl} alt={booking.venue.name ?? ""} fill className="object-cover" />
            )
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant={STATUS_BADGE_MAP[booking.status] ?? "processing"}>
              {booking.status.toUpperCase()}
            </Badge>
            <span className="text-white font-bold text-sm">#{booking.bookingRef}</span>
          </div>
          <h3 className="text-white font-bold text-lg leading-snug mb-2">
            {booking.eventName ?? "Event"}
          </h3>
          <div className="flex items-start gap-1.5 text-neutral-400 text-sm mb-1">
            <MapPin size={13} className="mt-0.5 shrink-0" />
            <span>
              {booking.venue?.name} · {booking.area ?? booking.venue?.city}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-neutral-400 text-sm">
              <Calendar size={13} />
              <span>{formatDate(booking.eventDate)}</span>
            </div>
            {booking.startTime && (
              <div className="flex items-center gap-1.5 text-neutral-400 text-sm">
                <Clock size={13} />
                <span>{booking.startTime}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Past / history variant — compact
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
      <div className="flex items-center justify-between mb-1">
        <Badge variant={STATUS_BADGE_MAP[booking.status] ?? "completed"}>
          {booking.status.toUpperCase()}
        </Badge>
        <span className="text-[#BFC8CA] text-xs font-mono">#{booking.bookingRef}</span>
      </div>
      <h3 className="text-white font-semibold text-base leading-snug mt-2 mb-1">
        {booking.eventName ?? "Event"}
      </h3>
      <div className="flex items-center gap-1 text-[#BFC8CA] text-xs mb-1">
        <CheckCircle size={11} className="text-teal-400" />
        <span className="uppercase tracking-wider">
          {booking.venue?.name} · {booking.area ?? ""}
        </span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[#BFC8CA] text-xs">{formatDate(booking.eventDate)}</span>
        {booking.receiptUrl && (
          <Link
            href={booking.receiptUrl}
            target="_blank"
            className="text-amber-400 text-xs font-semibold hover:underline"
          >
            View Receipt
          </Link>
        )}
      </div>
    </div>
  );
};
