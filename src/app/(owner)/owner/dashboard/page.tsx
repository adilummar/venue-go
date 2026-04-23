import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOwnerVenues, getOwnerStats } from "@/db/queries/venues";
import { getInquiriesByOwner } from "@/db/queries/inquiries";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/shared/Badge";
import { BrandLogo } from "@/components/shared/BrandLogo";

export const metadata: Metadata = { title: "Owner Dashboard" };

export default async function OwnerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if (session.user.role !== "owner" && session.user.role !== "admin") redirect("/");

  const [venues, stats, inquiries] = await Promise.all([
    getOwnerVenues(session.user.id),
    getOwnerStats(session.user.id),
    getInquiriesByOwner(session.user.id),
  ]);

  const recentInquiries = inquiries.slice(0, 3);
  const draftCount = venues.filter((v) => v.status === "draft").length;
  const archivedCount = venues.filter((v) => v.status === "archived").length;
  const pendingCount = venues.filter((v) => v.status === "pending_review").length;

  return (
    <div className="min-h-screen bg-[#121416]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <BrandLogo />
        <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-black font-bold text-sm">
          {session.user.name?.[0] ?? "O"}
        </div>
      </header>

      <div className="px-4 space-y-6">
        <h1 className="text-white font-bold text-3xl" style={{fontFamily:'var(--font-noto-serif)'}}>Owner Dashboard</h1>

        {/* Stats cards */}
        <div className="space-y-3">
          <StatCard label="ACTIVE LISTINGS" value={String(stats.activeListings)} />
          <StatCard label="INQUIRIES TODAY" value={String(stats.inquiriesToday)} />
          <StatCard
            label="MONTHLY REVENUE"
            value={formatPrice(String(stats.monthlyRevenue))}
            valueClassName="text-amber-400"
          />
        </div>

        {/* Active Auditoriums */}
        {venues.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-amber-400 rounded-full" />
                <h2 className="text-white font-bold text-xl" style={{fontFamily:'var(--font-noto-serif)'}}>Active Auditoriums</h2>
              </div>
              <Link href="/owner/venues" className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                VIEW ALL
              </Link>
            </div>

            <div className="space-y-4">
              {venues.slice(0, 3).map((venue) => (
                <div key={venue.id} className="bg-[#1c1f22] border border-[#242830] rounded-2xl overflow-hidden">
                  <div className="relative h-36">
                    {venue.heroImageUrl && (
                      <Image src={venue.heroImageUrl} alt={venue.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold" style={{fontFamily:'var(--font-noto-serif)'}}>{venue.name}</h3>
                      <Badge variant={venue.status === "live" ? "live" : "review"}>
                        {venue.status === "live" ? "LIVE" : "UNDER REVIEW"}
                      </Badge>
                    </div>
                    <p className="text-neutral-400 text-xs mb-3">
                      {venue.address} · {venue.seatingCapacity.toLocaleString()} Seats ·{" "}
                      {venue.status === "live" ? "High Demand" : "Experimental Layout"}
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href={`/owner/venues/${venue.id}/edit`}
                        className="px-4 py-2 text-xs font-bold text-white border border-[#353c45] rounded-lg hover:bg-[#262b30] transition-colors"
                      >
                        EDIT LISTING
                      </Link>
                      <Link
                        href={`/owner/venues/${venue.id}/performance`}
                        className="px-4 py-2 text-xs font-bold text-white border border-[#353c45] rounded-lg hover:bg-[#262b30] transition-colors"
                      >
                        PERFORMANCE
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Inquiries */}
        {recentInquiries.length > 0 && (
          <section>
            <h2 className="text-white font-bold text-xl mb-3" style={{fontFamily:'var(--font-noto-serif)'}}>Recent Inquiries</h2>
            <div className="space-y-1">
              {recentInquiries.map((inq) => (
                <div key={inq.id} className="flex items-center gap-3 bg-[#1c1f22] border border-[#242830] rounded-xl p-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0">
                    <span className="text-amber-400 font-bold text-sm">
                      {inq.customer?.name?.[0] ?? "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">{inq.customer?.name}</p>
                    <p className="text-[#BFC8CA] text-xs uppercase tracking-wider line-clamp-1">
                      {inq.message?.slice(0, 40)}
                    </p>
                  </div>
                  <button className="text-neutral-600 hover:text-neutral-400 p-1">⋮</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Manage Listings */}
        <section className="bg-[#1c1f22] border border-[#242830] rounded-2xl p-4">
          <h2 className="text-white font-bold text-base mb-3">Manage Listings</h2>
          <ManageRow label="Drafts" count={draftCount} />
          <ManageRow label="Archived" count={archivedCount} />
          <ManageRow label="Pending Review" count={pendingCount} />
          <p className="text-[#BFC8CA] text-xs mt-4 leading-relaxed">
            Optimization Tip: Add high-resolution stage photos to increase booking interest by up to 40%.
          </p>
        </section>

        {/* New Auditorium CTA */}
        <div className="flex flex-col items-center py-4">
          <Link
            href="/owner/list"
            className="w-14 h-14 rounded-2xl bg-[#1c1f22] border border-[#242830] flex items-center justify-center mb-2 hover:bg-[#262b30] transition-colors"
          >
            <Plus size={24} className="text-white" />
          </Link>
          <p className="text-white font-bold">New Auditorium</p>
          <p className="text-[#BFC8CA] text-xs">Launch a new stage listing</p>
        </div>
      </div>

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

function StatCard({
  label,
  value,
  valueClassName = "text-white",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="bg-[#1c1f22] border border-[#242830] rounded-2xl p-4">
      <p className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-bold ${valueClassName}`}>{value}</p>
    </div>
  );
}

function ManageRow({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#242830] last:border-0">
      <span className="text-neutral-400 text-sm">{label}</span>
      <span className="text-white font-bold text-sm">{count}</span>
    </div>
  );
}
