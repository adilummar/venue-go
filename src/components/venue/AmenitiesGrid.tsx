"use client";

import { useState } from "react";
import { Wifi, Wind, Camera, Music, ParkingCircle, UtensilsCrossed, Mic, Accessibility } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  ac: <Wind size={18} style={{ color: "#BFC8CA" }} />,
  camera: <Camera size={18} style={{ color: "#BFC8CA" }} />,
  wifi: <Wifi size={18} style={{ color: "#BFC8CA" }} />,
  piano: <Music size={18} style={{ color: "#BFC8CA" }} />,
  parking: <ParkingCircle size={18} style={{ color: "#BFC8CA" }} />,
  catering: <UtensilsCrossed size={18} style={{ color: "#BFC8CA" }} />,
  greenroom: <Mic size={18} style={{ color: "#BFC8CA" }} />,
  ramps: <Accessibility size={18} style={{ color: "#BFC8CA" }} />,
};

interface AmenitiesGridProps {
  amenities: { id: number; name: string; icon: string | null }[];
}

export const AmenitiesGrid = ({ amenities }: AmenitiesGridProps) => {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? amenities : amenities.slice(0, 6);

  return (
    <div>
      <h2 className="text-white font-bold text-xl mb-4" style={{fontFamily: 'var(--font-noto-serif)'}}>What this venue offers</h2>
      <div className="space-y-3">
        {displayed.map((a) => (
          <div key={a.id} className="flex items-center gap-3">
            <div className="w-6 flex items-center justify-center shrink-0">
              {a.icon && ICON_MAP[a.icon] ? ICON_MAP[a.icon] : <span style={{ color: "#BFC8CA" }}>✦</span>}
            </div>
            <span className="text-neutral-300 text-sm">{a.name}</span>
          </div>
        ))}
      </div>
      {amenities.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 px-5 py-2.5 border border-white/20 text-white text-sm font-semibold rounded-xl hover:bg-white/5 transition-colors"
        >
          {showAll ? "Show less" : `Show all ${amenities.length} amenities`}
        </button>
      )}
    </div>
  );
};
