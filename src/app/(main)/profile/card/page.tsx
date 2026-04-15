"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { BackHeader } from "@/components/layout/back-header";
import { VisaCardDisplay } from "@/components/features/visa-card-display";
import { CardRevealButton } from "@/components/features/card-reveal-button";
import { FreezeCardToggle } from "@/components/features/freeze-card-toggle";

interface CardData {
  id: string;
  card_number_masked: string;
  expiry_month: number;
  expiry_year: number;
  balance: number;
  is_frozen: boolean;
  status: string;
}

export default function CardPage() {
  const router = useRouter();
  const t = useTranslations("profile");
  const [revealed, setRevealed] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/cards")
      .then((res) => res.json())
      .then((data) => {
        if (data.cards?.length > 0) {
          const card = data.cards[0] as CardData;
          setCardData(card);
          setFrozen(card.is_frozen);
        }
      })
      .catch(() => {
        toast.error("Failed to load card data.", {
          duration: 3000,
          position: "bottom-center",
        });
      })
      .finally(() => setLoading(false));
  }, []);

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

  // Derive display values from fetched data (with fallbacks during loading)
  const maskedNumber = cardData?.card_number_masked ?? "•••• •••• •••• ••••";
  const expiry = cardData
    ? `${String(cardData.expiry_month).padStart(2, "0")}/${String(cardData.expiry_year).slice(-2)}`
    : "--/--";
  const holderName = "CARD HOLDER";

  // For the card number display: DB only stores masked number.
  // In reveal mode we show the masked number (full number not stored client-side for security).
  const cardInfoNumber = maskedNumber;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-muted">
        <BackHeader title="Visa Card" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse w-[358px] h-[226px] bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <BackHeader title="Visa Card" />

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8">
        {/* Card face */}
        <VisaCardDisplay
          cardNumber={maskedNumber}
          holderName={holderName}
          expiry={expiry}
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
            <span className="text-xs font-normal text-muted-foreground">Card Number</span>
            <span className="text-xs font-normal text-foreground">{cardInfoNumber}</span>
          </div>

          <div className="border-t border-border my-3" />

          {/* Expiry row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-muted-foreground">Expiry Date</span>
            <span className="text-xs font-normal text-foreground">{expiry}</span>
          </div>

          <div className="border-t border-border my-3" />

          {/* Card Status row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-muted-foreground">Card Status</span>
            {frozen ? (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-accent bg-brand-blue-light"
              >
                Frozen
              </span>
            ) : (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-wave-success bg-[#E8F5E9]"
              >
                Active
              </span>
            )}
          </div>
        </div>

        {/* Request Card CTA */}
        <button
          onClick={() => router.push("/profile/card/request")}
          className="mt-6 w-full h-12 rounded-full bg-primary text-foreground font-semibold text-sm hover:bg-primary/90 active:bg-primary/80 transition-colors"
        >
          {t("card.request.cardRequestCta")}
        </button>
      </div>
    </div>
  );
}
