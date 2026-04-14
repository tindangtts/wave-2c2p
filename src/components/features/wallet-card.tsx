"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useWallet } from "@/hooks/use-wallet";
import { formatCurrency } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";

/* Custom eye toggle icon matching Pencil design */
function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="#212121" strokeWidth="2"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.12 14.12a3 3 0 11-4.24-4.24" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="1" y1="1" x2="23" y2="23" stroke="#212121" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/* Custom copy icon matching Pencil design */
function CopyIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="#000000" strokeWidth="2" fill="none"/>
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="#000000" strokeWidth="2" fill="none"/>
    </svg>
  );
}

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
    <div className="flex flex-col gap-2.5">
      {/* User greeting — design: Kanit 20px medium */}
      <p className="text-[20px] font-medium text-[#000000] leading-[1.4]">
        {t("greeting", { firstName })}
      </p>

      {/* Balance row — design: baht icon + amount + eye toggle */}
      <div className="flex items-center gap-[7px]">
        {/* Thai baht currency icon — yellow circle per Pencil design */}
        <svg width="27" height="27" viewBox="0 0 27 27" fill="none" className="flex-shrink-0">
          <circle cx="13.5" cy="13.5" r="12.5" stroke="#212121" strokeWidth="1.5" fill="#FFE512"/>
          <text x="13.5" y="18.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="15" fill="#212121">฿</text>
        </svg>
        {isLoading || !hydrated ? (
          <Skeleton className="h-5 w-[120px] bg-[#FDD835]" />
        ) : error ? (
          <span className="text-sm text-[#757575]">{t("errors.balanceFetch")}</span>
        ) : (
          <span className="text-[13px] font-normal text-[#000000]">
            {showBalance
              ? wallet
                ? formatCurrency(wallet.balance, "THB")
                : "0.00 THB"
              : t("balanceHidden")}
          </span>
        )}
        <button
          onClick={handleToggleBalance}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2"
          aria-label={showBalance ? t("hideBalance") : t("showBalance")}
        >
          {showBalance ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      </div>

      {/* Wallet ID row — design: 12px normal text + copy icon */}
      <div className="flex items-center gap-0">
        <span className="text-xs text-[#000000]">
          {t("walletIdLabel")}{maskedWalletId}
        </span>
        <button
          onClick={handleCopyWalletId}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={t("copyWalletId")}
        >
          <CopyIcon />
        </button>
      </div>
    </div>
  );
}
