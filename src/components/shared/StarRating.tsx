import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  showNumber?: boolean;
  size?: number;
  className?: string;
}

export const StarRating = ({
  rating,
  showNumber = true,
  size = 14,
  className,
}: StarRatingProps) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Star size={size} className="fill-amber-400 text-amber-400" />
      {showNumber && (
        <span className="text-sm font-semibold text-white">
          {Number(rating).toFixed(2)}
        </span>
      )}
    </div>
  );
};
