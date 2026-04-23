import { notFound } from "next/navigation";
import { getVenueById } from "@/db/queries/venues";
import { InquiryForm } from "@/components/venue/InquiryForm";
import Image from "next/image";
import { MapPin, Search } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InquiryPage({ params }: PageProps) {
  const { id } = await params;
  const venue = await getVenueById(id);
  if (!venue) notFound();

  return (
    <div className="min-h-screen bg-[#0d0d0d] pb-8">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <MapPin size={16} />
          <span>Venue Go</span>
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-[#2a2a2a]">
          <Search size={16} className="text-neutral-400" />
        </button>
      </header>

      {/* Venue hero */}
      <div className="mx-4 rounded-2xl overflow-hidden relative h-44 bg-[#1a1a1a] mb-6">
        {venue.heroImageUrl && (
          <Image
            src={venue.heroImageUrl}
            alt={venue.name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-1">
            SELECTED VENUE
          </p>
          <h1 className="text-white font-bold text-xl leading-tight">{venue.name}</h1>
          <p className="text-neutral-300 text-sm">
            {venue.address}, {venue.city}
          </p>
        </div>
      </div>

      {/* Inquiry form card */}
      <div className="mx-4">
        <InquiryForm
          venueId={id}
          venueName={venue.name}
          ownerWhatsapp={venue.owner?.whatsapp ?? ""}
          ownerName={venue.owner?.name ?? "the venue manager"}
        />
      </div>

      {/* Owner card */}
      {venue.owner && (
        <div className="mx-4 mt-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#2a2a2a] shrink-0">
            {venue.owner.avatarUrl ? (
              <Image src={venue.owner.avatarUrl} alt={venue.owner.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                {venue.owner.name[0]}
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-white font-bold">{venue.owner.name}</p>
            <p className="text-neutral-400 text-xs">
              Host since {venue.owner.hostSince} · Response: {venue.owner.responseTime ?? "within 1 hr"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-amber-400 text-sm">★</span>
            <span className="text-white text-sm font-bold">4.9</span>
          </div>
        </div>
      )}

      {/* Bottom nav spacer */}
      <div className="h-20" />
    </div>
  );
}
