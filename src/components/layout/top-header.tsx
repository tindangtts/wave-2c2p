"use client";

import { useTranslations } from "next-intl";

/* Custom bell icon matching Pencil design */
function BellIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0"
        stroke="#181d27"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Brand logo SVG matching Pencil design — "2c2p" dark + "WAVE" blue */
function BrandLogo() {
  return (
    <svg width="144" height="20" viewBox="0 0 144 20" fill="none" aria-label="2c2p WAVE">
      <text x="0" y="16" fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif" fontWeight="900" fontSize="18" fill="#004D5A" letterSpacing="-0.5">2c2p</text>
      <text x="56" y="16" fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif" fontWeight="900" fontSize="18" fill="#0091C7" letterSpacing="0.5">WAVE</text>
    </svg>
  );
}

export function TopHeader() {
  const t = useTranslations("home");

  return (
    <header className="sticky top-0 z-40">
      {/* Status bar area — design: yellow extends into status bar for logged-in */}
      <div className="bg-[#FFE512] h-11 safe-top" />
      {/* Brand header */}
      <div className="bg-[#FFE512] h-14 px-4 flex items-center justify-between">
        {/* 2c2p WAVE logo — custom SVG matching Pencil design */}
        <BrandLogo />
        {/* Notification bell with blue tinted bg pill — per Pencil design */}
        <button
          aria-label={t("notifications")}
          className="relative w-11 h-11 flex items-center justify-center rounded-[10px] bg-[#019cdf1a]"
        >
          <BellIcon />
        </button>
      </div>
    </header>
  );
}
