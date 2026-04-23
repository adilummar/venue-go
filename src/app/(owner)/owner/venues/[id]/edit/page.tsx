import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getVenueById } from "@/db/queries/venues";
import { resolveSessionUser } from "@/db/queries/users";
import { VenueEditForm } from "@/components/owner/VenueEditForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const venue = await getVenueById(id);
  return { title: venue ? `Edit — ${venue.name}` : "Edit Venue" };
}

export default async function VenueEditPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { id } = await params;
  const venue = await getVenueById(id);
  if (!venue) notFound();

  // Only the owner or admin can edit
  if (venue.ownerId !== session.user.id && session.user.role !== "admin") redirect("/owner/dashboard");

  const owner = await resolveSessionUser(session.user);
  const amenityIds = (venue.amenities ?? []).map((a) => (a as { id: number }).id);

  return (
    <div className="min-h-screen bg-[#0d0d0d] pb-12">
      <header className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-[#1a1a1a]">
        <Link href="/owner/dashboard" className="text-neutral-400"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-white font-bold text-lg">Edit Venue</h1>
          <p className="text-[#BFC8CA] text-xs line-clamp-1">{venue.name}</p>
        </div>
      </header>

      <div className="px-4 pt-6">
        <VenueEditForm
          venue={{
            id: venue.id,
            name: venue.name,
            description: venue.description,
            address: venue.address,
            city: venue.city,
            state: venue.state,
            seatingCapacity: venue.seatingCapacity,
            pricePerEvening: venue.pricePerEvening,
            status: venue.status,
          }}
          ownerWhatsapp={owner?.whatsapp}
          selectedAmenityIds={amenityIds}
        />
      </div>
    </div>
  );
}
