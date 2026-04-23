import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVenueById } from "@/db/queries/venues";
import { getReviewsByVenue } from "@/db/queries/reviews";
import { PhotoGallery } from "@/components/venue/PhotoGallery";
import { HostCard } from "@/components/venue/HostCard";
import { AboutSection } from "@/components/venue/AboutSection";
import { AmenitiesGrid } from "@/components/venue/AmenitiesGrid";
import { CategoryRatings } from "@/components/venue/CategoryRatings";
import { ReviewList } from "@/components/venue/ReviewList";
import { StickyBottomBar } from "@/components/venue/StickyBottomBar";
import { MapPin, Search } from "lucide-react";
import { ShareButton } from "@/components/venue/ShareButton";
import { BrandLogo } from "@/components/shared/BrandLogo";
import Link from "next/link";
import { StarRating } from "@/components/shared/StarRating";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const venue = await getVenueById(id);
  if (!venue) return { title: "Venue Not Found" };
  return {
    title: venue.name,
    description: venue.description ?? `Book ${venue.name} in ${venue.city}`,
    openGraph: {
      images: venue.heroImageUrl ? [venue.heroImageUrl] : [],
    },
  };
}

export default async function VenueDetailPage({ params }: PageProps) {
  const { id } = await params;
  const venue = await getVenueById(id);
  if (!venue) notFound();

  const reviewsData = await getReviewsByVenue(id, 1, 5);

  const allImages = venue.images?.length
    ? venue.images.map((img) => img.url)
    : venue.heroImageUrl
    ? [venue.heroImageUrl]
    : ["/placeholder-venue.jpg"];

  return (
    <div className="min-h-screen bg-[#0d0d0d] pb-24">
      {/* Photo gallery — header overlays this */}
      <div className="relative">
        <PhotoGallery images={allImages} />
        {/* Top bar — absolute so it overlays the hero image only, not content below */}
        <header
          className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 pb-3 bg-gradient-to-b from-black/80 to-transparent"
          style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
        >
          <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
            <span className="text-white text-lg">←</span>
          </Link>
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" />
          </div>
          <div className="flex gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
              <Search size={16} className="text-white" />
            </button>
            <ShareButton
              title={venue.name}
              text={`Check out ${venue.name} on Venue Go!`}
              url={`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/venue/${id}`}
            />
          </div>
        </header>
      </div>

      {/* Content */}
      <div className="px-4 space-y-6 pt-5">
        {/* Venue name + rating */}
        <div>
          <h1 className="text-white font-bold text-2xl leading-tight" style={{fontFamily: 'var(--font-noto-serif)'}}>{venue.name}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <StarRating rating={Number(venue.ratingStats?.avgOverall ?? 0)} />
            <span className="text-neutral-400 text-sm">
              · {venue.ratingStats?.reviewCount ?? 0} reviews
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-neutral-400 text-sm">
            <MapPin size={13} />
            <span>{venue.address}, {venue.city}</span>
          </div>
        </div>

        {/* Host card */}
        {venue.owner && <HostCard owner={venue.owner} venueId={id} />}

        {/* About */}
        {venue.description && <AboutSection description={venue.description} />}

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <AmenitiesGrid amenities={venue.amenities as { id: number; name: string; icon: string | null }[]} />
        )}

        {/* Category ratings */}
        {venue.ratingStats && (
          <CategoryRatings stats={venue.ratingStats} />
        )}

        {/* Reviews */}
        <ReviewList reviews={reviewsData.reviews} total={reviewsData.total} venueId={id} />
      </div>

      {/* Sticky bottom bar */}
      <StickyBottomBar
        price={venue.pricePerEvening}
        venueId={id}
        ownerWhatsapp={venue.owner?.whatsapp ?? ""}
        venueName={venue.name}
      />
    </div>
  );
}
