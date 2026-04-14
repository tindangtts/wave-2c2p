"use client";

import Link from "next/link";
import {
  Receipt,
  Users,
  Wallet,
  Clock,
  CreditCard,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

const primaryActions = [
  { href: "/bills", label: "Bills", icon: Receipt, color: "bg-blue-100 text-blue-600" },
  { href: "/profile/refer", label: "Referral", icon: Users, color: "bg-green-100 text-green-600" },
  { href: "/withdraw", label: "Withdrawal", icon: Wallet, color: "bg-purple-100 text-purple-600" },
  { href: "/history", label: "History", icon: Clock, color: "bg-orange-100 text-orange-600" },
  { href: "/card", label: "Visa Card", icon: CreditCard, color: "bg-cyan-100 text-cyan-600" },
];

export function QuickActions() {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-4 wave-card-shadow">
      <div className="grid grid-cols-5 gap-2">
        {primaryActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center gap-1.5"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center ${action.color}`}
            >
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-foreground text-center">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      <button
        onClick={() => setShowMore(!showMore)}
        className="w-full flex items-center justify-center gap-1 mt-3 text-sm text-muted-foreground"
      >
        <span>More Features</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${showMore ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}
