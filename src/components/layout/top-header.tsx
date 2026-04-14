"use client";

import { Bell } from "lucide-react";
import Link from "next/link";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-40">
      {/* Status bar area */}
      <div className="wave-status-bar h-11 safe-top" />
      {/* Brand header */}
      <div className="wave-header-gradient px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-xl font-bold tracking-tight text-foreground">
            2c2p
          </span>
          <span className="text-xl font-bold tracking-tight text-wave-blue">
            wave
          </span>
        </div>
        <Link href="/notifications" className="relative">
          <Bell className="w-6 h-6 text-foreground" />
        </Link>
      </div>
    </header>
  );
}
