"use client";

import { useState } from "react";
import { BackHeader } from "@/components/layout/back-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightLeft, ChevronRight } from "lucide-react";

export default function TransferPage() {
  const [amount, setAmount] = useState("");
  const exchangeRate = 58.148;
  const convertedAmount = amount
    ? (parseFloat(amount) * exchangeRate).toFixed(2)
    : "0.00";

  return (
    <>
      <BackHeader title="Send Money" />
      <div className="flex-1 px-4 py-4">
        {/* Amount Card */}
        <Card className="mb-4 wave-card-shadow border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="text-sm font-medium">🇹🇭 THB</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  Converted Amount
                </p>
                <p className="text-sm font-medium">🇲🇲 MMK</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="1,000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl font-bold text-center h-14 flex-1"
              />
              <ArrowRightLeft className="w-6 h-6 text-muted-foreground shrink-0" />
              <div className="text-2xl font-bold text-right flex-1 text-wave-blue">
                {parseFloat(convertedAmount).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-wave-blue font-medium">
                Rate: 1 THB = {exchangeRate} MMK
              </p>
              <p className="text-xs text-wave-error">
                100,000 MMK = 751.88 THB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Receiving Channels */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold">Receiving Channels</h3>
            <span className="text-sm font-medium text-wave-blue">
              Instant Receive
            </span>
          </div>

          {[
            {
              name: "Wave Agent",
              amount: convertedAmount,
              fee: "10.00",
              icon: "🏪",
            },
            {
              name: "Wave App",
              amount: convertedAmount,
              fee: "10.00",
              icon: "📱",
            },
          ].map((channel) => (
            <Card
              key={channel.name}
              className="mb-3 wave-card-shadow border-0 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{channel.icon}</span>
                  <div>
                    <p className="text-sm font-semibold">{channel.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {parseFloat(channel.amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      MMK
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Fees: {channel.fee} THB
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
