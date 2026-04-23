"use client";

import { Map } from "lucide-react";
import { useAppStore } from "@/store/app-store";

export const MapToggle = () => {
  const { isMapOpen, toggleMap } = useAppStore();
  return (
    <div className="flex justify-center pb-4">
      <button
        onClick={toggleMap}
        className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full text-sm text-neutral-400 hover:border-[#3a3a3a] transition-colors"
      >
        <Map size={14} />
        {isMapOpen ? "Hide Map" : "Show Map"}
      </button>
    </div>
  );
};
