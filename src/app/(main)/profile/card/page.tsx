"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { BackHeader } from "@/components/layout/back-header";
import { VisaCardDisplay } from "@/components/features/visa-card-display";
import { CardRevealButton } from "@/components/features/card-reveal-button";
import { FreezeCardToggle } from "@/components/features/freeze-card-toggle";

// Mock card data (D-10)
const MOCK_CARD_NUMBER = "4532019876543210";
const MOCK_EXPIRY = "12/28";
const MOCK_HOLDER_NAME = "LALITA TUNGTRAKUL";

export default function CardPage() {
  const [revealed, setRevealed] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-hide after 10 seconds when revealed
  useEffect(() => {
    if (revealed) {
      timerRef.current = setTimeout(() => {
        setRevealed(false);
        toast("Card details hidden for security.", {
          duration: 3000,
          position: "bottom-center",
        });
      }, 10_000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [revealed]);

  const handleRevealToggle = () => {
    if (frozen) return;
    setRevealed((prev) => !prev);
  };

  const handleFreezeChange = (nextFrozen: boolean) => {
    setFrozen(nextFrozen);
    // If freezing while card is revealed, hide it
    if (nextFrozen && revealed) {
      setRevealed(false);
    }
  };

  const last4 = MOCK_CARD_NUMBER.slice(-4);
  const formattedFull = MOCK_CARD_NUMBER.replace(/(.{4})/g, "$1 ").trim();
  const maskedDisplay = `•••• •••• •••• ${last4}`;
  const cardInfoNumber = revealed ? formattedFull : maskedDisplay;

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <BackHeader title="Visa Card" />

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8">
        {/* Card face */}
        <VisaCardDisplay
          cardNumber={MOCK_CARD_NUMBER}
          holderName={MOCK_HOLDER_NAME}
          expiry={MOCK_EXPIRY}
          revealed={revealed}
          frozen={frozen}
        />

        {/* Card action row */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <CardRevealButton
            revealed={revealed}
            onToggle={handleRevealToggle}
            disabled={frozen}
          />
          <FreezeCardToggle frozen={frozen} onFreezeChange={handleFreezeChange} />
        </div>

        {/* Card info section */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
          {/* Card Number row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-[#767676]">Card Number</span>
            <span className="text-xs font-normal text-foreground">{cardInfoNumber}</span>
          </div>

          <div className="border-t border-border my-3" />

          {/* Expiry row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-[#767676]">Expiry Date</span>
            <span className="text-xs font-normal text-foreground">{MOCK_EXPIRY}</span>
          </div>

          <div className="border-t border-border my-3" />

          {/* Card Status row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-[#767676]">Card Status</span>
            {frozen ? (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ color: "#0091EA", backgroundColor: "#E3F2FD" }}
              >
                Frozen
              </span>
            ) : (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ color: "#00C853", backgroundColor: "#E8F5E9" }}
              >
                Active
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
