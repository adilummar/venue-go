"use client";

import { useState } from "react";
import { Star, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  venueId: string;
  venueName: string;
}

const RATING_LABELS = ["Terrible", "Bad", "OK", "Good", "Excellent"];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="p-1 -m-1 transition-transform active:scale-90 touch-manipulation"
        >
          <Star
            size={28}
            fill={(hover || value) >= n ? "#f59e0b" : "none"}
            className={(hover || value) >= n ? "text-amber-400" : "text-neutral-600"}
          />
        </button>
      ))}
      {(hover || value) > 0 && (
        <span className="text-neutral-400 text-sm self-center ml-1">
          {RATING_LABELS[(hover || value) - 1]}
        </span>
      )}
    </div>
  );
}

export function ReviewForm({ venueId, venueName }: ReviewFormProps) {
  const router = useRouter();
  const [overall, setOverall] = useState(0);
  const [acoustics, setAcoustics] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [cleanliness, setCleanliness] = useState(0);
  const [location, setLocation] = useState(0);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (overall === 0) { setError("Please give an overall rating."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId,
          ratingOverall: overall,
          ratingAcoustics: acoustics || undefined,
          ratingCommunication: communication || undefined,
          ratingCleanliness: cleanliness || undefined,
          ratingLocation: location || undefined,
          body: body.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit review");
      setDone(true);
      setTimeout(() => router.push(`/venue/${venueId}`), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center py-16 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <h3 className="text-white font-bold text-xl">Review Submitted!</h3>
        <p className="text-neutral-400 text-sm">Thank you for sharing your experience.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Overall */}
      <div>
        <label className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest block mb-3">
          OVERALL RATING *
        </label>
        <StarPicker value={overall} onChange={setOverall} />
      </div>

      {/* Category ratings */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 space-y-4">
        <p className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest">DETAILED RATINGS (optional)</p>
        {[
          { label: "Acoustics", value: acoustics, set: setAcoustics },
          { label: "Communication", value: communication, set: setCommunication },
          { label: "Cleanliness", value: cleanliness, set: setCleanliness },
          { label: "Location", value: location, set: setLocation },
        ].map(({ label, value, set }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-neutral-300 text-sm w-32">{label}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set(n)}
                  className="p-1.5 -m-1 touch-manipulation"
                >
                  <Star size={20} fill={value >= n ? "#f59e0b" : "none"} className={value >= n ? "text-amber-400" : "text-neutral-600"} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Written review */}
      <div>
        <label className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest block mb-2">
          YOUR EXPERIENCE (optional)
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder={`Describe your experience at ${venueName}...`}
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-400 placeholder:text-neutral-600 resize-none transition-colors"
        />
        <p className="text-neutral-600 text-xs mt-1 text-right">{body.length}/500</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || overall === 0}
        className={`w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2
          ${overall > 0 ? "bg-amber-400 hover:bg-amber-500 text-black" : "bg-[#2a2a2a] text-[#BFC8CA] cursor-not-allowed"}
          disabled:opacity-60`}
      >
        {loading ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : "Submit Review →"}
      </button>
    </form>
  );
}
