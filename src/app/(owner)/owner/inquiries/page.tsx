import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getInquiriesByOwner, getOwnerInquiryStats } from "@/db/queries/inquiries";
import { OwnerInquiriesClient } from "@/components/owner/OwnerInquiriesClient";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Search } from "lucide-react";

export const metadata: Metadata = { title: "Inquiry Management — VenueGo" };

export default async function OwnerInquiriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if (session.user.role !== "owner" && session.user.role !== "admin") redirect("/");

  const [inquiries, stats] = await Promise.all([
    getInquiriesByOwner(session.user.id),
    getOwnerInquiryStats(session.user.id),
  ]);

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 pb-4 bg-[#121416]"
        style={{ paddingTop: "max(env(safe-area-inset-top), 48px)" }}
      >
        <BrandLogo />
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-[#2a2a2a]">
            <Search size={16} className="text-neutral-400" />
          </button>
        </div>
      </header>

      <div className="px-4 space-y-5 pb-8">
        <div>
          <h1
            className="text-white font-bold text-3xl leading-tight"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            Inquiry
            <br />
            Management
          </h1>
          <p className="text-[#BFC8CA] text-sm mt-1 uppercase tracking-wider">
            AWAITING RESPONSE ·{" "}
            {inquiries.filter((i) => i.status === "new").length} NEW INQUIRIES
          </p>
        </div>

        <OwnerInquiriesClient inquiries={inquiries} stats={stats} />
      </div>
    </div>
  );
}
