import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NotificationToggle } from "@/components/shared/PushNotification";

export const metadata: Metadata = { title: "Notification Settings" };

export default function NotificationSettingsPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <Link href="/profile" className="text-neutral-400"><ArrowLeft size={20} /></Link>
        <h1 className="text-white font-bold text-lg">Notification Settings</h1>
      </header>

      <div className="px-4 space-y-4">
        {/* Push notifications */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">Push Notifications</p>
              <p className="text-[#BFC8CA] text-xs mt-0.5">
                Get notified about inquiries and bookings
              </p>
            </div>
            <NotificationToggle />
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
          {[
            { label: "New Inquiry", sub: "When someone inquires about your venue", on: true },
            { label: "Booking Confirmed", sub: "When your booking request is approved", on: true },
            { label: "WhatsApp Responses", sub: "Reminders for pending WhatsApp messages", on: false },
            { label: "Promotional", sub: "Offers, curated picks and venue news", on: false },
          ].map((item, i) => (
            <div key={i} className={`flex items-center justify-between px-4 py-4 ${i > 0 ? "border-t border-[#2a2a2a]" : ""}`}>
              <div>
                <p className="text-white text-sm font-medium">{item.label}</p>
                <p className="text-[#BFC8CA] text-xs mt-0.5">{item.sub}</p>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors relative ${item.on ? "bg-amber-400" : "bg-[#2a2a2a]"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${item.on ? "left-6" : "left-1"}`} />
              </div>
            </div>
          ))}
        </div>

        <p className="text-neutral-600 text-xs text-center px-4">
          Push notifications require browser permission. You can update this in your browser settings.
        </p>
      </div>
    </div>
  );
}
