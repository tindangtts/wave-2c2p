"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/* SVG icon components for the bottom nav — matching Pencil design exactly */
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="27" height="27" viewBox="0 0 27 27" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.5 2.5L3 11v12a2 2 0 002 2h5v-7a1 1 0 011-1h5a1 1 0 011 1v7h5a2 2 0 002-2V11L13.5 2.5z"
        fill={active ? "#FFE512" : "rgba(255,255,255,0.7)"}
      />
    </svg>
  );
}

function ScanIcon({ active }: { active: boolean }) {
  const color = active ? "#FFE512" : "rgba(255,255,255,0.7)";
  return (
    <svg width="27" height="27" viewBox="0 0 27 27" fill="none">
      <path d="M3 10V5a2 2 0 012-2h5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 3h5a2 2 0 012 2v5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 17v5a2 2 0 01-2 2h-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 24H5a2 2 0 01-2-2v-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="3" y1="13.5" x2="24" y2="13.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function AddMoneyIcon({ active }: { active: boolean }) {
  const color = active ? "#FFE512" : "rgba(255,255,255,0.7)";
  return (
    <svg width="27" height="27" viewBox="0 0 28 28" fill="none">
      <path d="M4 9a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V9z" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 9V7a2 2 0 012-2h12l4 4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 14h-4m0 0l1.5-1.5M16 14l1.5 1.5" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 17h4m0 0l-1.5-1.5M12 17l-1.5 1.5" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const color = active ? "#FFE512" : "rgba(255,255,255,0.7)";
  return (
    <svg width="27" height="27" viewBox="0 0 27 27" fill="none">
      <circle cx="13.5" cy="9" r="5" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M4.5 24c0-5 4-9 9-9s9 4 9 9" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

type NavItem = {
  href: string;
  label: string;
  IconComponent: ((props: { active: boolean }) => React.ReactNode) | null;
  isCenter: boolean;
};

const navItems: NavItem[] = [
  { href: "/home", label: "Home", IconComponent: HomeIcon, isCenter: false },
  { href: "/scan", label: "Scan", IconComponent: ScanIcon, isCenter: false },
  { href: "/transfer/recipient", label: "Transfer", IconComponent: null, isCenter: true },
  { href: "/add-money", label: "Add Money", IconComponent: AddMoneyIcon, isCenter: false },
  { href: "/profile", label: "Profile", IconComponent: ProfileIcon, isCenter: false },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav role="navigation" aria-label="Main" className="shrink-0 z-50 safe-bottom">
      {/* Blue rounded-top navigation bar */}
      <div className="relative bg-[#019cdf] rounded-t-[25px] pt-5 pb-2">
        {/* Yellow accent stripe on top-left — per Pencil design */}
        <div className="absolute top-0 left-[36px] w-[38px] h-[5px] bg-[#FFE512] rounded-b-sm" />

        <div className="flex items-end justify-center px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);

            if (item.isCenter) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label="Transfer"
                  className="flex flex-col items-center -mt-10 mx-2 min-h-[44px] justify-center"
                >
                  {/* Raised yellow circle with white border ring — Pencil design */}
                  <div className="w-[78px] h-[78px] rounded-full bg-white p-[5px] shadow-lg animate-pulse-ring">
                    <div className="w-full h-full rounded-full bg-[#FFE512] flex items-center justify-center border-[5px] border-[#f7eb8b] active:scale-90 transition-transform duration-100">
                      <Image
                        src="/icons/nav-transfer.svg"
                        alt=""
                        width={35}
                        height={35}
                      />
                    </div>
                  </div>
                </Link>
              );
            }

            const IconComp = item.IconComponent!;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-1 px-3 min-w-[60px] min-h-[44px] justify-center nav-item-press",
                  isActive ? "text-white" : "text-white/70"
                )}
              >
                <IconComp active={isActive} />
                <span className={cn(
                  "text-[11.5px]",
                  isActive ? "text-[#FFE512]" : "text-white"
                )}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
