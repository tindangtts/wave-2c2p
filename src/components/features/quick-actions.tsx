"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

const actions = [
  { href: "/bills", labelKey: "quickActions.bills" as const, icon: "/icons/qa-bills.svg" },
  { href: "/referral", labelKey: "quickActions.referral" as const, icon: "/icons/qa-referral.svg" },
  { href: "/withdraw", labelKey: "quickActions.withdrawal" as const, icon: "/icons/qa-withdraw.svg" },
  { href: "/history", labelKey: "quickActions.history" as const, icon: "/icons/qa-history.svg" },
  { href: "/profile/card", labelKey: "quickActions.visaCard" as const, icon: "/icons/qa-visa-card.svg" },
];

export function QuickActions() {
  const t = useTranslations("home");

  return (
    <div className="flex items-start justify-center gap-5">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          aria-label={t(action.labelKey)}
          className="flex flex-col items-center gap-[6px] min-w-[50px] active:scale-95 transition-transform"
        >
          <Image
            src={action.icon}
            alt=""
            width={50}
            height={50}
            className="w-[50px] h-[50px]"
          />
          <span className="text-sm text-[#000000] text-center leading-snug">
            {t(action.labelKey)}
          </span>
        </Link>
      ))}
    </div>
  );
}
