"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface InsuranceDialogProps {
  open: boolean;
  insuranceAmount: number;
  onTakeInsurance: () => void;
  onDeclineInsurance: () => void;
  handNumber?: number; // Optional hand number for multi-hand display
}

export function InsuranceDialog({
  open,
  insuranceAmount,
  onTakeInsurance,
  onDeclineInsurance,
  handNumber,
}: InsuranceDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Insurance{handNumber ? ` - Hand ${handNumber}` : ""}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            The dealer is showing an Ace. Would you like to take insurance
            {handNumber ? ` for Hand ${handNumber}` : ""} for ${insuranceAmount}
            ?
            <br />
            <br />
            Insurance pays 2:1 if the dealer has blackjack.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDeclineInsurance}>
            No Thanks
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onTakeInsurance}
            className="bg-green-600 hover:bg-green-700"
          >
            Take Insurance (${insuranceAmount})
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
