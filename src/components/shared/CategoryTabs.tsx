"use client";

import { useAppStore } from "@/store/app-store";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const CategoryTabs = () => {
  const { filters, setFilter } = useAppStore();

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1 pt-8">
      {CATEGORIES.map(({ value, label, emoji }) => {
        const isActive = filters.category === value;
        return (
          <button
            key={value}
            onClick={() => setFilter("category", isActive ? "" : value)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all shrink-0",
              isActive
                ? "text-black border-transparent"
                : "bg-transparent text-neutral-400 border-[#242830] hover:border-[#353c45] hover:text-neutral-300"
            )}
            style={
              isActive
                ? {
                    background:
                      "linear-gradient(135deg, #fbbf24 0%, #f59e0b 60%, #fcd34d 100%)",
                    fontFamily: "var(--font-manrope)",
                  }
                : { fontFamily: "var(--font-manrope)" }
            }
          >
            <span className="text-sm leading-none">{emoji}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
