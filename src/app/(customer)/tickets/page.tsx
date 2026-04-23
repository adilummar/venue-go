import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBookingsByCustomer } from "@/db/queries/bookings";
import { BookingCard } from "@/components/shared/BookingCard";
import { Search, Bell } from "lucide-react";

export const metadata: Metadata = { title: "My Tickets" };

export default async function TicketsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { upcoming, past } = await getBookingsByCustomer(session.user.id);

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-amber-400">🎭</span>
          <span className="text-white font-bold">Venue Go</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-[#2a2a2a]">
            <Search size={16} className="text-neutral-400" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-[#2a2a2a]">
            <Bell size={16} className="text-neutral-400" />
          </button>
        </div>
      </header>

      <div className="px-4">
        <h1 className="text-white font-bold text-3xl mb-1">My Tickets</h1>
        <p className="text-[#BFC8CA] text-sm mb-6">Manage your upcoming events and past memories.</p>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section className="mb-8">
            <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">UPCOMING</p>
            <div className="space-y-4">
              {upcoming.map((b) => (
                <BookingCard key={b.id} booking={b} variant="upcoming" />
              ))}
            </div>
          </section>
        )}

        {/* History */}
        {past.length > 0 && (
          <section className="mb-8">
            <p className="text-[#BFC8CA] text-xs font-bold uppercase tracking-widest mb-4">HISTORY</p>
            <div className="space-y-3">
              {past.map((b) => (
                <BookingCard key={b.id} booking={b} variant="past" />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {upcoming.length === 0 && past.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="text-5xl mb-4">🎫</div>
            <h3 className="text-white font-bold text-lg mb-1">No bookings yet</h3>
            <p className="text-[#BFC8CA] text-sm">Start exploring venues to book your first event</p>
          </div>
        )}
      </div>
    </div>
  );
}
