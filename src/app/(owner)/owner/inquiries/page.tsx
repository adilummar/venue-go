import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getInquiriesByOwner, getOwnerInquiryStats } from "@/db/queries/inquiries";
import Image from "next/image";
import { Calendar, Users, MessageCircle, Search, ChevronDown } from "lucide-react";
import { formatDate, buildWaLink, buildInquiryMessage } from "@/lib/utils";

export const metadata: Metadata = { title: "Inquiry Management" };

export default async function OwnerInquiriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if (session.user.role !== "owner" && session.user.role !== "admin") redirect("/");

  const [inquiries, stats] = await Promise.all([
    getInquiriesByOwner(session.user.id),
    getOwnerInquiryStats(session.user.id),
  ]);

  // Schema uses "new" for pending inquiries
  const newInquiries = inquiries.filter((i) => i.status === "new");
  const responded = inquiries.filter((i) => i.status === "responded");

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-amber-400">📍</span>
          <span className="text-white font-bold">Venue Go</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-[#2a2a2a]">
            <Search size={16} className="text-neutral-400" />
          </button>
          <div className="w-9 h-9 rounded-full overflow-hidden bg-amber-400 flex items-center justify-center text-black font-bold text-sm">
            {session.user.name?.[0] ?? "O"}
          </div>
        </div>
      </header>

      <div className="px-4 space-y-5">
        <div>
          <h1 className="text-white font-bold text-3xl leading-tight">
            Inquiry<br />Management
          </h1>
          <p className="text-[#BFC8CA] text-sm mt-1 uppercase tracking-wider">
            AWAITING RESPONSE · {newInquiries.length} NEW INQUIRIES
          </p>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <StatsCard value={String(stats.total)} label="Total Inquiries This Week" icon="💬" />
          <StatsCard value={String(stats.pendingWhatsApp)} label="Pending WhatsApp Response" icon="📋" highlight />
          <StatsCard
            value={`₹${(Number(stats.potentialRevenue) / 100000).toFixed(1)}L`}
            label="Potential Revenue Value"
            icon="💰"
            valueClassName="text-amber-400"
          />
        </div>

        {/* New/pending inquiries */}
        {newInquiries.length > 0 && (
          <div className="space-y-4">
            {newInquiries.map((inq) => {
              const waMsg = buildInquiryMessage({
                venueName: inq.venue?.name ?? "",
                date: inq.eventDate ?? "TBD",
                guestCount: inq.guestCount ?? 0,
                message: inq.message ?? "",
              });
              const waLink = inq.customer?.phone
                ? buildWaLink(inq.customer.phone, waMsg)
                : inq.customer?.whatsapp
                ? buildWaLink(inq.customer.whatsapp, waMsg)
                : "#";

              return (
                <div key={inq.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#2a2a2a] shrink-0">
                      {inq.customer?.avatarUrl ? (
                        <Image src={inq.customer.avatarUrl} alt={inq.customer.name ?? ""} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">
                          {inq.customer?.name?.[0] ?? "?"}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-amber-400 rounded-full border-2 border-[#1a1a1a]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold">{inq.customer?.name}</p>
                      <p className="text-amber-400 text-xs">
                        Interested in:{" "}
                        <span className="text-teal-400 underline">
                          {inq.venue?.name}
                          {inq.venue?.city ? `, ${inq.venue.city}` : ""}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
                      <Calendar size={12} />
                      <span>{inq.eventDate ? formatDate(inq.eventDate) : "TBD"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
                      <Users size={12} />
                      <span>{inq.guestCount ?? "?"} GUESTS</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 py-2.5 text-xs font-bold text-white border border-[#3a3a3a] rounded-xl hover:bg-[#2a2a2a] uppercase tracking-wider transition-colors">
                      VIEW DETAILS
                    </button>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-[#25D366]/20 border border-[#25D366]/40 rounded-xl hover:bg-[#25D366]/30 uppercase tracking-wider transition-colors"
                    >
                      <MessageCircle size={14} className="text-[#25D366]" />
                      CHAT ON WHATSAPP
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Responded inquiries (muted) */}
        {responded.length > 0 && (
          <div className="space-y-3">
            {responded.map((inq) => (
              <div key={inq.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#2a2a2a] shrink-0 opacity-70">
                    {inq.customer?.avatarUrl ? (
                      <Image src={inq.customer.avatarUrl} alt={inq.customer.name ?? ""} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {inq.customer?.name?.[0] ?? "?"}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#1a1a1a]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-neutral-400 font-bold">{inq.customer?.name}</p>
                    <p className="text-[#BFC8CA] text-xs">
                      Interested in: {inq.venue?.name}
                    </p>
                    <p className="text-neutral-600 text-xs mt-0.5">RESPONDED</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 py-2 text-xs font-bold text-[#BFC8CA] border border-[#2a2a2a] rounded-xl uppercase tracking-wider">
                    ARCHIVED
                  </button>
                  <button className="flex-1 py-2 text-xs font-bold text-neutral-400 border border-[#2a2a2a] rounded-xl uppercase tracking-wider">
                    MESSAGE SENT
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {inquiries.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="text-5xl mb-4">📬</div>
            <h3 className="text-white font-bold text-lg mb-1">No inquiries yet</h3>
            <p className="text-[#BFC8CA] text-sm">Inquiries from customers will appear here</p>
          </div>
        )}

        {/* Load more */}
        <div className="flex flex-col items-center py-4 gap-1">
          <div className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
            <ChevronDown size={18} className="text-neutral-400" />
          </div>
          <span className="text-[#BFC8CA] text-xs uppercase tracking-widest">VIEW PAST INQUIRIES</span>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  value, label, icon, highlight = false, valueClassName = "text-white",
}: {
  value: string; label: string; icon: string;
  highlight?: boolean; valueClassName?: string;
}) {
  return (
    <div className={`relative bg-[#1a1a1a] border rounded-2xl p-4 flex items-center justify-between overflow-hidden ${highlight ? "border-amber-500/30" : "border-[#2a2a2a]"}`}>
      {highlight && (
        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-amber-400 rounded-r-full" />
      )}
      <div className="pl-2">
        <p className={`text-3xl font-bold ${valueClassName}`}>{value}</p>
        <p className="text-[#BFC8CA] text-sm mt-0.5">{label}</p>
      </div>
      <div className="w-14 h-14 rounded-xl bg-[#2a2a2a] flex items-center justify-center text-2xl opacity-50">
        {icon}
      </div>
    </div>
  );
}
