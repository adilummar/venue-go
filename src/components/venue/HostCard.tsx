import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { VenueOwner } from "@/types";

interface HostCardProps {
  owner: VenueOwner;
  venueId: string;
}

export const HostCard = ({ owner, venueId }: HostCardProps) => {
  const yearsHosting = owner.hostSince
    ? new Date().getFullYear() - owner.hostSince
    : null;

  return (
    <div className="bg-[#1c1f22] border border-[#242830] rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#262b30] shrink-0">
          {owner.avatarUrl ? (
            <Image src={owner.avatarUrl} alt={owner.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg text-white font-bold">
              {owner.name[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-neutral-400 text-xs">Hosted by</p>
          <p className="text-white font-bold">{owner.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {yearsHosting && (
              <span className="text-neutral-400 text-xs">Host for {yearsHosting} years ·</span>
            )}
            {owner.isSuperhost && (
              <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Superhost
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/venue/${venueId}/inquiry`}
          className="px-4 py-2 bg-[#262b30] hover:bg-[#353c45] text-white text-sm font-semibold rounded-xl border border-[#353c45] transition-colors"
        >
          Contact
        </Link>
      </div>

      {/* Trust badges */}
      <div className="mt-4 space-y-2.5 border-t border-[#242830] pt-3">
        <div className="flex items-start gap-2.5">
          <Star size={14} className="text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-white text-sm font-semibold">Highly rated host</p>
            <p className="text-neutral-400 text-xs">{owner.name} has received 5-star ratings from 100% of recent artists.</p>
          </div>
        </div>
        {owner.responseTime && (
          <div className="flex items-start gap-2.5">
            <span className="text-teal-400 text-sm mt-0.5">💬</span>
            <div>
              <p className="text-white text-sm font-semibold">Great communication</p>
              <p className="text-neutral-400 text-xs">Typically responds {owner.responseTime}.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
