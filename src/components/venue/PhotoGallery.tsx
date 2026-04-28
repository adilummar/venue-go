"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoGalleryProps {
  images: string[];
}

export const PhotoGallery = ({ images }: PhotoGalleryProps) => {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(images.length - 1, c + 1));

  return (
    <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#1a1a1a]">
      <Image
        src={images[current] ?? "/placeholder-venue.jpg"}
        alt={`Venue photo ${current + 1}`}
        fill
        className="object-cover transition-opacity duration-300"
        priority
        sizes="100vw"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />

      {/* Counter pill */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
        <span className="text-xs text-neutral-400">🖼️</span>
        <span className="text-white text-xs font-semibold">
          {current + 1}/{images.length}
        </span>
      </div>

      {/* Dot indicators (shown when multiple images) */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-4 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Nav buttons */}
      {images.length > 1 && (
        <>
          {current > 0 && (
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"
            >
              <ChevronLeft size={18} className="text-white" />
            </button>
          )}
          {current < images.length - 1 && (
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"
            >
              <ChevronRight size={18} className="text-white" />
            </button>
          )}
        </>
      )}
    </div>
  );
};
