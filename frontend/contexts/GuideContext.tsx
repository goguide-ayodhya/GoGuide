"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAllGuides,
  getGuideProfile,
  getGuideById,
  setAvailabilityApi,

  updateGuide,
} from "@/lib/api/guides";

export type GuideUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED" | "SUSPENDED" | "DELETED";
};

export type Guide = {
  id: string;
  userId?: GuideUser | null;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  image?: string;
  experience: number;
  rating: number;
  languages: string[];
  specialities: string[];
  locations: string[];
  price: number;
  duration: string;
  certificates: {
    name: string;
    image: string;
  }[];
  isAvailable: boolean;
  yearsOfExperience?: number;
  totalReviews?: number;
  recentReviews?: {
    rating: number;
    comments: string;
    reviewer?: string;
    date?: string;
  }[];
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
};

type GuideContextType = {
  guides: Guide[];
  setGuides: React.Dispatch<React.SetStateAction<Guide[]>>;
  myGuide: Guide | null;
  loading: boolean;
  activeGuidesCount: number;
  updateGuideData: (id: string, data: any) => Promise<any>;
  setAvailability: (id: string, status: boolean) => Promise<any>;
  // setOnlineStatus: (id: string, status: boolean) => Promise<any>;
};

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export const GuideProvider = ({ children }: any) => {
  const { user } = useAuth();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [myGuide, setMyGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);

  const mapGuide = (guide: any): Guide => {
    const normalizedUserId = guide.userId
      ? {
          id: guide.userId._id || guide.userId.id || "",
          name: guide.userId.name || "Unknown",
          email: guide.userId.email || "",
          avatar: guide.userId.avatar || "",
          phone: guide.userId.phone || "",
          status: guide.userId.status || "ACTIVE",
        }
      : null;

    return {
      id: guide._id || guide.id || "",
      userId: normalizedUserId,
      name: normalizedUserId?.name || guide.name || "Unknown",
      email: normalizedUserId?.email || guide.email || "",
      avatar: normalizedUserId?.avatar || guide.avatar || "",
      image:
        normalizedUserId?.avatar || guide.image || guide.userId?.profileImage || "",
      bio: guide.bio || guide.userId?.bio || "",
      experience: guide.yearsOfExperience || guide.experience || 0,
      rating: guide.averageRating || guide.rating || 0,
      languages: Array.isArray(guide.languages) ? guide.languages : [],
      specialities: guide.speciality
        ? [guide.speciality]
        : Array.isArray(guide.specialities)
        ? guide.specialities
        : [],
      locations: Array.isArray(guide.locations) ? guide.locations : [],
      price: guide.price || 0,
      duration: guide.duration || "4 hours",
      certificates: Array.isArray(guide.certificates) ? guide.certificates : [],
      isAvailable: guide.isAvailable ?? false,
      yearsOfExperience: guide.yearsOfExperience || guide.yearsOfExperience || 0,
      totalReviews: guide.totalReviews || 0,
      verificationStatus: guide.verificationStatus || "PENDING",
    };
  };

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const data = await getAllGuides();
        if (!data) {
          setGuides([]);
          return;
        }

        // Backend already filters for VERIFIED guides with ACTIVE users
        // No need for additional filtering here
        const formattedData = data.map((guide: any) => mapGuide(guide));
        
        // Sort guides: active guides first, then by rating
        const sortedData = formattedData.sort((a: Guide, b: Guide) => {
          // Active guides come first
          if (a.isAvailable && !b.isAvailable) return -1;
          if (!a.isAvailable && b.isAvailable) return 1;
          
          // If both have same availability status, sort by rating (highest first)
          return b.rating - a.rating;
        });
        
        setGuides(sortedData);
      } catch (error) {
        console.error("Failed to fetch guides", error);
        setGuides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  useEffect(() => {
    const fetchMyGuide = async () => {
      if (!user || user.role !== "GUIDE") {
        setMyGuide(null);
        return;
      }

      try {
        const data = await getGuideProfile();
        if (data) setMyGuide(mapGuide(data));
      } catch (error) {
        console.error("Failed to fetch guide profile", error);
        setMyGuide(null);
      }
    };

    fetchMyGuide();
  }, [user]);

  const updateGuideData = async (id: string, data: any) => {
    const updated = await updateGuide(data);

    const formattedData: Guide = {
      id: updated._id,
      userId: updated.userId ? {
        id: updated.userId._id || updated.userId.id || "",
        name: updated.userId.name || "Unknown",
        email: updated.userId.email || "",
        avatar: updated.userId.avatar || "",
        phone: updated.userId.phone || "",
        status: updated.userId.status || "ACTIVE",
      } : null,
      name: updated.userId?.name || updated.name || "Unknown",
      email: updated.userId?.email || updated.email || "",
      image: updated.userId?.avatar || null,
      avatar: updated.userId?.avatar || null,
      experience: updated.yearsOfExperience,
      rating: updated.averageRating,
      languages: updated.languages || [],
      specialities: Array.isArray(updated.specialities) ? updated.specialities : [],
      locations: Array.isArray(updated.locations) ? updated.locations : [],
      price: updated.price,
      duration: updated.duration || "4 hours",
      certificates: Array.isArray(updated.certificates) ? updated.certificates : [],
      isAvailable: updated.isAvailable,
      bio: updated.bio,
      yearsOfExperience: updated.yearsOfExperience,
      totalReviews: updated.totalReviews,
      verificationStatus: updated.verificationStatus as
        | "PENDING"
        | "VERIFIED"
        | "REJECTED",
    };

    setMyGuide(formattedData);
    setGuides((prev) => prev.map((g) => (g.id === id ? formattedData : g)));
    return updated;
  };

  const setAvailability = async (id: string, status: boolean) => {
    const updated = await setAvailabilityApi(status);
    setGuides((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isAvailable: status } : g)),
    );

    setMyGuide((prev) =>
      prev && prev.id === id ? { ...prev, isAvailable: status } : prev,
    );

    return updated;
  };

  // const setOnlineStatus = async (id: string, status: boolean) => {
  //   const updated = await setOnlineStatusApi(status);
  //   setGuides((prev) =>
  //     prev.map((g) => (g.id === id ? { ...g, isOnline: status } : g)),
  //   );

  //   setMyGuide((prev) =>
  //     prev && prev.id === id ? { ...prev, isOnline: status } : prev,
  //   );
  //   return updated;
  // };

  const activeGuidesCount = guides.filter(guide => guide.isAvailable).length;

  return (
    <GuideContext.Provider
      value={{
        guides,
        loading,
        setGuides,
        myGuide,
        activeGuidesCount,
        // getGuide,
        updateGuideData,
        setAvailability,
        // setOnlineStatus,
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
