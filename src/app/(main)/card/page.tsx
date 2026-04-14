"use client";

import { useState } from "react";
import { BackHeader } from "@/components/layout/back-header";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Snowflake } from "lucide-react";

export default function CardPage() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <BackHeader title="Visa Card" />
      <div className="flex-1 px-4 py-4">
        {/* Card Display */}
        <div className="relative w-full aspect-[1.6/1] rounded-2xl overflow-hidden wave-header-gradient p-6 flex flex-col justify-between mb-6">
          {/* Card chip & network */}
          <div className="flex items-center justify-between">
            <div className="w-10 h-8 bg-yellow-300/60 rounded-md" />
            <span className="text-lg font-bold text-foreground/80">VISA</span>
          </div>

          {/* Card number */}
          <div>
            <p className="text-lg font-mono tracking-widest text-foreground">
              {showDetails ? "4532 1234 5678 9012" : "•••• •••• •••• 9012"}
            </p>
          </div>

          {/* Card holder & expiry */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[0.625rem] text-foreground/60">CARD HOLDER</p>
              <p className="text-sm font-semibold text-foreground">
                LALITA TUNGTRAKUL
              </p>
            </div>
            <div className="text-right">
              <p className="text-[0.625rem] text-foreground/60">EXPIRES</p>
              <p className="text-sm font-semibold text-foreground">
                {showDetails ? "12/26" : "••/••"}
              </p>
            </div>
          </div>

          {/* 2C2P Wave branding */}
          <div className="absolute top-3 right-4 opacity-30">
            <span className="text-xs font-bold">2C2P WAVE</span>
          </div>
        </div>

        {/* Card Actions */}
        <div className="flex gap-3 mb-6">
          <Button
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 rounded-full"
          >
            {showDetails ? (
              <EyeOff className="w-4 h-4 mr-2" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            {showDetails ? "Hide" : "Show"} Details
          </Button>
          <Button variant="outline" className="flex-1 rounded-full">
            <Snowflake className="w-4 h-4 mr-2" />
            Freeze Card
          </Button>
        </div>

        {/* Card Balance */}
        <div className="bg-muted rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Card Balance</p>
          <p className="text-2xl font-bold mt-1">5,000.00 THB</p>
        </div>
      </div>
    </>
  );
}
