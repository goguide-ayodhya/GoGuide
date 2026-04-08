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
  vehicleType: string;
  vehicleName: string;
  vehicleNumber: string;
  pricePerKm: number;
  seats: number;
  images?: string[];
  isAvailable: boolean;
  averageRating: number;
  totalRides: number;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  driverAadhar: string;
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

  const mapDriver = (driver: any): Driver => ({
    id: driver._id || driver.id || "",
    name: driver.userId?.name || driver.name || "Unknown",
    email: driver.userId?.email || driver.email || "",
    avatar: driver.userId?.avatar || driver.avatar || "",
    phone: driver.userId?.phone || driver.phone || "",
    vehicleType: driver.vehicleType || "CAR",
    vehicleName: driver.vehicleName || "",
    vehicleNumber: driver.vehicleNumber || "",
    pricePerKm: driver.pricePerKm || 0,
    seats: driver.seats || 4,
    images: driver.images || [],
    isAvailable: driver.isAvailable ?? false,
    averageRating: driver.averageRating || 0,
    totalRides: driver.totalRides || 0,
    verificationStatus: driver.verificationStatus || "PENDING",
    driverAadhar: driver.driverAadhar || "",
  });

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
      setMyDriver(null);
      return;
    }

    try {
      const data = await getMyDriverProfile();
      if (data) setMyDriver(mapDriver(data));
    } catch (error) {
      console.error("Failed to fetch driver profile", error);
      setMyDriver(null);
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
