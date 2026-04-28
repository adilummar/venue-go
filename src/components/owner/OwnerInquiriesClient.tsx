"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, Users, MessageCircle, ChevronDown, CheckCircle, Loader2 } from "lucide-react";
import { formatDate, buildWaLink, buildInquiryMessage } from "@/lib/utils";
import { cn } from "@/lib/utils";

type InquiryItem = {
  id: string;
  eventDate: string;
  guestCount: number;
  message: string | null;
  status: string;
  whatsappSent: boolean | null;
  createdAt: Date | null;
  venue: {
    id: string;
    name: string;
    address: string;
    city: string;
    pricePerEvening: string;
    heroImageUrl: string | null;
  } | null;
  customer: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    whatsapp: string | null;
    phone: string | null;
  } | null;
};

type Stats = {
  total: number;
  pendingWhatsApp: number;
  potentialRevenue: number;
};

interface Props {
  inquiries: InquiryItem[];
  stats: Stats;
}

export function OwnerInquiriesClient({ inquiries: initialInquiries, stats }: Props) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [successIds, setSuccessIds] = useState<Set<string>>(new Set());

  const newInquiries = inquiries.filter((i) => i.status === "new");
  const responded = inquiries.filter((i) => i.status !== "new");

  /** Mark inquiry as responded (WhatsApp chat was opened) */
  const handleMarkResponded = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "responded", whatsappSent: true }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, status: "responded", whatsappSent: true } : i
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  /** Create a confirmed booking from an inquiry */
  const handleConfirmBooking = async (id: string) => {
    setConfirmingId(id);
    try {
      const res = await fetch("/api/bookings/from-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId: id }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, status: "responded", whatsappSent: true } : i
          )
        );
        setSuccessIds((prev) => new Set([...prev, id]));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="space-y-3">
        <StatsCard value={String(stats.total)} label="Total Inquiries This Week" icon="💬" />
        <StatsCard
          value={String(stats.pendingWhatsApp)}
          label="Pending WhatsApp Response"
          icon="📋"
          highlight
        />
        <StatsCard
          value={`₹${(Number(stats.potentialRevenue) / 100000).toFixed(1)}L`}
          label="Potential Revenue Value"
          icon="💰"
          valueClassName="text-amber-400"
        />
      </div>

      {/* New inquiries */}
      {newInquiries.length > 0 && (
        <div className="space-y-4">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest">
            NEW — {newInquiries.length} AWAITING RESPONSE
          </p>
          {newInquiries.map((inq) => {
            const waMsg = buildInquiryMessage({
              venueName: inq.venue?.name ?? "",
              date: inq.eventDate ?? "TBD",
              guestCount: inq.guestCount ?? 0,
              message: inq.message ?? "",
            });
            const contactPhone = inq.customer?.phone ?? inq.customer?.whatsapp ?? "";
            const waLink = contactPhone ? buildWaLink(contactPhone, waMsg) : "#";
            const isBookingConfirmed = successIds.has(inq.id);

            return (
              <div key={inq.id} className="bg-[#1a1a1a] border border-amber-500/20 rounded-2xl p-4">
                {/* Customer info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#2a2a2a] shrink-0">
                    {inq.customer?.avatarUrl ? (
                      <Image
                        src={inq.customer.avatarUrl}
                        alt={inq.customer.name ?? ""}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                        {inq.customer?.name?.[0] ?? "?"}
                      </div>
                    )}
                    {/* Online dot */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-amber-400 rounded-full border-2 border-[#1a1a1a]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold">{inq.customer?.name}</p>
                    <p className="text-amber-400 text-xs">
                      Interested in:{" "}
                      <span className="text-teal-400 underline">{inq.venue?.name}</span>
                      {inq.venue?.city ? `, ${inq.venue.city}` : ""}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="flex gap-4 mb-3">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
                    <Calendar size={12} />
                    <span>{inq.eventDate ? formatDate(inq.eventDate) : "TBD"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
                    <Users size={12} />
                    <span>{inq.guestCount ?? "?"} GUESTS</span>
                  </div>
                </div>

                {inq.message && (
                  <p className="text-neutral-500 text-xs italic mb-3 line-clamp-2">
                    "{inq.message}"
                  </p>
                )}

                {/* Booking confirmed state */}
                {isBookingConfirmed ? (
                  <div className="flex items-center gap-2 py-3 text-emerald-400">
                    <CheckCircle size={18} />
                    <span className="text-sm font-bold">Booking Confirmed! Customer notified.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {/* Row 1: WhatsApp + Mark Responded */}
                    <div className="flex gap-2">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          // Auto-mark as responded after WhatsApp tap
                          setTimeout(() => handleMarkResponded(inq.id), 1000);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold text-white bg-[#25D366]/20 border border-[#25D366]/40 rounded-xl hover:bg-[#25D366]/30 uppercase tracking-wider transition-colors touch-manipulation"
                      >
                        <MessageCircle size={14} className="text-[#25D366]" />
                        CHAT ON WHATSAPP
                      </a>
                      <button
                        onClick={() => handleMarkResponded(inq.id)}
                        disabled={loadingId === inq.id}
                        className="flex-1 py-3 text-xs font-bold text-white border border-[#3a3a3a] rounded-xl hover:bg-[#2a2a2a] uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-1 touch-manipulation"
                      >
                        {loadingId === inq.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : null}
                        MARK RESPONDED
                      </button>
                    </div>

                    {/* Row 2: Confirm Booking (creates actual booking record) */}
                    <button
                      onClick={() => handleConfirmBooking(inq.id)}
                      disabled={confirmingId === inq.id}
                      className="w-full py-3.5 text-sm font-bold text-black bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 touch-manipulation"
                    >
                      {confirmingId === inq.id ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          CONFIRM BOOKING
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Responded inquiries */}
      {responded.length > 0 && (
        <div className="space-y-3">
          <p className="text-[#BFC8CA] text-xs font-bold uppercase tracking-widest">
            RESPONDED / ARCHIVED — {responded.length}
          </p>
          {responded.map((inq) => (
            <div key={inq.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#2a2a2a] shrink-0 opacity-70">
                  {inq.customer?.avatarUrl ? (
                    <Image
                      src={inq.customer.avatarUrl}
                      alt={inq.customer.name ?? ""}
                      fill
                      className="object-cover"
                    />
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
                  <p className="text-neutral-600 text-xs mt-0.5 uppercase tracking-wider">
                    {inq.status === "responded" ? "✓ RESPONDED" : "ARCHIVED"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 py-2 text-xs font-bold text-[#BFC8CA] border border-[#2a2a2a] rounded-xl uppercase tracking-wider cursor-default">
                  {inq.whatsappSent ? "MESSAGE SENT" : "NO WA SENT"}
                </button>
                <button
                  onClick={async () => {
                    await fetch(`/api/inquiries/${inq.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "archived" }),
                    });
                    setInquiries((prev) =>
                      prev.map((i) =>
                        i.id === inq.id ? { ...i, status: "archived" } : i
                      )
                    );
                  }}
                  className="flex-1 py-3 text-xs font-bold text-neutral-500 border border-[#2a2a2a] rounded-xl hover:bg-[#2a2a2a] uppercase tracking-wider transition-colors touch-manipulation"
                >
                  ARCHIVE
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
  );
}

function StatsCard({
  value,
  label,
  icon,
  highlight = false,
  valueClassName = "text-white",
}: {
  value: string;
  label: string;
  icon: string;
  highlight?: boolean;
  valueClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative bg-[#1a1a1a] border rounded-2xl p-4 flex items-center justify-between overflow-hidden",
        highlight ? "border-amber-500/30" : "border-[#2a2a2a]"
      )}
    >
      {highlight && (
        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-amber-400 rounded-r-full" />
      )}
      <div className="pl-2">
        <p className={cn("text-3xl font-bold", valueClassName)}>{value}</p>
        <p className="text-[#BFC8CA] text-sm mt-0.5">{label}</p>
      </div>
      <div className="w-14 h-14 rounded-xl bg-[#2a2a2a] flex items-center justify-center text-2xl opacity-50">
        {icon}
      </div>
    </div>
  );
}
