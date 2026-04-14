"use client";

import useSWR from "swr";
import { toast } from "sonner";
import type { Recipient } from "@/types";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("fetch failed");
    return r.json();
  });

export interface RecipientsData {
  recipients: Recipient[];
}

const SWR_OPTIONS = {
  revalidateOnFocus: true,
  dedupingInterval: 30000,
} as const;

export function useRecipients() {
  const { data, error, isLoading, mutate } = useSWR<RecipientsData>(
    "/api/recipients",
    fetcher,
    SWR_OPTIONS
  );

  return { data, error, isLoading, mutate };
}

/**
 * Optimistically toggles a recipient's favorite status.
 * Mutates the local cache immediately, then sends PATCH request.
 * Reverts on error and shows a toast.
 */
export async function toggleFavorite(
  id: string,
  isFavorite: boolean,
  mutate: ReturnType<typeof useRecipients>["mutate"]
) {
  // Optimistic update
  await mutate(
    (current) => {
      if (!current) return current;
      return {
        recipients: current.recipients.map((r) =>
          r.id === id ? { ...r, is_favorite: !isFavorite } : r
        ),
      };
    },
    { revalidate: false }
  );

  try {
    const res = await fetch(`/api/recipients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_favorite: !isFavorite }),
    });

    if (!res.ok) {
      throw new Error("Failed to update favorite");
    }

    // Revalidate after successful PATCH
    await mutate();
  } catch {
    // Revert on error
    await mutate(
      (current) => {
        if (!current) return current;
        return {
          recipients: current.recipients.map((r) =>
            r.id === id ? { ...r, is_favorite: isFavorite } : r
          ),
        };
      },
      { revalidate: false }
    );
    toast.error("Could not update favorite");
  }
}
