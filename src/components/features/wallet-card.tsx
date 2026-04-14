"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useWallet } from "@/hooks/use-wallet";
import { formatCurrency } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";

export function WalletCard() {
  const t = useTranslations("home");
  const { data, error, isLoading } = useWallet();

  // Start with true to avoid SSR mismatch, then hydrate from localStorage
  const [showBalance, setShowBalance] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("wave_balance_visible");
    if (stored !== null) {
      setShowBalance(stored !== "false");
    }
    setHydrated(true);
  }, []);

  const handleToggleBalance = () => {
    const next = !showBalance;
    setShowBalance(next);
    localStorage.setItem("wave_balance_visible", String(next));
  };

  const wallet = data?.wallet ?? null;
  const profile = data?.profile ?? null;
  const firstName = profile?.first_name ?? "";

  // Masked wallet ID: WAVE-XXXX-XXXX from last 8 chars
  const rawWalletId = profile?.wallet_id ?? "";
  const last8 = rawWalletId.replace(/-/g, "").slice(-8);
  const maskedWalletId =
    last8.length >= 8
      ? `WAVE-${last8.slice(0, 4)}-${last8.slice(4)}`
      : rawWalletId;

  const handleCopyWalletId = async () => {
    try {
      await navigator.clipboard.writeText(rawWalletId);
      toast(t("walletIdCopied"), { duration: 2000, position: "bottom-center" });
    } catch {
      // Silent fail if clipboard API is unavailable
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* User greeting */}
      <p className="text-base font-bold text-[#212121] mb-1">
        {t("greeting", { firstName })}
      </p>

      {/* Balance row */}
      <div className="flex items-center gap-2">
        <span className="text-xl text-[#212121]">฿</span>
        {isLoading || !hydrated ? (
          <Skeleton className="h-6 w-[120px] bg-[#FDD835]" />
        ) : error ? (
          <span className="text-sm text-[#757575]">{t("errors.balanceFetch")}</span>
        ) : (
          <span className="text-xl font-bold text-[#212121]">
            {showBalance
              ? wallet
                ? formatCurrency(wallet.balance, "THB")
                : "฿ 0.00"
              : t("balanceHidden")}
          </span>
        )}
        <button
          onClick={handleToggleBalance}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={showBalance ? t("hideBalance") : t("showBalance")}
        >
          {showBalance ? (
            <Eye className="w-5 h-5 text-[#212121]" />
          ) : (
            <EyeOff className="w-5 h-5 text-[#212121]" />
          )}
        </button>
      </div>

      {/* Wallet ID row */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-[#212121]">
          {t("walletIdLabel")} {maskedWalletId}
        </span>
        <button
          onClick={handleCopyWalletId}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={t("copyWalletId")}
        >
          <Copy className="w-4 h-4 text-[#212121]" />
        </button>
      </div>
    </div>
  );
}
