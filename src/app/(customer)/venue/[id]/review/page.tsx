import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getVenueById } from "@/db/queries/venues";
import { ReviewForm } from "@/components/venue/ReviewForm";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const venue = await getVenueById(id);
  return { title: venue ? `Review ${venue.name}` : "Write a Review" };
}

export default async function WriteReviewPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { id } = await params;
  const venue = await getVenueById(id);
  if (!venue) notFound();

  return (
    <div className="min-h-screen bg-[#0d0d0d] pb-12">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <Link href={`/venue/${id}`} className="text-neutral-400">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-white font-bold text-lg">Write a Review</h1>
          <p className="text-[#BFC8CA] text-xs">Share your experience</p>
        </div>
      </header>

      {/* Venue mini card */}
      <div className="mx-4 mb-6 flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-3">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#2a2a2a] shrink-0">
          {venue.heroImageUrl && (
            <Image src={venue.heroImageUrl} alt={venue.name} fill className="object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm line-clamp-1">{venue.name}</p>
          <div className="flex items-center gap-1 mt-0.5 text-neutral-400 text-xs">
            <MapPin size={10} />
            <span>{venue.city}</span>
          </div>
        </div>
      </div>

      {/* Review form */}
      <div className="px-4">
        <ReviewForm venueId={id} venueName={venue.name} />
      </div>
    </div>
  );
}
