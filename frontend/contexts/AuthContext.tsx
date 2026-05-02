"use client";

import {
  signupUser,
  loginUser,
  logoutUser,
  getMe,
  ApiError,
} from "@/lib/api/auth";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  profileStep: number;
  id: string;
  name: string;
  email?: string;
  role: "GUIDE" | "TOURIST" | "DRIVER" | "ADMIN";
  avatar?: string;
  bio?: string;
  profileImage?: string;
  phone: string;
  speciality?: string;
  certification?: string;
  yearsOfExperience?: number;
  languages?: string[];
  averageRating?: number;
  isAvailable?: boolean;
  isOnline?: boolean;
  isEmailVerified?: boolean;
  isProfileComplete?: boolean;
  status?: string;
}

export type SignupData = {
  name: string;
  email?: string;
  password: string;
  role: string;
  phone: string;
  avatar?: File;

  // Guide fields
  specialities?: string[];
  locations?: string[];
  price?: string;
  duration?: string;
  certificates?: (File | { name: string; image: File })[];

  // Driver fields
  speciality?: string;
  experience?: string;
  languages?: string[];
  vehicleType?: string;
  vehicleName?: string;
  vehicleNumber?: string;
  seats?: string;
  driverPhoto?: File | null;
  vehiclePhoto?: File | null;
  driverLicenseName?: string;
  driverLicenseImage?: File | null;
  profileImage?: File | null;
};

export type LoginData = {
  identifier: string;
  password: string;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (data: LoginData) => Promise<User>;
  signup: (data: SignupData) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUser = (data: any): User => ({
  id: data.id || data._id || "",
  name: data.name || "",
  email: data.email || undefined,
  role: data.role || "TOURIST",
  avatar: data.avatar || data.profileImage || "",
  bio: data.bio || data.description || "",
  profileImage: data.profileImage || data.avatar || "",
  phone: data.phone || "",
  speciality: Array.isArray(data.specialities)
    ? data.specialities[0]
    : data.speciality || undefined,
  certification: data.certification || undefined,
  yearsOfExperience: data.yearsOfExperience || data.experience || undefined,
  languages: Array.isArray(data.languages)
    ? data.languages
    : data.languages
      ? [data.languages]
      : undefined,
  averageRating: data.averageRating ?? data.rating ?? 0,
  isAvailable: data.isAvailable ?? false,
  isOnline: data.isOnline ?? false,
  isEmailVerified: data.isEmailVerified ?? false,
  isProfileComplete: data.isProfileComplete ?? false,
  status: data.status || undefined,
  profileStep: 0
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token === "null" || token === "undefined") {
        console.log("[AUTH] Clearing invalid token");
        localStorage.removeItem("token");
      }
      if (storedUser === "null" || storedUser === "undefined") {
        console.log("[AUTH] Clearing invalid user");
        localStorage.removeItem("user");
      }

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser) {
            setUser(normalizeUser(parsedUser));
          }
        } catch (parseError) {
          localStorage.removeItem("user");
          setUser(null);
        }
      }

      try {
        const freshUser = await getMe();
        const normalizedUser = normalizeUser(freshUser);
        setUser(normalizedUser);
        localStorage.setItem("user", JSON.stringify(normalizedUser));
      } catch (error: unknown) {
        const invalidToken =
          error instanceof ApiError &&
          (error.statusCode === 401 || error.statusCode === 403);

        if (invalidToken) {
          console.warn(
            "[AUTH] Token invalid or expired, clearing stored auth state",
            error,
          );
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        } else {
          console.warn(
            "[AUTH] Could not refresh auth state. Keeping stored user if available.",
            error,
          );
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      console.log("[AUTH] Logging in user:", data.identifier);
      const res = await loginUser(data);
      if (!res || !res.user || !res.token) {
        throw new Error("Invalid login response");
      }

      const normalizedUser = normalizeUser(res.user);
      console.log("[AUTH] Login successful, saving to localStorage");
      setUser(normalizedUser);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      localStorage.setItem("token", res.token);
      console.log("[AUTH] User and token saved to localStorage");

      return res.user;
    } catch (error: unknown) {
      console.error(
        "[AUTH] Login error:",
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    try {
      setLoading(true);
      console.log("[AUTH] Signing up user:", data.email || data.phone);
      console.log("🔥 SENDING SIGNUP PAYLOAD:", data);
      const res = await signupUser(data);

      if (!res || !res.user || !res.token) {
        throw new Error("Invalid signup response");
      }
      console.log("FINAL SIGNUP DATA:", data);

      const normalizedUser = normalizeUser(res.user);
      console.log("[AUTH] Signup successful, saving to localStorage");
      setUser(normalizedUser);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      localStorage.setItem("token", res.token);
      console.log("[AUTH] User and token saved to localStorage");

      console.log("FINAL SIGNUP DATA:", data);
      return res.user;
    } catch (error: unknown) {
      console.error(
        "[AUTH] Signup error:",
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log("[AUTH] Logging out");
      await logoutUser();
    } catch (error) {
      console.warn("[AUTH] Logout error (ignored):", error);
    }
    console.log("[AUTH] Clearing auth state and localStorage");
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };
  const refreshUser = async () => {
    const freshUser = await getMe();
    const normalizedUser = normalizeUser(freshUser);
    setUser(normalizedUser);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    return normalizedUser;
  };

  const updateUser = (data: Partial<User>) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn: !!user && !loading,
        login,
        signup,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
