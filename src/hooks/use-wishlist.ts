"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/app-store";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

async function toggleWishlistApi(venueId: string): Promise<{ wishlisted: boolean }> {
  const res = await fetch("/api/wishlists/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ venueId }),
  });
  if (!res.ok) throw new Error("Failed to toggle wishlist");
  const json = await res.json();
  return json.data;
}

export function useWishlist() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { wishlistedVenueIds, setWishlisted, initWishlisted } = useAppStore();

  const { data: wishlistIds } = useQuery({
    queryKey: ["wishlists"],
    queryFn: async () => {
      const res = await fetch("/api/wishlists");
      if (!res.ok) return [];
      const json = await res.json();
      return json.data.map((v: any) => v.id) as string[];
    },
    enabled: !!session?.user,
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });

  useEffect(() => {
    if (wishlistIds) {
      initWishlisted(wishlistIds);
    }
  }, [wishlistIds, initWishlisted]);

  const mutation = useMutation({
    mutationFn: toggleWishlistApi,
    onMutate: async (venueId) => {
      // Optimistic update
      const wasWishlisted = wishlistedVenueIds.has(venueId);
      setWishlisted(venueId, !wasWishlisted);
      return { venueId, wasWishlisted };
    },
    onError: (_err, _venueId, ctx) => {
      // Revert on error
      if (ctx) setWishlisted(ctx.venueId, ctx.wasWishlisted);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
  });

  return {
    toggle: (venueId: string) => mutation.mutate(venueId),
    isWishlisted: (venueId: string) => wishlistedVenueIds.has(venueId),
    isPending: mutation.isPending,
  };
}
