import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NotificationToggle } from "@/components/shared/PushNotification";
import NotificationList from "./NotificationList";

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

        <NotificationList />

        <p className="text-neutral-600 text-xs text-center px-4">
          Push notifications require browser permission. You can update this in your browser settings.
        </p>
      </div>
    </div>
  );
}
