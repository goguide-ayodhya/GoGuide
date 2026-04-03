"use client";

import { createContext, useContext, useState } from "react";
import { getProfile, updateProfile } from "@/lib/api/settings";

// ---------------- TYPES ----------------
interface Profile {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface SettingsContextType {
  profile: Profile | null;
  loading: boolean;

  fetchProfile: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
  // changePassword: (data: any) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

// ---------------- PROVIDER ----------------
export const SettingsProvider = ({ children }: any) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      console.log("Profile fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data: any) => {
    try {
      const updated = await updateProfile(data);
      setProfile(updated);
    } catch (err) {
      console.log("Update profile error", err);
    }
  };

  // const changePassword = async (data: any) => {
  //   try {
  //     await changePasswordApi(data);
  //   } catch (err) {
  //     console.log("Change password error", err);
  //   }
  // };

  return (
    <SettingsContext.Provider
      value={{
        profile,
        loading,
        fetchProfile,
        updateUserProfile,
        // changePassword,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within provider");
  return context;
};
