import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getVenuesByOwner } from "@/db/queries/venues";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { OwnerBottomNav } from "@/components/shared/OwnerBottomNav";

export const metadata: Metadata = { title: "My Venues" };

export default async function OwnerVenuesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if (session.user.role !== "owner" && session.user.role !== "admin") redirect("/");

  const venues = await getVenuesByOwner(session.user.id);

  return (
    <div className="min-h-screen bg-[#0d0d0d] pb-24">
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-amber-400">🎭</span>
          <span className="text-white font-bold">Venue Go</span>
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-[#2a2a2a]">
          <Search size={16} className="text-neutral-400" />
        </button>
      </header>

      <div className="px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white font-bold text-3xl">My Venues</h1>
          <Link
            href="/owner/list"
            className="flex items-center gap-1 bg-amber-400 text-black font-bold text-xs px-3 py-2 rounded-xl"
          >
            <Plus size={14} /> New
          </Link>
        </div>

        {venues.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="text-5xl mb-4">🏛️</div>
            <h3 className="text-white font-bold text-lg mb-1">No venues yet</h3>
            <p className="text-[#BFC8CA] text-sm mb-6">Start by listing your first auditorium</p>
            <Link
              href="/owner/list"
              className="px-6 py-3 bg-amber-400 text-black font-bold rounded-xl text-sm"
            >
              List a Venue
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {venues.map((venue) => (
              <div key={venue.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
                <div className="relative h-40 bg-[#2a2a2a]">
                  {venue.heroImageUrl ? (
                    venue.heroImageUrl.startsWith("/uploads") ? (
                      <img
                        src={venue.heroImageUrl}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image src={venue.heroImageUrl} alt={venue.name} fill className="object-cover" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">🏛️</div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant={venue.status === "live" ? "live" : venue.status === "pending_review" ? "review" : "default"}>
                      {venue.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-base mb-1">{venue.name}</h3>
                  <p className="text-neutral-400 text-xs mb-3">
                    {venue.city} · {venue.seatingCapacity.toLocaleString()} seats
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={`/owner/venues/${venue.id}/edit`}
                      className="flex-1 py-2 text-center text-xs font-bold text-white border border-[#3a3a3a] rounded-lg hover:bg-[#2a2a2a] transition-colors"
                    >
                      EDIT
                    </Link>
                    <Link
                      href={`/venue/${venue.id}`}
                      className="flex-1 py-2 text-center text-xs font-bold text-amber-400 border border-amber-400/30 rounded-lg hover:bg-amber-400/10 transition-colors"
                    >
                      VIEW
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <OwnerBottomNav />

      {/* FAB */}
      <Link
        href="/owner/list"
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-900/30 hover:bg-amber-500 transition-colors"
      >
        <Plus size={24} className="text-black" />
      </Link>
    </div>
  );
}
