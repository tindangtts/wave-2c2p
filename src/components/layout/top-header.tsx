"use client";

import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";

export function TopHeader() {
  const t = useTranslations("home");

  return (
    <header className="sticky top-0 z-40">
      {/* Status bar area */}
      <div className="wave-status-bar h-11 safe-top" />
      {/* Brand header */}
      <div className="bg-[#FFE600] h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-base font-bold tracking-tight text-[#212121]">
            2c2p
          </span>
          <span className="text-base font-bold tracking-tight text-[#0091EA]">
            wave
          </span>
        </div>
        <button
          aria-label={t("notifications")}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <Bell className="w-6 h-6 text-[#212121]" />
        </button>
      </div>
    </header>
  );
}
