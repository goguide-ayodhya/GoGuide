"use client";

import { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface CancellationReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
  userRole?: "GUIDE" | "TOURIST" | "DRIVER";
}

const CANCELLATION_REASONS = {
  GUIDE: [
    "Guide is unavailable",
    "Personal emergency",
    "Weather conditions",
    "Insufficient bookings",
    "Technical issues",
    "Other",
  ],
  TOURIST: [
    "Change of plans",
    "Scheduling conflict",
    "Financial reasons",
    "Found alternative",
    "Technical issues",
    "Other",
  ],
  DRIVER: [
    "Vehicle breakdown",
    "Personal emergency",
    "Traffic conditions",
    "Technical issues",
    "Other",
  ],
};

export function CancellationReasonModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  userRole = "GUIDE",
}: CancellationReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const { toast } = useToast();

  const reasons = CANCELLATION_REASONS[userRole] || [];

  const handleConfirm = async () => {
    const finalReason = selectedReason === "Other" ? customReason : selectedReason;

    if (!finalReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please select or enter a cancellation reason",
        variant: "destructive",
      });
      return;
    }

    try {
      await onConfirm(finalReason);
      setSelectedReason("");
      setCustomReason("");
      onClose();
    } catch (error) {
      console.error("Error confirming cancellation:", error);
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setCustomReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription>
            Please provide a reason for cancelling this booking. This helps us improve our service.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Reason for cancellation
            </label>
            <div className="space-y-2">
              {reasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => {
                    setSelectedReason(reason);
                    if (reason !== "Other") {
                      setCustomReason("");
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                    selectedReason === reason
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="text-sm font-medium text-slate-900">
                    {reason}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {selectedReason === "Other" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Please explain
              </label>
              <Textarea
                placeholder="Enter your reason for cancellation..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="min-h-24 resize-none rounded-lg border-slate-200"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg"
          >
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || !selectedReason}
            className="rounded-lg"
          >
            {isLoading ? "Cancelling..." : "Confirm Cancellation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
