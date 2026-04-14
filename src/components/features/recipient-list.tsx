"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipientRow } from "@/components/features/recipient-row";
import { toggleFavorite } from "@/hooks/use-recipients";
import type { Recipient } from "@/types";
import type { KeyedMutator } from "swr";

interface RecipientsData {
  recipients: Recipient[];
}

interface RecipientListProps {
  recipients: Recipient[];
  isLoading: boolean;
  onSelect: (r: Recipient) => void;
  selectedId: string | null;
  onEdit: (id: string) => void;
  mutate: KeyedMutator<RecipientsData>;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 min-h-[64px]">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32 rounded-xl" />
        <Skeleton className="h-3 w-20 rounded-xl" />
      </div>
    </div>
  );
}

export function RecipientList({
  recipients,
  isLoading,
  onSelect,
  selectedId,
  onEdit,
  mutate,
}: RecipientListProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Recipient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 200ms debounce for search filter
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  const filtered = debouncedQuery
    ? recipients.filter(
        (r) =>
          r.full_name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          r.transfer_type.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : recipients;

  const favorites = filtered.filter((r) => r.is_favorite);
  const all = [...filtered].sort((a, b) =>
    a.full_name.localeCompare(b.full_name)
  );

  const handleToggleFavorite = useCallback(
    (id: string, isFavorite: boolean) => {
      toggleFavorite(id, isFavorite, mutate);
    },
    [mutate]
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    // Optimistic remove
    await mutate(
      (current) => {
        if (!current) return current;
        return {
          recipients: current.recipients.filter((r) => r.id !== deleteTarget.id),
        };
      },
      { revalidate: false }
    );

    try {
      const res = await fetch(`/api/recipients/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      await mutate();
      toast.success(`${deleteTarget.full_name} removed`);
    } catch {
      // Revert
      await mutate();
      toast.error("Could not delete recipient");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Search bar */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767676]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipients..."
            className="w-full h-11 pl-9 pr-9 rounded-xl bg-secondary border-none text-sm text-foreground placeholder:text-[#767676] focus:outline-none focus:ring-2 focus:ring-[#0091EA]"
            aria-label="Search recipients"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-[#767676]" />
            </button>
          )}
        </div>
      </div>

      {/* Create new recipient */}
      <div className="px-4 pb-2">
        <button
          onClick={() => router.push("/transfer/new-recipient")}
          className="flex items-center gap-2 w-full h-11 text-[#0091EA] text-sm font-medium hover:bg-blue-50 rounded-xl px-2 transition-colors"
          aria-label="Create new recipient"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create new recipient</span>
        </button>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {/* Empty state */}
          {recipients.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 px-8 py-12 text-center">
              <p className="text-base font-bold text-foreground mb-2">
                No recipients yet
              </p>
              <p className="text-sm text-[#595959]">
                Add your first recipient to start sending money.
              </p>
            </div>
          )}

          {/* Search no results */}
          {recipients.length > 0 && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 px-8 py-12 text-center">
              <p className="text-sm text-[#595959]">
                No recipients match &ldquo;{debouncedQuery}&rdquo;
              </p>
            </div>
          )}

          {/* Favorites section */}
          {favorites.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs text-[#595959] font-medium uppercase tracking-wide">
                Favorites
              </p>
              {favorites.map((r) => (
                <RecipientRow
                  key={r.id}
                  recipient={r}
                  isSelected={selectedId === r.id}
                  onSelect={() => onSelect(r)}
                  onToggleFavorite={() =>
                    handleToggleFavorite(r.id, r.is_favorite)
                  }
                  onEdit={() => onEdit(r.id)}
                  onDelete={() => setDeleteTarget(r)}
                />
              ))}
            </div>
          )}

          {/* All recipients section */}
          {all.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs text-[#595959] font-medium uppercase tracking-wide">
                All Recipients
              </p>
              {all.map((r) => (
                <RecipientRow
                  key={r.id}
                  recipient={r}
                  isSelected={selectedId === r.id}
                  onSelect={() => onSelect(r)}
                  onToggleFavorite={() =>
                    handleToggleFavorite(r.id, r.is_favorite)
                  }
                  onEdit={() => onEdit(r.id)}
                  onDelete={() => setDeleteTarget(r)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete AlertDialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTarget?.full_name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteTarget?.full_name}? This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Keep Recipient
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-[#F44336] hover:bg-[#D32F2F] text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
