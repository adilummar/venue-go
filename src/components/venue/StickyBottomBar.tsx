"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { formatPrice, buildWaLink, buildInquiryMessage } from "@/lib/utils";

interface StickyBottomBarProps {
  price: string;
  venueId: string;
  ownerWhatsapp: string;
  venueName: string;
}

export const StickyBottomBar = ({
  price,
  venueId,
  ownerWhatsapp,
  venueName,
}: StickyBottomBarProps) => {
  const waMessage = buildInquiryMessage({
    venueName,
    date: "TBD",
    guestCount: 0,
    message: "I am interested in booking this venue.",
  });

  const waLink = ownerWhatsapp
    ? buildWaLink(ownerWhatsapp, waMessage)
    : "#";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0e1012] border-t border-[#242830] px-4 py-3">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        {/* Price */}
        <div className="flex-1">
          <span className="text-white font-bold text-lg" style={{fontFamily: 'var(--font-noto-serif)'}}>
            {formatPrice(price)}
          </span>
          <span className="text-neutral-400 text-xs"> / evening</span>
          <p className="text-amber-400 text-xs font-semibold mt-0.5 uppercase tracking-wider">Availability</p>
        </div>

        {/* WhatsApp CTA */}
        {ownerWhatsapp ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] text-white font-bold px-5 py-3 rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-green-900/30"
          >
            <MessageCircle size={18} />
            Chat on WhatsApp
          </a>
        ) : (
          <Link
            href={`/venue/${venueId}/inquiry`}
            className="flex items-center gap-2 bg-amber-400 text-black font-bold px-5 py-3 rounded-xl text-sm transition-all active:scale-95"
          >
            Send Inquiry
          </Link>
        )}
      </div>
    </div>
  );
};
