import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWishlistByUser } from "@/db/queries/wishlists";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Users, Heart, Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { WishlistButton } from "@/components/venue/WishlistButton";
import { StarRating } from "@/components/shared/StarRating";

export const metadata: Metadata = {
  title: "Saved Venues — VenueGo",
  description: "Your saved auditoriums and event spaces on VenueGo.",
};

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const venues = await getWishlistByUser(session.user.id);

  return (
    <div className="min-h-screen bg-[#121416]">
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 pb-3 bg-[#1A1C1E]"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 16px)",
          boxShadow: "0px 2px 4px -2px #0000001A, 0px 4px 6px -1px #0000001A",
        }}
      >
        <BrandLogo size="lg" />
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1c1f22] border border-[#242830] active:scale-90 transition-transform">
          <Search size={18} className="text-neutral-400" />
        </button>
      </header>

      {/* Title */}
      <div className="px-5 pt-6 pb-4 bg-[#1A1C1E]">
        <div className="flex items-center gap-3 mb-1">
          <Heart size={22} className="text-amber-400" fill="currentColor" />
          <h1
            className="text-white font-bold text-2xl"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            Saved Venues
          </h1>
        </div>
        <p className="text-[#BFC8CA] text-sm">
          {venues.length > 0
            ? `${venues.length} venue${venues.length > 1 ? "s" : ""} saved`
            : "Your shortlist is empty"}
        </p>
      </div>

      {/* Content */}
      <div className="bg-[#121416] min-h-screen">
        {venues.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <div className="w-20 h-20 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-5">
              <Heart size={36} className="text-amber-400/50" />
            </div>
            <h2 className="text-white font-bold text-xl mb-2">Nothing saved yet</h2>
            <p className="text-[#BFC8CA] text-sm max-w-xs mb-6">
              Tap the ♡ on any venue to save it here for quick access.
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-amber-400 text-black font-bold rounded-xl text-sm hover:bg-amber-500 transition-colors"
            >
              Explore Venues
            </Link>
          </div>
        ) : (
          <section className="px-4 pt-4 pb-6 space-y-4">
            {venues.map((venue) => (
              <div
                key={venue.id}
                className="bg-[#1c1f22] rounded-2xl overflow-hidden border border-[#242830] hover:border-[#353c45] transition-all"
              >
                {/* Image */}
                <Link href={`/venue/${venue.id}`}>
                  <div className="relative h-48 w-full bg-[#242830]">
                    {venue.heroImageUrl && (
                      <Image
                        src={venue.heroImageUrl}
                        alt={venue.name ?? "Venue"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {/* Curated badge */}
                    {venue.isCurated && (
                      <div className="absolute bottom-3 left-3 bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        CURATED
                      </div>
                    )}
                  </div>
                </Link>

                {/* Body */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/venue/${venue.id}`} className="flex-1">
                      <h2
                        className="text-white font-bold text-base leading-tight line-clamp-2"
                        style={{ fontFamily: "var(--font-noto-serif)" }}
                      >
                        {venue.name}
                      </h2>
                    </Link>
                    {/* Remove from wishlist */}
                    <WishlistButton venueId={venue.id ?? ""} initialWishlisted />
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-neutral-400 text-sm">
                      <MapPin size={12} className="shrink-0" />
                      <span className="line-clamp-1">{venue.city}</span>
                    </div>
                    <div className="flex items-center gap-1 text-neutral-400 text-sm">
                      <Users size={12} className="shrink-0" />
                      <span>{venue.seatingCapacity?.toLocaleString("en-IN")} seats</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-amber-400 font-bold">
                        {formatPrice(venue.pricePerEvening ?? 0)}
                      </span>
                      <span className="text-neutral-400 text-xs"> / evening</span>
                    </div>
                    <StarRating rating={Number(venue.avgRating ?? 0)} size={13} />
                  </div>

                  <Link
                    href={`/venue/${venue.id}`}
                    className="mt-3 w-full py-2.5 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold rounded-xl flex items-center justify-center hover:bg-amber-400/20 transition-colors uppercase tracking-wider"
                  >
                    View & Enquire →
                  </Link>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
