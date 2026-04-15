import { ReactNode } from "react";
import { LucideIcon, ChevronRight } from "lucide-react";

interface ProfileMenuItemProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  trailing?: ReactNode;
  trailingBadge?: string;
}

export function ProfileMenuItem({
  icon: Icon,
  label,
  onClick,
  trailing,
  trailingBadge,
}: ProfileMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center h-14 px-4 bg-white hover:bg-secondary transition-colors border-b border-border last:border-b-0"
    >
      {/* Leading icon */}
      <Icon className="w-6 h-6 text-muted-foreground shrink-0 mr-3" />

      {/* Label */}
      <span className="flex-1 text-base font-normal text-foreground text-left">
        {label}
      </span>

      {/* Trailing content */}
      {trailing && <span className="mr-2">{trailing}</span>}

      {trailingBadge && (
        <span className="mr-2 text-xs font-normal text-accent bg-brand-blue-light rounded-full px-2 py-0.5">
          {trailingBadge}
        </span>
      )}

      {/* Chevron */}
      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
    </button>
  );
}
