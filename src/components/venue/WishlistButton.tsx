"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  venueId: string;
  className?: string;
}

export const WishlistButton = ({ venueId, className }: WishlistButtonProps) => {
  const { data: session } = useSession();
  const { toggle, isWishlisted, isPending } = useWishlist();
  const wishlisted = isWishlisted(venueId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) return;
    toggle(venueId);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all active:scale-90",
        className
      )}
    >
      <Heart
        size={16}
        className={cn(
          "transition-colors",
          wishlisted ? "fill-red-500 text-red-500" : "fill-none text-white"
        )}
      />
    </button>
  );
};
