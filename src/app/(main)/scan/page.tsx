"use client";

import { BackHeader } from "@/components/layout/back-header";
import { ScanLine } from "lucide-react";

export default function ScanPage() {
  return (
    <>
      <BackHeader title="Scan QR" />
      <div className="flex-1 flex flex-col items-center justify-center bg-black/90 px-8">
        <div className="w-64 h-64 border-2 border-white/50 rounded-2xl flex items-center justify-center relative">
          {/* Corner markers */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-wave-yellow rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-wave-yellow rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-wave-yellow rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-wave-yellow rounded-br-lg" />
          <ScanLine className="w-16 h-16 text-white/30" />
        </div>
        <p className="text-white/70 text-sm mt-6 text-center">
          Point your camera at a QR code to scan
        </p>
      </div>
    </>
  );
}
