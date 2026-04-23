"use client";

import { useState } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { INDIAN_CITIES } from "@/lib/constants";
import { useAppStore } from "@/store/app-store";

export const SearchBar = () => {
  const router = useRouter();
  const { filters, setFilter } = useAppStore();
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [cityQuery, setCityQuery] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.city) params.set("city", filters.city);
    if (filters.date) params.set("date", filters.date);
    if (filters.minCapacity)
      params.set("minCapacity", String(filters.minCapacity));
    router.push(`/?${params.toString()}`);
    setShowCityDropdown(false);
  };

  const filteredCities = cityQuery
    ? INDIAN_CITIES.filter((c) =>
        c.toLowerCase().includes(cityQuery.toLowerCase()),
      )
    : INDIAN_CITIES;

  const clearCity = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFilter("city", "");
    setCityQuery("");
  };

  return (
    <div
      className="rounded-3xl border border-[#242830] overflow-visible"
      style={{ background: "#1c1f22" }}
    >
      {/* ── Location ── */}
      <div className="relative">
        <div
          className="px-5 py-4 cursor-pointer flex items-center justify-between gap-3"
          onClick={() => setShowCityDropdown((o) => !o)}
        >
          <div className="flex-1 min-w-0">
            <p
              className="text-[10px] text-[#BFC8CA] uppercase tracking-[0.14em] font-bold mb-0.5"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              LOCATION
            </p>
            <p
              className={`text-[15px] leading-snug ${filters.city ? "text-white font-medium" : "text-[#BFC8CA]"}`}
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              {filters.city || "Search Indian cities (e.g. Mumbai, Delhi)"}
            </p>
          </div>

          {filters.city ? (
            <button
              onClick={clearCity}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-[#353c45] shrink-0"
            >
              <X size={12} className="text-neutral-300" />
            </button>
          ) : (
            <ChevronDown
              size={16}
              className={`text-[#BFC8CA] shrink-0 transition-transform ${showCityDropdown ? "rotate-180" : ""}`}
            />
          )}
        </div>

        {/* City dropdown */}
        {showCityDropdown && (
          <div
            className="absolute top-full left-0 right-0 z-50 mt-1 rounded-2xl border border-[#242830] shadow-2xl overflow-hidden"
            style={{ background: "#1c1f22" }}
          >
            {/* Search inside dropdown */}
            <div className="px-4 py-2.5 border-b border-[#242830]">
              <input
                autoFocus
                type="text"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder="Type a city..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
              />
            </div>
            <div className="max-h-52 overflow-y-auto scrollbar-hide">
              {filteredCities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setFilter("city", city);
                    setCityQuery("");
                    setShowCityDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-neutral-300 hover:text-white hover:bg-[#262b30] transition-colors"
                >
                  {city}
                </button>
              ))}
              {filteredCities.length === 0 && (
                <p className="px-4 py-3 text-sm text-neutral-600">
                  No cities found
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* divider */}
      <div className="h-px bg-[#242830] mx-5" />

      {/* ── Date ── */}
      <div className="px-5 py-4">
        <p
          className="text-[10px] text-[#BFC8CA] uppercase tracking-[0.14em] font-bold mb-0.5"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          DATE
        </p>
        <input
          type="date"
          value={filters.date ?? ""}
          onChange={(e) => setFilter("date", e.target.value)}
          className={`w-full bg-transparent text-[15px] leading-snug outline-none [color-scheme:dark] ${
            filters.date ? "text-white" : "text-[#BFC8CA]"
          }`}
          style={{ fontFamily: "var(--font-noto-serif)" }}
        />
      </div>

      {/* divider */}
      <div className="h-px bg-[#242830] mx-5" />

      {/* ── Guests ── */}
      <div className="px-5 py-4">
        <p
          className="text-[10px] text-[#BFC8CA] uppercase tracking-[0.14em] font-bold mb-0.5"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          GUESTS
        </p>
        <input
          type="number"
          min={1}
          value={filters.minCapacity ?? ""}
          onChange={(e) =>
            setFilter(
              "minCapacity",
              e.target.value ? Number(e.target.value) : null,
            )
          }
          placeholder="Add attendees"
          className="w-full bg-transparent text-[15px] leading-snug text-[#BFC8CA] outline-none placeholder:text-[#BFC8CA] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        />
      </div>

      {/* ── Search button ── */}
      <div className="p-3 pt-1">
        <button
          onClick={handleSearch}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-black text-base transition-all active:scale-[0.98] shadow-lg"
          style={{
            // background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fcd34d 100%)",
            background:
              "linear-gradient(4deg,rgba(233, 195, 73, 1) 0%, rgba(255, 183, 131, 1) 50%, rgba(255, 183, 131, 1) 100%)",
            // boxShadow: "0 4px 24px rgba(251,191,36,0.25)",
            fontFamily: "var(--font-manrope)",
          }}
        >
          <Search size={20} strokeWidth={2.5} />
          {/* <span>Search Venues</span> */}
        </button>
      </div>
    </div>
  );
};
