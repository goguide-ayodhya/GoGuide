"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SocketContext } from "./cabs/SocketContext";
import { useAuth } from "./AuthContext";

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
  status: "accepted" | "ongoing" | "completed" | "cancelled";
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

const ActiveRideContext = createContext<ActiveRideContextType | undefined>(undefined);

export const useActiveRide = () => {
  const context = useContext(ActiveRideContext);
  if (!context) {
    throw new Error("useActiveRide must be used within ActiveRideProvider");
  }
  return context;
};

interface ActiveRideProviderProps {
  children: ReactNode;
}

export const ActiveRideProvider = ({ children }: ActiveRideProviderProps) => {
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useContext(SocketContext);
  const { user } = useAuth();

  const clearActiveRide = () => {
    console.log("[ACTIVE RIDE] Clearing active ride");
    setActiveRide(null);
  };

  // Handle ride acceptance as driver
  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleRideAccepted = (rideData: any) => {
      console.log("[ACTIVE RIDE] Driver accepted ride:", rideData);
      // Set active ride for this driver
      setActiveRide(rideData);
    };

    const handleRideStarted = (rideData: any) => {
      console.log("[ACTIVE RIDE] Ride started:", rideData);
      // Update active ride status
      setActiveRide(prev => {
        if (prev && (prev.id === rideData._id || prev._id === rideData._id)) {
          return { ...prev, ...rideData, status: "ongoing" };
        }
        return rideData; // Set new ride data if no previous
      });
    };

    const handleRideCompleted = (rideData: any) => {
      console.log("[ACTIVE RIDE] Ride completed:", rideData);
      // Clear active ride when completed
      clearActiveRide();
    };

    socket.on("ride-accepted-driver", handleRideAccepted);
    socket.on("ride-started", handleRideStarted);
    socket.on("ride-ended", handleRideCompleted);

    return () => {
      socket.off("ride-accepted-driver", handleRideAccepted);
      socket.off("ride-started", handleRideStarted);
      socket.off("ride-ended", handleRideCompleted);
    };
  }, [socket, user?.id]);

  // Handle ride confirmation as tourist
  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleRideConfirmed = (rideData: any) => {
      console.log("[ACTIVE RIDE] Tourist ride confirmed:", rideData);
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
