"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface WalletCardProps {
  name: string;
  balance: number;
  walletId: string;
}

export function WalletCard({ name, balance, walletId }: WalletCardProps) {
  const [showBalance, setShowBalance] = useState(true);

  const formattedBalance = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);

  return (
    <div className="flex flex-col gap-3">
      {/* User info row */}
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12 border-2 border-white">
          <AvatarFallback className="bg-wave-blue text-white text-lg font-semibold">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground truncate">{name}</h2>
        </div>
      </div>

      {/* Balance row */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-wave-blue flex items-center justify-center">
          <span className="text-white text-xs font-bold">$</span>
        </div>
        <span className="text-2xl font-bold text-foreground">
          {showBalance ? formattedBalance : "••••••"} THB
        </span>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="p-1 rounded-full hover:bg-black/5"
          aria-label={showBalance ? "Hide balance" : "Show balance"}
        >
          {showBalance ? (
            <Eye className="w-5 h-5 text-muted-foreground" />
          ) : (
            <EyeOff className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Wallet ID */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Wallet ID:{walletId}</span>
        <button
          onClick={() => navigator.clipboard.writeText(walletId)}
          className="p-0.5 rounded hover:bg-black/5"
          aria-label="Copy wallet ID"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
