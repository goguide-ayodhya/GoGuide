import { useEffect, useRef, useContext } from "react";
import { useActiveRide } from "@/contexts/ActiveRideContext";
import { SocketContext } from "@/contexts/cabs/SocketContext";
import { useAuth } from "@/contexts/AuthContext";

interface UseActiveRideRestoreOptions {
  onRestored?: (ride: any) => void;
  onSearching?: () => void;
  onAccepted?: (ride: any) => void;
  onOngoing?: (ride: any) => void;
  onPaymentPending?: (ride: any) => void;
  onCompleted?: (ride: any) => void;
}

/**
 * Production-grade hook for restoring active rides after page refresh.
 * Automatically restores the UI to the correct state based on ride status.
 *
 * FIX: Uses a hasRestored ref so restoration runs exactly ONCE per mount,
 * preventing infinite loops caused by options object changing on every render.
 */
export const useActiveRideRestore = (options: UseActiveRideRestoreOptions = {}) => {
  const { activeRide, isLoading } = useActiveRide();
  const { socket } = useContext(SocketContext);
  const { user } = useAuth();

  // [RESTORE_FLOW] Track whether we've already triggered the restore callback
  // Using a ref (not state) prevents triggering another render cycle
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    // Wait for context to finish loading
    if (isLoading) return;

    // No active ride — nothing to restore
    if (!activeRide) {
      hasRestoredRef.current = false; // reset so next ride can be restored
      return;
    }

    // Already triggered for this ride — skip
    if (hasRestoredRef.current) return;

    hasRestoredRef.current = true;

    console.log(
      `[RESTORE_FLOW] Restoring UI for ride: ${activeRide._id}, status: ${activeRide.status}`
    );

    // Trigger the appropriate callback based on ride status
    switch (activeRide.status) {
      case "pending":
        console.log("[RESTORE_FLOW] Status: SEARCHING → showing LookingForDriver");
        options.onSearching?.();
        break;

      case "accepted":
        console.log("[RESTORE_FLOW] Status: ACCEPTED → showing WaitingForDriver");
        options.onAccepted?.(activeRide);
        break;

      case "ongoing":
        console.log("[RESTORE_FLOW] Status: ONGOING → showing Riding + LiveTracking");
        options.onOngoing?.(activeRide);
        break;

      case "payment_pending":
        console.log("[RESTORE_FLOW] Status: PAYMENT_PENDING → showing PaymentConfirmation");
        options.onPaymentPending?.(activeRide);
        break;

      case "completed":
        console.log("[RESTORE_FLOW] Status: COMPLETED → showing ReviewPopup (payment already done)");
        options.onCompleted?.(activeRide);
        break;

      case "reviewed":
      case "cancelled":
        // These should never be restored — log and do nothing
        console.log(`[RESTORE_FLOW] Status: ${activeRide.status.toUpperCase()} — no restoration needed`);
        break;

      default:
        console.warn(`[RESTORE_FLOW] Unknown ride status: ${activeRide.status}`);
    }

    // Re-join socket room after restore so events continue flowing
    if (socket && user?.id) {
      console.log(`[RESTORE_FLOW] Re-joining socket room for ${user.role}:`, user.id);
      socket.emit("join", { userType: user.role === "DRIVER" ? "driver" : "user", userId: user.id });
    }

    options.onRestored?.(activeRide);
  }, [activeRide?._id, activeRide?.status, isLoading, socket]);
  // NOTE: Intentionally NOT including `options` in deps — it changes every render (object literal).
  // hasRestoredRef prevents double-firing so this is safe.

  return {
    activeRide,
    isLoading,
    hasActiveRide: !!activeRide,
  };
};
