import { Star } from "lucide-react";
import { VenueRatingStats } from "@/types";

interface CategoryRatingsProps {
  stats: VenueRatingStats;
}

const RatingBar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-neutral-400 text-xs uppercase tracking-wider">{label}</span>
      <span className="text-white text-xs font-bold">{value.toFixed(1)}</span>
    </div>
    <div className="h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
      <div
        className="h-full bg-amber-400 rounded-full transition-all"
        style={{ width: `${(value / 5) * 100}%` }}
      />
    </div>
  </div>
);

export const CategoryRatings = ({ stats }: CategoryRatingsProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Star size={18} className="fill-amber-400 text-amber-400" />
        <span className="text-white font-bold text-xl" style={{fontFamily: 'var(--font-noto-serif)'}}>
          {Number(stats.avgOverall).toFixed(2)} · {stats.reviewCount} reviews
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <RatingBar label="Acoustics" value={Number(stats.avgAcoustics)} />
        <RatingBar label="Communication" value={Number(stats.avgCommunication)} />
        <RatingBar label="Cleanliness" value={Number(stats.avgCleanliness)} />
        <RatingBar label="Location" value={Number(stats.avgLocation)} />
      </div>
    </div>
  );
};
