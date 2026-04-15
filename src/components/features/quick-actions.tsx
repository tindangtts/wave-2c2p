"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

const actions = [
  { href: "/transfer/recipient", labelKey: "quickActions.transfer" as const, icon: "/icons/qa-withdraw.png" },
  { href: "/bills", labelKey: "quickActions.bills" as const, icon: "/icons/qa-bills.png" },
  { href: "/referral", labelKey: "quickActions.referral" as const, icon: "/icons/qa-referral.png" },
  { href: "/withdraw", labelKey: "quickActions.withdrawal" as const, icon: "/icons/qa-withdraw.png" },
  { href: "/history", labelKey: "quickActions.history" as const, icon: "/icons/qa-history.png" },
  { href: "/profile/card", labelKey: "quickActions.visaCard" as const, icon: "/icons/qa-visa-card.png" },
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
          <span className="text-[14px] leading-[1.57] text-[#000000] text-center">
            {t(action.labelKey)}
          </span>
        </Link>
      ))}
    </div>
  );
}
