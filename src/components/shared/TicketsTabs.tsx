"use client";

import { useState } from "react";
import { BookingCard } from "@/components/shared/BookingCard";
import { cn } from "@/lib/utils";
import { Calendar, Users, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import type { BookingWithVenue } from "@/types";

type InquiryItem = {
  id: string;
  eventDate: string;
  guestCount: number;
  message: string | null;
  status: string;
  createdAt: Date | null;
  venue: {
    id: string;
    name: string;
    city: string;
    heroImageUrl: string | null;
  } | null;
};

interface TicketsTabsProps {
  upcoming: BookingWithVenue[];
  past: BookingWithVenue[];
  inquiries: InquiryItem[];
}


const STATUS_STYLES: Record<string, { label: string; dot: string; text: string; border: string; bg: string }> = {
  new: {
    label: "Pending",
    dot: "bg-amber-400",
    text: "text-amber-400",
    border: "border-amber-400/30",
    bg: "bg-amber-400/10",
  },
  responded: {
    label: "Responded",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    border: "border-emerald-400/30",
    bg: "bg-emerald-400/10",
  },
  archived: {
    label: "Archived",
    dot: "bg-neutral-500",
    text: "text-neutral-400",
    border: "border-neutral-500/30",
    bg: "bg-neutral-500/10",
  },
};

export function TicketsTabs({ upcoming, past, inquiries }: TicketsTabsProps) {
  const [activeTab, setActiveTab] = useState<"bookings" | "inquiries">("bookings");

  const pendingInquiries = inquiries.filter((i) => i.status === "new");

  return (
    <div className="bg-[#121416] min-h-screen">
      {/* Tab bar */}
      <div className="flex bg-[#1A1C1E] border-b border-[#242830] px-5">
        <button
          onClick={() => setActiveTab("bookings")}
          className={cn(
            "flex-1 py-3.5 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors",
            activeTab === "bookings"
              ? "text-amber-400 border-amber-400"
              : "text-[#BFC8CA] border-transparent"
          )}
        >
          Bookings
        </button>
        <button
          onClick={() => setActiveTab("inquiries")}
          className={cn(
            "flex-1 py-3.5 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors relative",
            activeTab === "inquiries"
              ? "text-amber-400 border-amber-400"
              : "text-[#BFC8CA] border-transparent"
          )}
        >
          Enquiries
          {pendingInquiries.length > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-amber-400 text-black text-[10px] font-bold rounded-full">
              {pendingInquiries.length}
            </span>
          )}
        </button>
      </div>

      {/* Bookings tab */}
      {activeTab === "bookings" && (
        <div className="px-4 py-4">
          {upcoming.length === 0 && past.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="text-5xl mb-4">🎫</div>
              <h3 className="text-white font-bold text-lg mb-1">No bookings yet</h3>
              <p className="text-[#BFC8CA] text-sm mb-6">
                Send an enquiry to start the booking process
              </p>
              <Link
                href="/"
                className="px-6 py-3 bg-amber-400 text-black font-bold rounded-xl text-sm hover:bg-amber-500 transition-colors"
              >
                Explore Venues
              </Link>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <section className="mb-8">
                  <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
                    UPCOMING
                  </p>
                  <div className="space-y-4">
                    {upcoming.map((b) => (
                      <BookingCard key={b.id} booking={b} variant="upcoming" />
                    ))}
                  </div>
                </section>
              )}
              {past.length > 0 && (
                <section className="mb-8">
                  <p className="text-[#BFC8CA] text-xs font-bold uppercase tracking-widest mb-4">
                    HISTORY
                  </p>
                  <div className="space-y-3">
                    {past.map((b) => (
                      <BookingCard key={b.id} booking={b} variant="past" />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}

      {/* Inquiries tab */}
      {activeTab === "inquiries" && (
        <div className="px-4 py-4">
          {inquiries.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="text-5xl mb-4">📬</div>
              <h3 className="text-white font-bold text-lg mb-1">No enquiries yet</h3>
              <p className="text-[#BFC8CA] text-sm mb-6">
                Find a venue and send an enquiry to get started
              </p>
              <Link
                href="/"
                className="px-6 py-3 bg-amber-400 text-black font-bold rounded-xl text-sm hover:bg-amber-500 transition-colors"
              >
                Explore Venues
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inq) => {
                const style = STATUS_STYLES[inq.status] ?? STATUS_STYLES.new;
                return (
                  <div
                    key={inq.id}
                    className="bg-[#1c1f22] border border-[#242830] rounded-2xl overflow-hidden"
                  >
                    {/* Status header */}
                    <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-[#242830]", style.bg)}>
                      <div className={cn("w-2 h-2 rounded-full", style.dot)} />
                      <span className={cn("text-xs font-bold uppercase tracking-widest", style.text)}>
                        {style.label}
                      </span>
                    </div>

                    {/* Card body */}
                    <div className="p-4">
                      <p
                        className="text-white font-bold text-base mb-0.5"
                        style={{ fontFamily: "var(--font-noto-serif)" }}
                      >
                        {inq.venue?.name ?? "Unknown Venue"}
                      </p>
                      <div className="flex items-center gap-1 text-neutral-400 text-xs mb-3">
                        <MapPin size={11} />
                        <span>{inq.venue?.city ?? "—"}</span>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
                          <Calendar size={12} />
                          <span>{new Date(inq.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
                          <Users size={12} />
                          <span>{inq.guestCount} guests</span>
                        </div>
                      </div>

                      {inq.message && (
                        <p className="text-neutral-500 text-xs mt-2 italic line-clamp-2">
                          "{inq.message}"
                        </p>
                      )}

                      {/* CTA */}
                      <div className="mt-3 flex gap-2">
                        {inq.venue?.id && (
                          <Link
                            href={`/venue/${inq.venue.id}`}
                            className="flex-1 py-2 text-center text-xs font-bold text-white border border-[#353c45] rounded-xl hover:bg-[#262b30] transition-colors uppercase tracking-wider"
                          >
                            View Venue
                          </Link>
                        )}
                        {inq.status === "new" && (
                          <div className="flex items-center gap-1.5 text-amber-400/70 text-xs">
                            <Clock size={11} />
                            <span>Awaiting owner response</span>
                          </div>
                        )}
                        {inq.status === "responded" && (
                          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                            <span>✓</span>
                            <span>Owner has responded — check your bookings!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
