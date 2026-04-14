"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, ScanLine, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", label: "Home", icon: Home, isCenter: false },
  { href: "/scan", label: "Scan", icon: ScanLine, isCenter: false },
  { href: "/add-money", label: "Add Money", icon: Plus, isCenter: true },
  { href: "/profile", label: "Profile", icon: User, isCenter: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-50 bg-white wave-bottom-nav-shadow safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 -mt-5"
              >
                <div className="w-14 h-14 rounded-full bg-wave-yellow flex items-center justify-center shadow-md">
                  <Icon className="w-7 h-7 text-foreground" />
                </div>
                <span className="text-[10px] font-medium text-foreground">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 px-3 min-w-[64px]",
                isActive ? "text-wave-blue" : "text-muted-foreground"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
