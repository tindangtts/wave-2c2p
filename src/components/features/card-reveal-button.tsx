"use client";

import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CardRevealButtonProps {
  revealed: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function CardRevealButton({
  revealed,
  onToggle,
  disabled,
}: CardRevealButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onToggle}
      disabled={disabled}
      className="rounded-full h-10 px-4 border-border bg-white text-foreground flex items-center gap-2"
    >
      {revealed ? (
        <EyeOff style={{ width: 16, height: 16 }} />
      ) : (
        <Eye style={{ width: 16, height: 16 }} />
      )}
      <span className="text-xs font-normal">
        {revealed ? "Hide Card Details" : "Show Card Details"}
      </span>
    </Button>
  );
}
