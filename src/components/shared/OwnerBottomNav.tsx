"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";

const OWNER_NAV = [
  { href: "/owner/dashboard", icon: LayoutDashboard, label: "DASHBOARD" },
  { href: "/owner/inquiries", icon: MessageSquare,   label: "INQUIRIES" },
  { href: "/owner/venues",    icon: Building2,        label: "VENUES" },
  { href: "/profile",         icon: User,             label: "PROFILE" },
];

export const OwnerBottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0e1012] border-t border-[#242830]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto pb-safe">
        {OWNER_NAV.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 flex-1 py-2"
            >
              <Icon
                size={20}
                className={cn(
                  "transition-colors",
                  isActive ? "text-amber-400" : "text-[#BFC8CA]"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold tracking-widest transition-colors",
                  isActive ? "text-amber-400" : "text-[#BFC8CA]"
                )}
                style={{fontFamily:'var(--font-manrope)'}}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
