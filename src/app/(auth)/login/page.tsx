"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const countryCodes = [
  { code: "+66", country: "TH", flag: "🇹🇭" },
  { code: "+95", country: "MM", flag: "🇲🇲" },
];

export default function LoginPage() {
  const router = useRouter();
  const [countryCode, setCountryCode] = useState("+66");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setIsLoading(true);
    // Mock: skip actual OTP, go directly to home
    setTimeout(() => {
      router.push("/home");
    }, 500);
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Status bar */}
      <div className="wave-status-bar h-11 safe-top" />

      <div className="flex-1 px-6 pt-12 pb-8 flex flex-col">
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Sign in to your account to use the application
        </p>

        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground mb-1.5">
              Phone Number
            </Label>
            <div className="flex gap-2">
              <Select value={countryCode} onValueChange={(v) => v && setCountryCode(v)}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          {phone.length > 0 && (
            <p className="text-xs text-wave-error">
              {/* Validation message placeholder */}
            </p>
          )}
        </div>

        <div className="mt-8 space-y-3">
          <Button
            onClick={handleLogin}
            disabled={phone.length < 9 || isLoading}
            className="w-full h-12 rounded-full bg-wave-yellow text-foreground font-semibold text-base hover:bg-wave-yellow-dark disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Login / Register"}
          </Button>

          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-5 h-5 rounded-full bg-wave-yellow flex items-center justify-center">
              <span className="text-[10px] font-bold">?</span>
            </div>
            <span className="text-xs text-muted-foreground">Need help?</span>
          </div>
        </div>
      </div>
    </div>
  );
}
