import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getVenueById, getOwnerStats } from "@/db/queries/venues";
import { getReviewsByVenue, getVenueRatingStats } from "@/db/queries/reviews";
import { getInquiriesByOwner } from "@/db/queries/inquiries";
import Link from "next/link";
import { ArrowLeft, Star, MessageSquare, TrendingUp, Users } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface PageProps { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const venue = await getVenueById(id);
  return { title: venue ? `Performance — ${venue.name}` : "Performance" };
}

export default async function VenuePerformancePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { id } = await params;
  const venue = await getVenueById(id);
  if (!venue) notFound();
  if (venue.ownerId !== session.user.id && session.user.role !== "admin") redirect("/owner/dashboard");

  const [ratingStats, reviewsData, inquiriesData, ownerStats] = await Promise.all([
    getVenueRatingStats(id),
    getReviewsByVenue(id, 1, 5),
    getInquiriesByOwner(session.user.id),
    getOwnerStats(session.user.id),
  ]);

  const venueInquiries = inquiriesData.filter((i) => i.venue?.id === id);
  const avgRating = Number(ratingStats?.avgOverall ?? 0).toFixed(1);

  const categoryRatings = [
    { label: "Acoustics", value: Number(ratingStats?.avgAcoustics ?? 0) },
    { label: "Communication", value: Number(ratingStats?.avgCommunication ?? 0) },
    { label: "Cleanliness", value: Number(ratingStats?.avgCleanliness ?? 0) },
    { label: "Location", value: Number(ratingStats?.avgLocation ?? 0) },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] pb-12">
      <header className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-[#1a1a1a]">
        <Link href="/owner/dashboard" className="text-neutral-400"><ArrowLeft size={20} /></Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-bold text-lg">Performance</h1>
          <p className="text-[#BFC8CA] text-xs line-clamp-1">{venue.name}</p>
        </div>
        <Link href={`/owner/venues/${id}/edit`}
          className="text-xs text-amber-400 border border-amber-400/30 rounded-lg px-3 py-1.5 font-bold">
          EDIT
        </Link>
      </header>

      <div className="px-4 pt-5 space-y-5">

        {/* Rating Overview */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest mb-1">OVERALL RATING</p>
              <div className="flex items-end gap-2">
                <span className="text-white font-bold text-5xl">{avgRating}</span>
                <div className="pb-1">
                  <div className="flex gap-0.5 mb-0.5">
                    {[1,2,3,4,5].map((n) => (
                      <Star key={n} size={14} fill={Number(avgRating) >= n ? "#f59e0b" : "none"} className={Number(avgRating) >= n ? "text-amber-400" : "text-neutral-600"} />
                    ))}
                  </div>
                  <p className="text-[#BFC8CA] text-xs">{ratingStats?.reviewCount ?? 0} reviews</p>
                </div>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
              <Star size={24} className="text-amber-400" />
            </div>
          </div>

          {/* Category bars */}
          <div className="space-y-3">
            {categoryRatings.map(({ label, value }) => (
              <div key={label}>
                <div className="flex justify-between mb-1">
                  <span className="text-neutral-400 text-xs">{label}</span>
                  <span className="text-white text-xs font-semibold">{value.toFixed(1)}</span>
                </div>
                <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${(value / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inquiry stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<MessageSquare size={20} className="text-teal-400" />}
            label="Total Inquiries" value={String(venueInquiries.length)} />
          <StatCard icon={<TrendingUp size={20} className="text-amber-400" />}
            label="Active Listings" value={String(ownerStats.activeListings)} color="text-amber-400" />
          <StatCard icon={<Users size={20} className="text-purple-400" />}
            label="Pending Responses" value={String(venueInquiries.filter(i => i.status === "new").length)} />
          <StatCard icon={<Star size={20} className="text-amber-400" />}
            label="Reviews" value={String(ratingStats?.reviewCount ?? 0)} color="text-amber-400" />
        </div>

        {/* Estimated Revenue hint */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
          <p className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest mb-1">LISTING PRICE</p>
          <p className="text-amber-400 font-bold text-2xl">{formatPrice(venue.pricePerEvening)}</p>
          <p className="text-[#BFC8CA] text-xs mt-0.5">per evening</p>
        </div>

        {/* Recent reviews */}
        {reviewsData.reviews.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold text-base">Recent Reviews</h2>
              <Link href={`/venue/${id}`} className="text-amber-400 text-xs font-bold">VIEW ALL</Link>
            </div>
            <div className="space-y-3">
              {reviewsData.reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-amber-400/20 flex items-center justify-center">
                      <span className="text-amber-400 text-xs font-bold">
                        {review.customer?.name?.[0] ?? "?"}
                      </span>
                    </div>
                    <span className="text-white text-sm font-semibold">{review.customer?.name}</span>
                    <div className="ml-auto flex gap-0.5">
                      {[1,2,3,4,5].map((n) => (
                        <Star key={n} size={11} fill={Number(review.ratingOverall) >= n ? "#f59e0b" : "none"} className={Number(review.ratingOverall) >= n ? "text-amber-400" : "text-neutral-700"} />
                      ))}
                    </div>
                  </div>
                  {review.body && (
                    <p className="text-neutral-400 text-xs leading-relaxed line-clamp-2">{review.body}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color = "text-white" }: {
  icon: React.ReactNode; label: string; value: string; color?: string;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
      <div className="mb-2">{icon}</div>
      <p className={`font-bold text-2xl ${color}`}>{value}</p>
      <p className="text-[#BFC8CA] text-[10px] uppercase tracking-widest mt-0.5">{label}</p>
    </div>
  );
}
