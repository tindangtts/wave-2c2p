"use client";

import { Snowflake } from "lucide-react";

interface VisaCardDisplayProps {
  cardNumber: string; // full 16 digits (no spaces)
  holderName: string;
  expiry: string; // MM/YY
  revealed: boolean;
  frozen: boolean;
}

export function VisaCardDisplay({
  cardNumber,
  holderName,
  expiry,
  revealed,
  frozen,
}: VisaCardDisplayProps) {
  const last4 = cardNumber.replace(/\s/g, "").slice(-4);
  const formatted = cardNumber.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();

  const displayNumber = revealed
    ? formatted
    : `•••• •••• •••• ${last4}`;

  return (
    <div
      className="relative w-full max-w-[343px] h-[200px] rounded-2xl overflow-hidden mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
      style={{
        background: "linear-gradient(135deg, #1565C0 0%, #0D47A1 50%, #1976D2 100%)",
      }}
    >
      {/* Top row: chip + VISA */}
      <div className="mt-5 mx-5 flex justify-between items-start">
        {/* Chip placeholder */}
        <div className="w-8 h-6 rounded-sm bg-amber-300/80" />
        {/* VISA wordmark */}
        <span className="text-white font-bold italic tracking-wider text-xl w-8 text-right">
          VISA
        </span>
      </div>

      {/* Card number row */}
      <div className="mt-8 mx-5">
        <span className="text-white font-bold tracking-widest text-xl">
          {displayNumber}
        </span>
      </div>

      {/* Bottom row: valid thru + holder name */}
      <div className="absolute bottom-0 left-0 right-0 mx-5 mb-5 flex justify-between items-end">
        <div className="flex flex-col">
          <span
            className="text-[0.625rem] font-normal"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            VALID THRU
          </span>
          <span className="text-xs font-bold text-white">{expiry}</span>
        </div>
        <span className="text-xs font-normal text-white uppercase">
          {holderName}
        </span>
      </div>

      {/* Freeze overlay */}
      {frozen && (
        <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center bg-black/55">
          <Snowflake className="text-white" style={{ width: 32, height: 32 }} />
          <span className="text-white font-bold text-base mt-2">Card Frozen</span>
        </div>
      )}
    </div>
  );
}
