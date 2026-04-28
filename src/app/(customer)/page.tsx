import { Metadata } from "next";
import { Search } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getVenues } from "@/db/queries/venues";
import { VenueCard } from "@/components/venue/VenueCard";
import { SearchBar } from "@/components/shared/SearchBar";
import { CategoryTabs } from "@/components/shared/CategoryTabs";
import { MapToggle } from "@/components/venue/MapToggle";
import { BrandLogo } from "@/components/shared/BrandLogo";

export const metadata: Metadata = {
  title: "Explore Venues — VenueGo",
  description:
    "Discover and book the finest auditoriums and event spaces across India.",
};

interface PageProps {
  searchParams: Promise<{
    city?: string;
    category?: string;
    search?: string;
    minCapacity?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Owners get their own dashboard — redirect immediately
  const session = await auth();
  if (session?.user?.role === "owner" || session?.user?.role === "admin") {
    redirect("/owner/dashboard");
  }

  let result: Awaited<ReturnType<typeof getVenues>> = {
    venues: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  };
  try {
    result = await getVenues({
      city: params.city,
      category: params.category,
      search: params.search,
      minCapacity: params.minCapacity ? Number(params.minCapacity) : undefined,
      limit: 20,
    });
  } catch (err) {
    console.error("[ExplorePage] DB error:", err);
  }

  const headliners = result.venues.filter((v) => v.isCurated).slice(0, 3);
  const allVenues = result.venues;
  const isDbEmpty = allVenues.length === 0;

  return (
    <div className="min-h-screen bg-[#1A1C1E]">
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

      {/* ── Top zone: Search + Category tabs (lighter bg) ── */}
      <div className="px-4 pt-8 pb-6 bg-[#1A1C1E]">
        <SearchBar />
        <CategoryTabs />
      </div>

      {/* ── Bottom zone: full-bleed dark section ── */}
      <div className="bg-[#121416]">

        {/* Headliners section */}
        {headliners.length > 0 && (
          <section className="px-4 pt-5 pb-4">
            <div className="flex items-end justify-between mb-4">
              <h2
                className="text-white font-bold text-2xl leading-tight"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                The
                <br />
                Headliners
              </h2>
              <span className="text-[#BFC8CA] text-sm text-right">
                {result.total} venues
                <br />
                available
              </span>
            </div>
            <div className="space-y-3">
              {headliners.map((venue, i) => (
                <VenueCard key={venue.id} venue={venue} priority={i === 0} />
              ))}
            </div>
          </section>
        )}

        {/* All venues */}
        {allVenues.length > 0 ? (
          <section className="px-4 pt-4 pb-6 space-y-3">
            {headliners.length === 0 && (
              <div className="flex items-end justify-between mb-3">
                <h2
                  className="text-white font-bold text-2xl"
                  style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                  All Venues
                </h2>
                <span className="text-[#BFC8CA] text-sm">
                  {result.total} available
                </span>
              </div>
            )}
            {allVenues.map((venue, i) => (
              <VenueCard key={venue.id} venue={venue} priority={i < 2} />
            ))}
          </section>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="text-5xl mb-4">🎭</div>
            {isDbEmpty ? (
              <>
                <h3 className="text-white font-bold text-lg mb-1">
                  Welcome to VenueGo
                </h3>
                <p className="text-[#BFC8CA] text-sm max-w-xs">
                  No venues yet. Connect your database and add seed data to get
                  started.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-white font-bold text-lg mb-1">
                  No venues found
                </h3>
                <p className="text-[#BFC8CA] text-sm">
                  Try adjusting your search filters
                </p>
              </>
            )}
          </div>
        )}

        <MapToggle />
      </div>
    </div>
  );
}
