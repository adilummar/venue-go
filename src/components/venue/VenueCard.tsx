import Image from "next/image";
import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { WishlistButton } from "./WishlistButton";
import { StarRating } from "@/components/shared/StarRating";
import { Badge } from "@/components/shared/Badge";
import { formatPrice } from "@/lib/utils";
import { VenueSummary } from "@/types";

interface VenueCardProps {
  venue: VenueSummary;
  priority?: boolean;
}

export const VenueCard = ({ venue, priority = false }: VenueCardProps) => {
  console.log(`[VenueCard] Venue: ${venue.name}, heroImageUrl:`, venue.heroImageUrl);
  return (
    <Link href={`/venue/${venue.id}`} className="block">
      <div className="bg-[#1c1f22] rounded-xl overflow-hidden border border-[#242830] transition-all hover:border-[#353c45] active:scale-[0.99]" style={{ height: "579.5px" }}>
        {/* Image */}
        <div className="relative w-full" style={{ height: "427.5px" }}>
          {/* Use plain img for local /uploads paths; Next Image for external CDN URLs */}
          {venue.heroImageUrl ? (
            venue.heroImageUrl.startsWith("/uploads") ? (
              <img
                src={venue.heroImageUrl}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={venue.heroImageUrl}
                alt={venue.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={priority}
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#2a2a2a] text-6xl opacity-30">
              🏛️
            </div>
          )}
          {/* Wishlist button */}
          <div className="absolute top-3 right-3">
            <WishlistButton venueId={venue.id} />
          </div>
          {/* Curated badge */}
          {venue.isCurated && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="curated">CURATED</Badge>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-white font-bold text-base leading-tight line-clamp-2 flex-1" style={{fontFamily: 'var(--font-noto-serif)'}}>
              {venue.name}
            </h3>
            <StarRating rating={Number(venue.avgRating)} size={13} />
          </div>

          <div className="flex items-center gap-1 mt-1.5 text-neutral-400 text-sm">
            <MapPin size={12} className="shrink-0" />
            <span className="line-clamp-1">
              {venue.city}
              {venue.state ? `, ${venue.state}` : ""}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-1 text-neutral-400 text-sm">
            <Users size={12} className="shrink-0" />
            <span>{venue.seatingCapacity.toLocaleString("en-IN")} seats</span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-amber-400 font-bold text-base">
              {formatPrice(venue.pricePerEvening)}
              <span className="text-neutral-400 text-xs font-normal"> / evening</span>
            </span>
            {venue.demandLabel && (
              <span className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">
                {venue.demandLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
