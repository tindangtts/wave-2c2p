"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface FreezeCardToggleProps {
  frozen: boolean;
  onFreezeChange: (frozen: boolean) => void;
}

export function FreezeCardToggle({ frozen, onFreezeChange }: FreezeCardToggleProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSwitchClick = () => {
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    onFreezeChange(!frozen);
    setDialogOpen(false);
  };

  const handleCancel = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-xs font-normal text-foreground">Freeze Card</span>
        <Switch
          checked={frozen}
          onCheckedChange={handleSwitchClick}
          className={frozen ? "data-checked:bg-[#0091EA]" : undefined}
          style={{ width: 44, height: 24 }}
        />
      </div>

      <AlertDialog open={dialogOpen}>
        <AlertDialogContent className="max-w-[340px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {frozen ? "Unfreeze Card?" : "Freeze Card?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {frozen
                ? "Your card will be ready to use again."
                : "Transactions will be declined while your card is frozen."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-[#FFE600] text-foreground hover:bg-[#FFE600]/90"
            >
              {frozen ? "Unfreeze" : "Freeze"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
