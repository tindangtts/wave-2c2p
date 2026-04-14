"use client";

import { useState } from "react";
import { BackHeader } from "@/components/layout/back-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

const topUpChannels = [
  { id: "scb", name: "SCB", logo: "/images/banks/scb.png" },
  { id: "kbank", name: "KBank", logo: "/images/banks/kbank.png" },
  { id: "bbl", name: "Bangkok Bank", logo: "/images/banks/bbl.png" },
  { id: "ktb", name: "Krungthai", logo: "/images/banks/ktb.png" },
  { id: "bay", name: "Krungsri", logo: "/images/banks/bay.png" },
  { id: "tmb", name: "TTB", logo: "/images/banks/tmb.png" },
  { id: "7eleven", name: "7-Eleven", logo: "/images/banks/7eleven.png" },
  { id: "cashpay", name: "CashPay", logo: "/images/banks/cashpay.png" },
];

export default function AddMoneyPage() {
  const [amount, setAmount] = useState("");
  const walletBalance = 10000.0;
  const maxTopUp = 25000.0;

  return (
    <>
      <BackHeader title="Add Money" />
      <div className="flex-1 px-4 py-4">
        {/* Balance info */}
        <div className="wave-header-gradient rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-foreground/70">Wallet Balance</p>
              <p className="text-xl font-bold">
                {walletBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}{" "}
              </p>
            </div>
            <div>
              <p className="text-xs text-foreground/70">Max Top-up</p>
              <p className="text-xl font-bold">
                {maxTopUp.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Amount input */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Top-up Amount (THB)
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl font-bold h-14 text-center"
            />
            <span className="text-lg font-semibold text-muted-foreground">
              THB
            </span>
          </div>
        </div>

        {/* Top-up Channels */}
        <div>
          <h3 className="text-base font-bold text-foreground mb-3">
            Top-up Channels
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Generate QR to top-up
          </p>
          <div className="grid grid-cols-4 gap-3">
            {topUpChannels.map((channel) => (
              <button
                key={channel.id}
                className="flex flex-col items-center gap-1 p-2 rounded-xl border border-border hover:border-wave-yellow hover:bg-wave-yellow-light transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    {channel.name.substring(0, 3)}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                  {channel.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-8 space-y-3">
          <Button
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full h-12 rounded-full bg-wave-yellow text-foreground font-semibold text-base hover:bg-wave-yellow-dark"
          >
            Generate QR Code
          </Button>
        </div>
      </div>
    </>
  );
}
