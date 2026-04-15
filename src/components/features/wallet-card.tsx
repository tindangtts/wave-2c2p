"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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

const LANGUAGES = [
  { code: "en", label: "English", flag: "🌐" },
  { code: "th", label: "ไทย", flag: "🇹🇭" },
  { code: "mm", label: "မြန်မာ", flag: "🇲🇲" },
] as const;

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LanguagePill() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState("en");

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
    if (match) setCurrentLocale(match[1]);
  }, []);

  const current = LANGUAGES.find((l) => l.code === currentLocale) ?? LANGUAGES[0];

  function handleSelect(code: string) {
    if (code === currentLocale) {
      setOpen(false);
      return;
    }
    document.cookie = `locale=${code}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setCurrentLocale(code);
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#21212133] bg-white/60 min-h-[44px]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-sm">{current.flag}</span>
        <span className="text-xs font-medium text-[#212121]">{current.label}</span>
        <span className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <ChevronDownIcon />
        </span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <ul
            role="listbox"
            className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-[#e0e0e0] py-1 min-w-[140px] animate-dropdown-enter"
          >
            {LANGUAGES.map((lang) => (
              <li key={lang.code} role="option" aria-selected={lang.code === currentLocale}>
                <button
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-left ${
                    lang.code === currentLocale ? "bg-[#FFE60020]" : ""
                  }`}
                >
                  <span className="text-sm">{lang.flag}</span>
                  <span className="text-sm text-[#212121]">{lang.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
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

  const rawWalletId = profile?.wallet_id ?? "";

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
      {/* User greeting + language selector — design: name on left, language pill on right */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xl font-medium text-[#000000] leading-[1.4] truncate min-w-0">
          {t("greeting", { firstName })}
        </p>
        <LanguagePill />
      </div>

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
          <span className="text-sm text-[#595959]">{t("errors.balanceFetch")}</span>
        ) : (
          <span className="text-[13.3px] font-normal text-[#000000] balance-transition">
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
          <span className="w-6 h-6 flex items-center justify-center rounded-[6px] bg-[#dbc300]">
            {showBalance ? <EyeIcon /> : <EyeOffIcon />}
          </span>
        </button>
      </div>

      {/* Wallet ID row — design: 12px normal text + copy icon */}
      <div className="flex items-center gap-0 rounded-md" id="wallet-id-row">
        <span className="text-xs text-[#000000]">
          {t("walletIdLabel")}{rawWalletId}
        </span>
        <button
          onClick={() => {
            handleCopyWalletId();
            const row = document.getElementById("wallet-id-row");
            if (row) {
              row.classList.remove("animate-copy-flash");
              void row.offsetWidth;
              row.classList.add("animate-copy-flash");
            }
          }}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90 transition-transform duration-100"
          aria-label={t("copyWalletId")}
        >
          <CopyIcon />
        </button>
      </div>
    </div>
  );
}
