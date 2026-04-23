"use client";

import { useQuery } from "@tanstack/react-query";
import { VenueSummary } from "@/types";

interface VenueFilters {
  city?: string;
  category?: string;
  search?: string;
  minCapacity?: number | null;
  page?: number;
  limit?: number;
}

interface VenuesResponse {
  venues: VenueSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function fetchVenues(filters: VenueFilters): Promise<VenuesResponse> {
  const params = new URLSearchParams();
  if (filters.city) params.set("city", filters.city);
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.minCapacity) params.set("minCapacity", String(filters.minCapacity));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const res = await fetch(`/api/venues?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch venues");
  const json = await res.json();
  return json.data;
}

export function useVenues(filters: VenueFilters = {}) {
  return useQuery({
    queryKey: ["venues", filters],
    queryFn: () => fetchVenues(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
