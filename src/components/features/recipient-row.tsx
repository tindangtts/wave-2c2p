"use client";

import { Star, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Recipient } from "@/types";

interface RecipientRowProps {
  recipient: Recipient;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TRANSFER_TYPE_LABELS: Record<string, string> = {
  wave_agent: "Wave Agent",
  wave_app: "Wave App",
  bank_transfer: "Bank Transfer",
  cash_pickup: "Cash Pickup",
};

export function RecipientRow({
  recipient,
  isSelected,
  onSelect,
  onToggleFavorite,
  onEdit,
  onDelete,
}: RecipientRowProps) {
  const initial = (recipient.first_name || recipient.full_name || "?")
    .charAt(0)
    .toUpperCase();

  const transferTypeLabel =
    TRANSFER_TYPE_LABELS[recipient.transfer_type] ?? recipient.transfer_type;

  return (
    <div
      className={[
        "flex items-center gap-3 px-4 py-3 min-h-[64px] border-b border-gray-100 last:border-b-0 active:bg-gray-50 transition-colors cursor-pointer",
        isSelected ? "border-l-[3px] border-l-primary bg-primary/10" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Yellow avatar circle */}
      <div
        className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0"
      >
        <span className="text-xl font-bold text-foreground">{initial}</span>
      </div>

      {/* Name + type */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {/* Favorite star */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="p-[14px] -m-[14px] shrink-0"
            aria-label={
              recipient.is_favorite
                ? `Remove ${recipient.full_name} from favorites`
                : `Add ${recipient.full_name} to favorites`
            }
          >
            <Star
              className="w-4 h-4"
              fill={recipient.is_favorite ? "var(--color-accent)" : "none"}
              stroke={recipient.is_favorite ? "var(--color-accent)" : "#C0C0C0"}
            />
          </button>
          <p className="text-base font-bold text-foreground truncate">
            {recipient.full_name}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{transferTypeLabel}</p>
      </div>

      {/* Kebab menu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center w-11 h-11 shrink-0 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={`More options for ${recipient.full_name}`}
        >
          <MoreVertical className="w-6 h-6 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-600 focus:text-red-600"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
