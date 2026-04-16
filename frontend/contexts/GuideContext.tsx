"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAllGuides,
  getGuideProfile,
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
  recentReviews?: {
    rating: number;
    comment: string;
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
  setOnlineStatus: (id: string, status: boolean) => Promise<any>;
};

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export const GuideProvider = ({ children }: any) => {
  const { user } = useAuth();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [myGuide, setMyGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);

  const mapGuide = (guide: any): Guide => ({
    id: guide._id || guide.id || "",
    name: guide.userId?.name || guide.name || "Unknown",
    email: guide.userId?.email || guide.email || "",
    avatar: guide.userId?.avatar || guide.avatar || "",
    image:
      guide.userId?.avatar || guide.image || guide.userId?.profileImage || "",
    bio: guide.bio || guide.userId?.bio || "",
    experience: guide.yearsOfExperience || guide.experience || 0,
    rating: guide.averageRating || guide.rating || 0,
    languages: Array.isArray(guide.languages) ? guide.languages : [],
    specialities: guide.speciality
      ? [guide.speciality]
      : Array.isArray(guide.specialities)
      ? guide.specialities
      : [],
    price: guide.hourlyRate || guide.price || 0,
    isAvailable: guide.isAvailable ?? false,
    isOnline: guide.isOnline ?? false,
    certification: guide.certification || "",
    yearsOfExperience: guide.yearsOfExperience || guide.yearsOfExperience || 0,
    hourlyRate: guide.hourlyRate || guide.price || 0,
    totalReviews: guide.totalReviews || 0,
    verificationStatus:
      guide.verificationStatus || "PENDING", // or fallback
  });

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const data = await getAllGuides();
        if (!data) {
          setGuides([]);
          return;
        }

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

  // useEffect(() => {
  //   const fetchMyGuide = async () => {
  //     try {
  //       const data = await getGuideProfile();
  //       if (!data) {
  //         return;
  //       }
  //       const formattedData = {
  //         id: data._id,
  //         name: data.userId?.name,
  //         email: data.userId?.email || "",
  //         avatar: data.userId?.avatar,
  //         image: data.userId?.avatar || data.userId?.profileImage,
  //         experience: data.yearsOfExperience,
  //         rating: data.averageRating,
  //         languages: data.languages,
  //         specialities: data.speciality ? [data.speciality] : [],
  //         price: data.hourlyRate,
  //         isAvailable: data.isAvailable,
  //         isOnline: data.isOnline,
  //         hourlyRate: data.hourlyRate,
  //         verificationStatus: data.verificationStatus,
  //       };
  //       setMyGuide(formattedData);
  //     } catch (error) {
  //       console.log("Error fetching myGuide");
  //     }
  //     return await getGuideProfile();
  //   };
  //   fetchMyGuide();
  // }, []);

  const updateGuideData = async (id: string, data: any) => {
    const updated = await updateGuide(data);

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

  const setOnlineStatus = async (id: string, status: boolean) => {
    const updated = await setOnlineStatusApi(status);
    setGuides((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isOnline: status } : g)),
    );

    setMyGuide((prev) =>
      prev && prev.id === id ? { ...prev, isOnline: status } : prev,
    );
    return updated;
  };

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
