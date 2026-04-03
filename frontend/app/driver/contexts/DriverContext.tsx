"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAllDrivers,
  getMyDriver,
  setDriverAvailabilityApi,
  setDriverOnlineStatusApi,
  updateDriver,
} from "@/app/driver/lib/api/drivers";

export type Driver = {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  image?: string;
  experience: number;
  rating: number;
  languages: string[];
  specialities?: string[];
  price: number;
  isAvailable: boolean;
  isOnline: boolean;
  certification?: string;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  yearsOfExperience?: number;
  hourlyRate: number;
  totalReviews?: number;
};

type DriverContextType = {
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  myDriver: Driver | null;
  loading: boolean;
  updateDriverData: (id: string, data: any) => Promise<any>;
  setAvailability: (id: string, status: boolean) => Promise<any>;
  setOnlineStatus: (id: string, status: boolean) => Promise<any>;
};

const DriverContext = createContext<DriverContextType | undefined>(undefined);

export const DriverProvider = ({ children }: any) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [myDriver, setMyDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      const data = await getAllDrivers();
      if (!data) {
        setLoading(false);
        return;
      }
      const formattedData = data.map((driver: any) => ({
        id: driver._id,
        name: driver.userId?.name,
        email: driver.userId?.email || "",
        avatar: driver.userId?.avatar,
        image: driver.userId?.avatar || driver.userId?.profileImage,
        experience: driver.yearsOfExperience,
        rating: driver.averageRating,
        languages: driver.languages,
        specialities: driver.speciality ? [driver.speciality] : [],
        price: driver.hourlyRate,
        isOnline: driver.isOnline,
      }));
      setDrivers(formattedData);
      setLoading(false);
    };
    fetchDrivers();
  }, []);

  useEffect(() => {
    const fetchMyDriver = async () => {
      try {
        const data = await getMyDriver();
        if (!data) {
          return;
        }
        const formattedData = {
          id: data._id,
          name: data.userId?.name,
          email: data.userId?.email || "",
          avatar: data.userId?.avatar,
          image: data.userId?.avatar || data.userId?.profileImage,
          experience: data.yearsOfExperience,
          rating: data.averageRating,
          languages: data.languages,
          specialities: data.speciality ? [data.speciality] : [],
          price: data.hourlyRate,
          isAvailable: data.isAvailable,
          isOnline: data.isOnline,
          hourlyRate: data.hourlyRate,
          verificationStatus: data.verificationStatus,
        };
        setMyDriver(formattedData);
      } catch (error) {
        console.log("Error fetching myDriver");
      }
      return await getMyDriver();
    };
    fetchMyDriver();
  }, []);

  const updateDriverData = async (id: string, data: any) => {
    const updated = await updateDriver(id, data);

    const formattedData = {
      id: updated._id,
      name: updated.userId?.name,
      email: updated.userId?.email || "",
      image: updated.userId?.avatar || null,
      experience: updated.yearsOfExperience,
      rating: updated.averageRating,
      languages: updated.languages || [],
      specialities: updated.speciality ? [updated.speciality] : [],
      price: updated.hourlyRate,
      isAvailable: updated.isAvailable,
      isOnline: updated.isOnline,
      bio: updated.bio,
      certification: updated.certification,
      hourlyRate: updated.hourlyRate,
      totalReviews: updated.totalReviews,
      verificationStatus: updated.verificationStatus,
    };

    setMyDriver(formattedData);
    setDrivers((prev) => prev.map((g) => (g.id === id ? formattedData : g)));
    return updated;
  };

  const setAvailability = async (id: string, status: boolean) => {
    const updated = await setDriverAvailabilityApi(id, status);
    setDrivers((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isAvailable: status } : g)),
    );

    setMyDriver((prev) =>
      prev && prev.id === id ? { ...prev, isAvailable: status } : prev,
    );

    return updated;
  };

  const setOnlineStatus = async (id: string, status: boolean) => {
    const updated = await setDriverOnlineStatusApi(id, status);
    setDrivers((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isOnline: status } : g)),
    );

    setMyDriver((prev) =>
      prev && prev.id === id ? { ...prev, isOnline: status } : prev,
    );
    return updated;
  };

  return (
    <DriverContext.Provider
      value={{
        drivers,
        loading,
        setDrivers,
        myDriver,
        updateDriverData,
        setAvailability,
        setOnlineStatus,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
};

export const useDriver = () => {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error("useDriver must be used within DriverProvider");
  }
  return context;
};
