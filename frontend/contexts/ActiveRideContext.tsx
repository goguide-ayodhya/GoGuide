"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { SocketContext } from "./cabs/SocketContext";
import { useAuth } from "./AuthContext";
import { getActiveRide } from "@/lib/api/rides";

export interface ActiveRide {
  _id: string;
  id: string;
  user: {
    _id: string;
    fullname?: {
      firstname: string;
      lastname: string;
    };
    name?: string;
    phone?: string;
    email?: string;
  };
  driver?: {
    _id: string;
    userId?: {
      _id: string;
      fullname?: {
        firstname: string;
        lastname: string;
      };
      name?: string;
      phone?: string;
    };
    driverName?: string;
    vehicleNumber?: string;
    vehicleType?: string;
    vehicleName?: string;
    driverPhoto?: string;
  };
  pickup: string;
  destination: string;
  fare: number;
  status:
    | "pending"
    | "accepted"
    | "ongoing"
    | "payment_pending"
    | "completed"
    | "reviewed"
    | "cancelled";
  paymentStatus?: "unpaid" | "paid";
  paymentConfirmedAt?: string;
  otp?: string;
  createdAt: string;
  updatedAt: string;
}

interface ActiveRideContextType {
  activeRide: ActiveRide | null;
  setActiveRide: (ride: ActiveRide | null) => void;
  isLoading: boolean;
  clearActiveRide: () => void;
  isDriver: boolean;
  isTourist: boolean;
}

const ActiveRideContext = createContext<ActiveRideContextType | undefined>(
  undefined,
);

interface ActiveRideProviderProps {
  children: ReactNode;
}

export const ActiveRideProvider = ({ children }: ActiveRideProviderProps) => {
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);
  const { socket } = useContext(SocketContext);
  const { user } = useAuth();

  const clearActiveRide = () => {
    console.log("[ACTIVE_RIDE_RESTORE] Clearing active ride");
    setActiveRide(null);
  };

  // Restore active ride on mount (production-grade implementation)
  useEffect(() => {
    const restoreActiveRide = async () => {
      if (!user?.id || hasAttemptedRestore) return;

      if (user?.role !== "DRIVER" && user?.role !== "TOURIST") {
        setIsLoading(false);

        return; // Only attempt restore for drivers and tourists
      }

      setHasAttemptedRestore(true);
      setIsLoading(true);

      try {
        console.log(
          "[ACTIVE_RIDE_RESTORE] Starting restoration for user:",
          user.id,
        );

        const restoredRide = await getActiveRide();

        if (restoredRide) {
          console.log(
            `[ACTIVE_RIDE_RESTORE] Successfully restored active ride: ${restoredRide._id}, status: ${restoredRide.status}`,
          );
          setActiveRide(restoredRide);
        } else {
          console.log("[ACTIVE_RIDE_RESTORE] No active ride to restore");
          setActiveRide(null);
        }
      } catch (error) {
        console.error(
          "[ACTIVE_RIDE_RESTORE] Error restoring active ride:",
          error,
        );
        // Continue gracefully - if restoration fails, user can create a new ride
        setActiveRide(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreActiveRide();
  }, [user?.id, hasAttemptedRestore]);

  // Join ride room when activeRide changes or socket reconnects
  useEffect(() => {
    if (!socket || !activeRide?._id) return;

    const joinRoom = () => {
      console.log(`[ACTIVE_RIDE] Emitting join-ride for room: ride_${activeRide._id}`);
      socket.emit("join-ride", { rideId: activeRide._id });
    };

    joinRoom();

    socket.on("connect", joinRoom);
    return () => {
      socket.off("connect", joinRoom);
    };
  }, [socket, activeRide?._id]);

  // Handle ride acceptance as driver
  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleRideAccepted = (rideData: any) => {
      console.log(
        "[ACTIVE_RIDE_RESTORE] Socket: Driver accepted ride:",
        rideData._id,
      );
      // Set active ride for this driver
      setActiveRide(rideData);
    };

    const handleRideStarted = (rideData: any) => {
      console.log("[ACTIVE_RIDE_RESTORE] Socket: Ride started:", rideData._id);
      // Update active ride status
      setActiveRide((prev) => {
        if (prev && (prev.id === rideData._id || prev._id === rideData._id)) {
          return { ...prev, ...rideData, status: "ongoing" };
        }
        return rideData; // Set new ride data if no previous
      });
    };

    const handleRidePaymentPending = (rideData: any) => {
      console.log(
        "[ACTIVE_RIDE_RESTORE] Socket: Ride payment pending:",
        rideData._id,
      );
      // Update active ride status to payment_pending
      setActiveRide((prev) => {
        if (prev && (prev.id === rideData._id || prev._id === rideData._id)) {
          return { ...prev, ...rideData, status: "payment_pending" };
        }
        return rideData;
      });
    };

    const handlePaymentConfirmed = (rideData: any) => {
      console.log(
        "[ACTIVE_RIDE_RESTORE] Socket: Payment confirmed:",
        rideData._id,
      );
      // Update active ride to completed
      setActiveRide((prev) => {
        if (prev && (prev.id === rideData._id || prev._id === rideData._id)) {
          return {
            ...prev,
            ...rideData,
            status: "completed",
            paymentStatus: "paid",
          };
        }
        return rideData;
      });
    };

    const handleRideCompleted = (rideData: any) => {
      console.log("[ACTIVE_RIDE] Socket: Ride completed:", rideData._id);
      // Keep ride in context with completed status for review/summary
      setActiveRide((prev) => {
        if (prev && (prev.id === rideData._id || prev._id === rideData._id)) {
          return { ...prev, ...rideData, status: "completed" };
        }
        return prev;
      });
    };

    // [RIDE_STATE_MACHINE] ride-reviewed: clear context — ride lifecycle complete
    const handleRideReviewed = (rideData: any) => {
      console.log(
        "[ACTIVE_RIDE] Socket: Ride reviewed:",
        rideData._id,
        "— clearing active ride",
      );
      setActiveRide((prev) => {
        if (prev && (prev.id === rideData._id || prev._id === rideData._id)) {
          return null; // Clear immediately
        }
        return prev;
      });
    };

    // [CANCEL_FLOW] ride-cancelled: clear context — ride lifecycle terminated
    const handleRideCancelled = (data: any) => {
      const cancelledRideId = data.rideId || data._id;
      console.log(
        "[ACTIVE_RIDE] Socket: Ride cancelled:",
        cancelledRideId,
        "— clearing active ride",
      );
      setActiveRide((prev) => {
        if (
          prev &&
          (String(prev._id) === String(cancelledRideId) ||
            String(prev.id) === String(cancelledRideId))
        ) {
          return null; // Clear immediately
        }
        return prev;
      });
    };

    socket.on("ride-accepted-driver", handleRideAccepted);
    socket.on("ride-started", handleRideStarted);
    socket.on("ride-started-driver", handleRideStarted);
    socket.on("ride-payment-pending", handleRidePaymentPending);
    socket.on("payment-confirmed", handlePaymentConfirmed);
    socket.on("ride-completed", handleRideCompleted);
    socket.on("ride-reviewed", handleRideReviewed);
    socket.on("ride-cancelled", handleRideCancelled);
    socket.on("ride-ended", handleRidePaymentPending); // Alias for backward compatibility

    return () => {
      socket.off("ride-accepted-driver", handleRideAccepted);
      socket.off("ride-started", handleRideStarted);
      socket.off("ride-started-driver", handleRideStarted);
      socket.off("ride-payment-pending", handleRidePaymentPending);
      socket.off("payment-confirmed", handlePaymentConfirmed);
      socket.off("ride-completed", handleRideCompleted);
      socket.off("ride-reviewed", handleRideReviewed);
      socket.off("ride-cancelled", handleRideCancelled);
      socket.off("ride-ended", handleRidePaymentPending);
    };
  }, [socket, user?.id]);

  // Handle ride confirmation as tourist
  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleRideConfirmed = (rideData: any) => {
      console.log(
        "[ACTIVE_RIDE_RESTORE] Socket: Tourist ride confirmed:",
        rideData._id,
      );
      // Set as active ride for tourist
      if (rideData.user?._id === user?.id || rideData.user === user?.id) {
        setActiveRide(rideData);
      }
    };

    socket.on("ride-confirmed", handleRideConfirmed);

    return () => {
      socket.off("ride-confirmed", handleRideConfirmed);
    };
  }, [socket, user?.id]);

  const isDriver = !!activeRide?.driver;
  const isTourist = !!activeRide?.user && !activeRide?.driver;

  return (
    <ActiveRideContext.Provider
      value={{
        activeRide,
        setActiveRide,
        isLoading,
        clearActiveRide,
        isDriver,
        isTourist,
      }}
    >
      {children}
    </ActiveRideContext.Provider>
  );
};

export const useActiveRide = () => {
  const context = useContext(ActiveRideContext);
  if (!context) {
    throw new Error("useActiveRide must be used within ActiveRideProvider");
  }
  return context;
};
