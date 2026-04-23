"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InquiryWithVenue } from "@/types";

interface OwnerInquiryStats {
  totalInquiries: number;
  newInquiries: number;
  inquiriesToday: number;
  pendingWhatsapp: number;
  potentialRevenue: string;
}

interface OwnerInquiriesResponse {
  inquiries: InquiryWithVenue[];
  stats: OwnerInquiryStats;
}

async function fetchOwnerInquiries(): Promise<OwnerInquiriesResponse> {
  const res = await fetch("/api/inquiries/owner");
  if (!res.ok) throw new Error("Failed to fetch inquiries");
  const json = await res.json();
  return json.data;
}

async function updateInquiryStatusApi(
  id: string,
  status: "new" | "responded" | "archived",
  whatsappSent?: boolean
) {
  const res = await fetch(`/api/inquiries/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, whatsappSent }),
  });
  if (!res.ok) throw new Error("Failed to update inquiry");
  return res.json();
}

export function useOwnerInquiries() {
  return useQuery({
    queryKey: ["owner-inquiries"],
    queryFn: fetchOwnerInquiries,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateInquiryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      whatsappSent,
    }: {
      id: string;
      status: "new" | "responded" | "archived";
      whatsappSent?: boolean;
    }) => updateInquiryStatusApi(id, status, whatsappSent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-inquiries"] });
    },
  });
}
