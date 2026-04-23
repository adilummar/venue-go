"use client";

import { create } from "zustand";
import { CategoryValue } from "@/lib/constants";

interface SearchFilters {
  city: string;
  category: CategoryValue | "";
  search: string;
  minCapacity: number | null;
  date: string | null;
}

interface AppStore {
  // Search & Filter state
  filters: SearchFilters;
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  resetFilters: () => void;

  // UI state
  isMapOpen: boolean;
  toggleMap: () => void;

  // Wishlist (local mirror for optimistic updates)
  wishlistedVenueIds: Set<string>;
  setWishlisted: (venueId: string, wishlisted: boolean) => void;
  initWishlisted: (venueIds: string[]) => void;
}

const defaultFilters: SearchFilters = {
  city: "",
  category: "",
  search: "",
  minCapacity: null,
  date: null,
};

export const useAppStore = create<AppStore>((set) => ({
  filters: defaultFilters,

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  resetFilters: () => set({ filters: defaultFilters }),

  isMapOpen: false,
  toggleMap: () => set((state) => ({ isMapOpen: !state.isMapOpen })),

  wishlistedVenueIds: new Set<string>(),
  setWishlisted: (venueId, wishlisted) =>
    set((state) => {
      const next = new Set(state.wishlistedVenueIds);
      if (wishlisted) {
        next.add(venueId);
      } else {
        next.delete(venueId);
      }
      return { wishlistedVenueIds: next };
    }),
  initWishlisted: (venueIds) =>
    set({ wishlistedVenueIds: new Set(venueIds) }),
}));
