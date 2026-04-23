import Image from "next/image";
import { ReviewWithCustomer } from "@/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Star, PenLine } from "lucide-react";

interface ReviewListProps {
  reviews: ReviewWithCustomer[];
  total: number;
  venueId: string;
}

export const ReviewList = ({ reviews, total, venueId }: ReviewListProps) => {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-xl" style={{fontFamily: 'var(--font-noto-serif)'}}>
          Reviews{" "}
          {total > 0 && <span className="text-[#BFC8CA] text-base font-normal" style={{fontFamily: 'var(--font-manrope)'}}>({total})</span>}
        </h2>
        <Link
          href={`/venue/${venueId}/review`}
          className="flex items-center gap-1.5 text-xs font-bold text-amber-400 border border-amber-400/30 rounded-xl px-3 py-2 hover:bg-amber-400/10 transition-colors"
        >
          <PenLine size={12} /> Write a Review
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="text-4xl mb-3">⭐</div>
          <p className="text-neutral-400 text-sm font-medium">No reviews yet</p>
          <p className="text-neutral-600 text-xs mt-1">Be the first to share your experience</p>
          <Link
            href={`/venue/${venueId}/review`}
            className="mt-4 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-xl text-sm transition-colors"
          >
            Write the First Review
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {reviews.map((review) => (
              <div key={review.id} className="flex gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#2a2a2a] shrink-0">
                  {review.customer?.avatarUrl ? (
                    <Image
                      src={review.customer.avatarUrl}
                      alt={review.customer.name ?? ""}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                      {review.customer?.name?.[0] ?? "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-white font-semibold text-sm">{review.customer?.name}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={11}
                          fill={Number(review.ratingOverall) >= n ? "#f59e0b" : "none"}
                          className={Number(review.ratingOverall) >= n ? "text-amber-400" : "text-neutral-700"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[#BFC8CA] text-xs mb-1.5">
                    {review.createdAt ? formatDate(review.createdAt.toString()) : ""}
                  </p>
                  {review.body && (
                    <p className="text-neutral-300 text-sm leading-relaxed line-clamp-3">{review.body}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {total > reviews.length && (
            <Link
              href={`/venue/${venueId}?tab=reviews`}
              className="mt-5 flex justify-center w-full py-3 border border-white/20 text-white text-sm font-semibold rounded-xl hover:bg-white/5 transition-colors"
            >
              Show all {total} reviews
            </Link>
          )}
        </>
      )}
    </div>
  );
};
