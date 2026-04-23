import { Metadata } from "next";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { resolveSessionUser } from "@/db/queries/users";
import Image from "next/image";
import Link from "next/link";
import {
  User, Bell, MessageSquare, HelpCircle, LogOut,
  ChevronRight, ExternalLink, Search
} from "lucide-react";
import { APP_NAME, APP_VERSION } from "@/lib/constants";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const user = await resolveSessionUser(session.user);
  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <MapPinIcon />
          <span className="text-white font-bold">Venue Go</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-[#2a2a2a]">
            <Search size={16} className="text-neutral-400" />
          </button>
          <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-black font-bold text-sm">
            {user.name[0]}
          </div>
        </div>
      </header>

      <div className="px-4">
        {/* Avatar */}
        <div className="flex flex-col items-center pt-4 pb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-amber-400">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={user.name} width={96} height={96} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-black">
                  {user.name[0]}
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-neutral-700 border-2 border-[#0d0d0d] flex items-center justify-center">
              <span className="text-white text-xs">✏️</span>
            </button>
          </div>
          <h1 className="text-white font-bold text-2xl mt-4">{user.name}</h1>
          <p className="text-neutral-400 text-sm">{user.email}</p>

          {/* Patron badge */}
          {user.membership === "patron_circle" && (
            <div className="mt-3 flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2">
              <span className="text-amber-400 text-sm">⭐</span>
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
                PATRON CIRCLE MEMBER
              </span>
            </div>
          )}
        </div>

        {/* Owner quick-access banner */}
        {(user.role === "owner" || user.role === "admin") && (
          <div className="mb-5">
            <Link
              href="/owner/dashboard"
              className="flex items-center gap-3 bg-amber-400/10 border border-amber-400/30 rounded-2xl px-4 py-4 hover:bg-amber-400/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0">
                <span className="text-xl">🎭</span>
              </div>
              <div className="flex-1">
                <p className="text-amber-400 font-bold text-sm">Owner Dashboard</p>
                <p className="text-amber-400/60 text-xs">Manage venues, inquiries & analytics</p>
              </div>
              <ChevronRight size={16} className="text-amber-400" />
            </Link>
          </div>
        )}

        {/* Account Preferences */}
        <div className="mb-6">
          <p className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest mb-3">
            ACCOUNT PREFERENCES
          </p>
          <div className="space-y-1 bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#2a2a2a]">
            <SettingsRow
              icon={<User size={18} className="text-teal-400" />}
              label="Personal Information"
              sub="Manage your private details"
              href="/profile/personal"
            />
            <div className="h-px bg-[#2a2a2a]" />
            <SettingsRow
              icon={<Bell size={18} className="text-teal-400" />}
              label="Notification Settings"
              sub="Alerts, updates, and reminders"
              href="/profile/notifications"
            />
            <div className="h-px bg-[#2a2a2a]" />
            <SettingsRow
              icon={<MessageSquare size={18} className="text-amber-400" />}
              label="WhatsApp Business Link"
              labelClassName="text-amber-400"
              sub="Connect with your audience directly"
              subClassName="text-amber-400/60"
              href="/profile/whatsapp"
              icon2={<ExternalLink size={16} className="text-amber-400" />}
            />
          </div>
        </div>

        {/* Support */}
        <div className="mb-6">
          <p className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest mb-3">
            SUPPORT & SAFETY
          </p>
          <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#2a2a2a]">
            <SettingsRow
              icon={<HelpCircle size={18} className="text-teal-400" />}
              label="Help & Support"
              sub="FAQs and live assistance"
              href="/support"
            />
          </div>
        </div>

        {/* Logout */}
        <div className="mb-6">
          <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#2a2a2a]">
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-red-950/20 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                  <LogOut size={18} className="text-red-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-red-500 font-semibold text-sm">Logout</p>
                  <p className="text-[#BFC8CA] text-xs">Securely sign out of your session</p>
                </div>
              </button>
            </form>
          </div>
        </div>

        {/* Version footer */}
        <div className="text-center pb-4">
          <p className="text-neutral-700 font-bold text-lg">{APP_NAME}</p>
          <p className="text-neutral-700 text-xs mt-0.5">
            VERSION {APP_VERSION} · PROSCENIUM PRIME
          </p>
        </div>
      </div>
    </div>
  );
}

function MapPinIcon() {
  return <span className="text-amber-400">📍</span>;
}

function SettingsRow({
  icon, label, sub, href,
  labelClassName = "text-white",
  subClassName = "text-neutral-400",
  icon2,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  href: string;
  labelClassName?: string;
  subClassName?: string;
  icon2?: React.ReactNode;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-4 hover:bg-white/5 transition-colors">
      <div className="w-9 h-9 rounded-xl bg-[#2a2a2a] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${labelClassName}`}>{label}</p>
        <p className={`text-xs ${subClassName}`}>{sub}</p>
      </div>
      {icon2 ?? <ChevronRight size={16} className="text-neutral-600" />}
    </Link>
  );
}
