"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Ticket, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "HOME" },
  { href: "/tickets", icon: Ticket, label: "BOOKINGS" },
  { href: "/profile", icon: User, label: "PROFILE" },
];

export const BottomNav = () => {
  const pathname = usePathname();

  // Hide on venue detail pages — they have their own StickyBottomBar
  const isVenueDetail = /^\/venue\/[^/]+$/.test(pathname);
  if (isVenueDetail) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0e1012] border-t border-[#242830]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto pb-safe">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
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
                style={{fontFamily: 'var(--font-manrope)'}}
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

/** Invisible spacer that reserves the same height as BottomNav,
 *  but only on pages where BottomNav is actually shown. */
export const BottomNavSpacer = () => {
  const pathname = usePathname();
  const isVenueDetail = /^\/venue\/[^/]+$/.test(pathname);
  if (isVenueDetail) return null;
  return <div className="h-16" aria-hidden="true" />;
};
