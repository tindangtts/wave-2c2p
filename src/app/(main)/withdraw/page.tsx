"use client";

import { useState } from "react";
import { BackHeader } from "@/components/layout/back-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

const mockRecipients = [
  { id: "1", name: "Aung Min", phone: "+95 912345678", flag: "🇲🇲" },
  { id: "2", name: "Thida Win", phone: "+95 987654321", flag: "🇲🇲" },
];

export default function WithdrawPage() {
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  return (
    <>
      <BackHeader title="Withdrawal" />
      <div className="flex-1 px-4 py-4">
        {/* Recipient selection */}
        <h3 className="text-base font-bold text-foreground mb-3">
          Select Recipient
        </h3>
        <div className="space-y-2 mb-6">
          {mockRecipients.map((r) => (
            <Card
              key={r.id}
              className={`cursor-pointer transition-colors border-2 ${
                selectedRecipient === r.id
                  ? "border-[var(--color-brand-yellow)]"
                  : "border-transparent"
              }`}
              onClick={() => setSelectedRecipient(r.id)}
            >
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{r.flag}</span>
                  <div>
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.phone}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Amount */}
        {selectedRecipient && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Amount (THB)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl font-bold h-14 text-center"
              />
            </div>
            <Button
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full h-12 rounded-full bg-[var(--color-brand-yellow)] text-foreground font-semibold text-base hover:bg-[var(--color-brand-yellow-600)]"
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
