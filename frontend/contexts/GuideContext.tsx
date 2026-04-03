"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAllGuides,
  getMyGuide,
  getGuideById,
  setAvailabilityApi,
  setOnlineStatusApi,
  updateGuide,
} from "@/lib/api/guides";

export type Guide = {
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
  yearsOfExperience?: number;
  hourlyRate: number;
  totalReviews?: number;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
};

type GuideContextType = {
  guides: Guide[];
  setGuides: React.Dispatch<React.SetStateAction<Guide[]>>;
  myGuide: Guide | null;
  loading: boolean;
  updateGuideData: (id: string, data: any) => Promise<any>;
  setAvailability: (id: string, status: boolean) => Promise<any>;
  setOnlineStatus: (id: string, status: boolean) => Promise<any>;
};

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export const GuideProvider = ({ children }: any) => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [myGuide, setMyGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      const data = await getAllGuides();
      if (!data) {
        setLoading(false);
        return;
      }
      const formattedData = data.map((guide: any) => ({
        id: guide._id,
        name: guide.userId?.name,
        email: guide.userId?.email || "",
        avatar: guide.userId?.avatar,
        image: guide.userId?.avatar || guide.userId?.profileImage,
        experience: guide.yearsOfExperience,
        rating: guide.averageRating,
        languages: guide.languages,
        specialities: guide.speciality ? [guide.speciality] : [],
        price: guide.hourlyRate,
        // isAvailable: guide.isAvailable,
        isOnline: guide.isOnline,
      }));
      setGuides(formattedData);
      setLoading(false);
    };
    fetchGuides();
  }, []);

  useEffect(() => {
    const fetchMyGuide = async () => {
      try {
        const data = await getMyGuide();
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
        setMyGuide(formattedData);
      } catch (error) {
        console.log("Error fetching myGuide");
      }
      return await getMyGuide();
    };
    fetchMyGuide();
  }, []);

  const getGuide = async (id: string) => {
    return await getGuideById(id);
  };

  const updateGuideData = async (id: string, data: any) => {
    const updated = await updateGuide(id, data);

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
      verificationStatus: updated.verificationStatus as 'PENDING' | 'VERIFIED' | 'REJECTED',
    };

    setMyGuide(formattedData);
    setGuides((prev) => prev.map((g) => (g.id === id ? formattedData : g)));
    return updated;
  };

  const setAvailability = async (id: string, status: boolean) => {
    const updated = await setAvailabilityApi(id, status);
    setGuides((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isAvailable: status } : g)),
    );

    setMyGuide((prev) =>
      prev && prev.id === id ? { ...prev, isAvailable: status } : prev,
    );

    return updated;
  };

  const setOnlineStatus = async (id: string, status: boolean) => {
    const updated = await setOnlineStatusApi(id, status);
    setGuides((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isOnline: status } : g)),
    );

    setMyGuide((prev) =>
      prev && prev.id === id ? { ...prev, isOnline: status } : prev,
    );
    return updated;
  };

  return (
    <GuideContext.Provider
      value={{
        guides,
        loading,
        setGuides,
        myGuide,
        // getGuide,
        updateGuideData,
        setAvailability,
        setOnlineStatus,
      }}
    >
      {children}
    </GuideContext.Provider>
  );
};

export const useGuide = () => {
  const context = useContext(GuideContext);
  if (!context) {
    throw new Error("useGuide must be used within Guide Provider");
  }
  return context;
};
