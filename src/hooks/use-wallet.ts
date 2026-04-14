"use client";

import useSWR from "swr";
import type { Wallet, Transaction } from "@/types";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("fetch failed");
    return r.json();
  });

export interface WalletData {
  wallet: Wallet | null;
  profile: {
    first_name: string;
    wallet_id: string;
  } | null;
}

export interface TransactionsData {
  transactions: Transaction[];
}

const SWR_OPTIONS = {
  revalidateOnFocus: true,
  dedupingInterval: 30000,
} as const;

export function useWallet() {
  const { data, error, isLoading, mutate } = useSWR<WalletData>(
    "/api/wallet",
    fetcher,
    SWR_OPTIONS
  );

  return { data, error, isLoading, mutate };
}

export function useRecentTransactions() {
  const { data, error, isLoading, mutate } = useSWR<TransactionsData>(
    "/api/wallet/transactions",
    fetcher,
    SWR_OPTIONS
  );

  return { data, error, isLoading, mutate };
}
