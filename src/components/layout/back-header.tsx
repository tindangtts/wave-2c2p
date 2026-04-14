"use client";

import { useRouter } from "next/navigation";

/* Custom back arrow matching Pencil design arrow icon */
function BackArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15 19l-7-7 7-7" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

interface BackHeaderProps {
  title: string;
  onBack?: () => void;
  rightContent?: React.ReactNode;
}

export function BackHeader({ title, onBack, rightContent }: BackHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40">
      <div className="wave-status-bar h-11 safe-top" />
      {/* Design: yellow bg header with centered title */}
      <div className="bg-[#FFE512] px-4 py-3 flex items-center relative">
        <button
          onClick={onBack ?? (() => router.back())}
          className="p-1 -ml-1 rounded-full hover:bg-black/5 transition-colors z-10"
          aria-label="Go back"
        >
          <BackArrowIcon />
        </button>
        {/* Centered title */}
        <h1 className="absolute inset-x-0 text-center text-base font-semibold text-foreground">
          {title}
        </h1>
        {rightContent && (
          <div className="ml-auto text-sm font-medium text-foreground z-10">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
}
