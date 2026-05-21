"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAllDrivers,
  getDriverById,
  getMyDriverProfile,
  toggleDriverAvailability,
  updateDriverProfile,
} from "@/lib/api/driver";

export type Driver = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  vehicleType?: "CAB" | "BIKE" | "AUTO" | "RIKSHAW" | "VAN" | "OTHER";
  vehicleName?: string;
  vehicleNumber?: string;
  seats?: number;
  location?: string;
  driverPhoto?: string;
  driverLicenseName?: string;
  driverLicenseImage?: string[];
  isAvailable?: boolean;
  averageRating: number;
  totalRides: number;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  driverName: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields from User model
  status: "ACTIVE" | "INACTIVE" | "BLOCKED" | "SUSPENDED" | "DELETED";
  isEmailVerified: boolean;
  isProfileComplete?: boolean;
  profileStep?: number;
  // Legacy fields for compatibility
  images?: string[];
};

type DriverContextType = {
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  myDriver: Driver | null;
  loading: boolean;
  updateDriverData: (id: string, data: any) => Promise<any>;
  setAvailability: (id: string, status: boolean) => Promise<any>;
  fetchDrivers: () => Promise<void>;
  getDriverById: (id: string) => Promise<Driver | null>;
};

const DriverContext = createContext<DriverContextType | undefined>(undefined);

export const DriverProvider = ({ children }: any) => {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [myDriver, setMyDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);

  const mapDriver = (driver: any): Driver => {
    console.log("[DRIVER-CONTEXT] mapDriver input:", driver);
    
    const mapped = {
      id: driver._id || driver.id || "",
      name: driver.userId?.name || driver.driverName || driver.name || "Unknown",
      email: driver.userId?.email || driver.email || "",
      avatar: driver.userId?.avatar || driver.driverPhoto || driver.avatar || "",
      phone: driver.userId?.phone || driver.phone || "",
      bio: driver.userId?.bio || driver.bio || "",
      vehicleType: driver.vehicleType || (driver.userId?.isProfileComplete ? "CAR" : ""),
      vehicleName: driver.vehicleName || "",
      vehicleNumber: driver.vehicleNumber || "",
      seats: driver.seats || 4,
      location: driver.location || "",
      driverPhoto: driver.driverPhoto || "",
      driverLicenseName: driver.driverLicenseName || "",
      driverLicenseImage: driver.driverLicenseImage || [],
      isAvailable: driver.isAvailable ?? false,
      averageRating: driver.averageRating || 0,
      totalRides: driver.totalRides || 0,
      verificationStatus: driver.verificationStatus || "PENDING",
      driverName: driver.driverName || driver.userId?.name || "",
      createdAt: driver.createdAt || "",
      updatedAt: driver.updatedAt || "",
      // User model fields
      status: driver.userId?.status || driver.status || "INACTIVE",
      isEmailVerified: driver.userId?.isEmailVerified || driver.isEmailVerified || false,
      isProfileComplete: driver.userId?.isProfileComplete || driver.isProfileComplete || false,
      profileStep: driver.userId?.profileStep || driver.profileStep || 1,
      // Legacy fields for compatibility
      driverAadhar: driver.driverAadhar || "",
      images: driver.images || driver.driverLicenseImage || [],
      pricePerKm: driver.pricePerKm || 0,
    };
    
    console.log("[DRIVER-CONTEXT] mapDriver output:", mapped);
    return mapped;
  };

  const fetchDrivers = useCallback(async () => {
    try {
      const data = await getAllDrivers();
      if (!data) {
        setDrivers([]);
        return;
      }

      const formattedData = data.map((driver: any) => mapDriver(driver));
      setDrivers(formattedData);
    } catch (error) {
      console.error("Failed to fetch drivers", error);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const fetchMyDriver = useCallback(async () => {
    if (!user || user.role !== "DRIVER") {
      console.log("[DRIVER-CONTEXT] Not a driver user, skipping fetch");
      setMyDriver(null);
      return;
    }

    try {
      console.log("[DRIVER-CONTEXT] Fetching driver profile for user:", user.id);
      const data = await getMyDriverProfile();
      console.log("[DRIVER-CONTEXT] Raw API response:", data);
      
      if (data) {
        const mappedDriver = mapDriver(data);
        console.log("[DRIVER-CONTEXT] Mapped driver data:", mappedDriver);
        setMyDriver(mappedDriver);
      } else {
        console.log("[DRIVER-CONTEXT] No driver profile data received");
        setMyDriver(null);
      }
    } catch (error: any) {
      console.log("[DRIVER-CONTEXT] Driver profile fetch error:", error);
      
      // Handle 404 (profile not found) gracefully - this is expected for new drivers
      if (error.message?.includes("Driver Profile not found") || error.status === 404) {
        console.log("[DRIVER-CONTEXT] Driver profile not found - user hasn't created profile yet");
        setMyDriver(null);
      } else {
        console.error("[DRIVER-CONTEXT] Failed to fetch driver profile", error);
        setMyDriver(null);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchMyDriver();
  }, [fetchMyDriver]);

  const getDriverByIdFn = useCallback(async (id: string): Promise<Driver | null> => {
    try {
      const data = await getDriverById(id);
      return mapDriver(data);
    } catch (error) {
      console.error("Failed to fetch driver by id", error);
      return null;
    }
  }, []);
  const updateDriverData = useCallback(async (id: string, data: any) => {
    const updated = await updateDriverProfile(data);

    const formattedData = mapDriver(updated);

    setMyDriver(formattedData);
    setDrivers((prev) => prev.map((d) => (d.id === id ? formattedData : d)));
    return updated;
  }, []);

  const setAvailability = useCallback(async (id: string, status: boolean) => {
    const updated = await toggleDriverAvailability(status);
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isAvailable: status } : d)),
    );

    setMyDriver((prev) =>
      prev && prev.id === id ? { ...prev, isAvailable: status } : prev,
    );

    return updated;
  }, []);

  return (
    <DriverContext.Provider
      value={{
        drivers,
        loading,
        setDrivers,
        myDriver,
        updateDriverData,
        setAvailability,
        fetchDrivers,
        getDriverById: getDriverByIdFn,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
};

export const useDriver = () => {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error("useDriver must be used within Driver Provider");
  }
  return context;
};
