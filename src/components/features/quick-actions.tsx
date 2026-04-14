"use client";

import Link from "next/link";
import { ArrowUpRight, Receipt, Users, ArrowDownLeft } from "lucide-react";
import { useTranslations } from "next-intl";

const actions = [
  { href: "/transfer/recipient", labelKey: "quickActions.transfer" as const, icon: ArrowUpRight },
  { href: "/bills", labelKey: "quickActions.bills" as const, icon: Receipt },
  { href: "/referral", labelKey: "quickActions.referral" as const, icon: Users },
  { href: "/withdraw", labelKey: "quickActions.withdrawal" as const, icon: ArrowDownLeft },
];

export function QuickActions() {
  const t = useTranslations("home");

  return (
    <div className="bg-white rounded-xl shadow-sm px-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            aria-label={t(action.labelKey)}
            className="flex flex-col items-center gap-2 min-w-[72px] min-h-[72px] active:scale-95 transition-transform justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-[#0091EA] flex items-center justify-center">
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-[#212121] text-center truncate w-full text-center">
              {t(action.labelKey)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
