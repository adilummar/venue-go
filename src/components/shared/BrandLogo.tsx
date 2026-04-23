import Image from "next/image";

/**
 * BrandLogo — single source of truth for the "🎭 Venue Go" wordmark.
 * Used in both customer and owner headers so colour + font never diverge.
 */
export function BrandLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const textSize =
    size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-base";

  const emojiSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div className="flex items-center gap-2 ">
      
      {/* Masked icon container — amber glow ring */}
      {/* <div
        className="flex items-center justify-center rounded-xl"
        style={{
          width:  size === "lg" ? 38 : size === "sm" ? 28 : 32,
          height: size === "lg" ? 38 : size === "sm" ? 28 : 32,
          background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
          boxShadow: "0 0 0 2px rgba(251,191,36,0.18)",
        }}
        aria-hidden="true"
      >
        <span className={`${emojiSize} leading-none`}>🎭</span>
      </div> */}

      <Image src={"/icons/explore-1.png"} width={20} height={20} alt="venue-go" />

      {/* Wordmark */}
      <span
        className={`text-amber-400 font-bold tracking-tight leading-none italic ${textSize}`}
        style={{ fontFamily: "var(--font-noto-serif)" }}
      >
        Venue Go
      </span>
    </div>
  );
}
