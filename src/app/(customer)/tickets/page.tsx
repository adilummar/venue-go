import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBookingsByCustomer } from "@/db/queries/bookings";
import { getInquiriesByCustomer } from "@/db/queries/inquiries";
import { Bell } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { TicketsTabs } from "@/components/shared/TicketsTabs";
import type { BookingWithVenue } from "@/types";

export const metadata: Metadata = { title: "My Bookings — VenueGo" };

export default async function TicketsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const [bookingResult, inquiries] = await Promise.all([
    getBookingsByCustomer(session.user.id),
    getInquiriesByCustomer(session.user.id),
  ]);

  // Cast to shared type — the query shape matches but Drizzle's inferred string
  // enum doesn't satisfy the literal union in BookingWithVenue.
  const upcoming = bookingResult.upcoming as BookingWithVenue[];
  const past = bookingResult.past as BookingWithVenue[];


  return (
    <div className="min-h-screen bg-[#121416]">
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 pb-3 bg-[#1A1C1E]"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 16px)",
          boxShadow: "0px 2px 4px -2px #0000001A, 0px 4px 6px -1px #0000001A",
        }}
      >
        <BrandLogo size="lg" />
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1c1f22] border border-[#242830]">
            <Bell size={18} className="text-neutral-400" />
          </button>
        </div>
      </header>

      {/* Title section */}
      <div className="px-5 pt-6 pb-2 bg-[#1A1C1E]">
        <h1
          className="text-white font-bold text-2xl"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          My Bookings
        </h1>
        <p className="text-[#BFC8CA] text-sm mt-0.5">
          Track your reservations and enquiries
        </p>
      </div>

      {/* Tabs */}
      <TicketsTabs
        upcoming={upcoming}
        past={past}
        inquiries={inquiries}
      />
    </div>
  );
}
