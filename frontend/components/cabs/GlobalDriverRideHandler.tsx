"use client";

import { useContext, useEffect, useState } from "react";
import { useActiveRide } from "@/contexts/ActiveRideContext";
import { SocketContext } from "@/contexts/cabs/SocketContext";
import { useActiveRideRestore } from "@/hooks/useActiveRideRestore";
import DriverAssignedSheet from "@/components/cabs/DriverAssignedSheet";
import DriverCompletionScreen from "@/components/cabs/DriverCompletionScreen";

export default function GlobalDriverRideHandler() {
  const { activeRide, clearActiveRide, setActiveRide } = useActiveRide();
  const { socket } = useContext(SocketContext);
  const [showActiveRideSheet, setShowActiveRideSheet] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [completionRide, setCompletionRide] = useState<any>(null);

  useActiveRideRestore({
    onAccepted: (ride) => {
      console.log("[ACTIVE_RIDE_RESTORE] Driver: Ride accepted - showing assignment sheet");
      setShowActiveRideSheet(true);
      if (ride) {
        setActiveRide(ride);
      }
    },
    onOngoing: (ride) => {
      console.log("[ACTIVE_RIDE_RESTORE] Driver: Ride ongoing - showing assignment sheet");
      setShowActiveRideSheet(true);
      if (ride) {
        setActiveRide(ride);
      }
    },
    onPaymentPending: (ride) => {
      console.log("[ACTIVE_RIDE_RESTORE] Driver: Payment pending - showing assignment sheet");
      setShowActiveRideSheet(true);
      if (ride) {
        setActiveRide(ride);
      }
    },
  });

  useEffect(() => {
    if (!socket) return;

    const handlePaymentConfirmed = (rideData: any) => {
      console.log("[DRIVER] Payment confirmed for ride:", rideData._id);
      setShowActiveRideSheet(false);
      setCompletionRide(rideData);
      setShowCompletionScreen(true);

      setTimeout(() => {
        clearActiveRide();
      }, 3000);
    };

    socket.on("payment-confirmed", handlePaymentConfirmed);

    return () => {
      socket.off("payment-confirmed", handlePaymentConfirmed);
    };
  }, [socket, clearActiveRide]);

  return (
    <>
      {showActiveRideSheet && activeRide && (
        <DriverAssignedSheet
          ride={activeRide}
          onClose={() => {
            setShowActiveRideSheet(false);
            if (clearActiveRide) {
              clearActiveRide();
            }
          }}
          isDriver={true}
        />
      )}

      {showCompletionScreen && completionRide && (
        <DriverCompletionScreen
          ride={completionRide}
          onComplete={() => {
            setShowCompletionScreen(false);
            setCompletionRide(null);
          }}
        />
      )}
    </>
  );
}
