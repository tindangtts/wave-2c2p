"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackHeaderProps {
  title: string;
  onBack?: () => void;
}

export function BackHeader({ title, onBack }: BackHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40">
      <div className="wave-status-bar h-11 safe-top" />
      <div className="wave-header-gradient px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack ?? (() => router.back())}
          className="p-1 -ml-1 rounded-full hover:bg-black/5 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
    </header>
  );
}
