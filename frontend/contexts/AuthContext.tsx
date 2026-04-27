"use client";

import {
  signupUser,
  loginUser,
  logoutUser,
  validateTokenApi,
} from "@/lib/api/auth";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
  email?: string;
  role: "GUIDE" | "TOURIST" | "DRIVER";
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
  // Driver & legacy fields
  speciality?: string;
  experience?: string;
  languages?: string[];
  vehicleType?: string;
  vehicleName?: string;
  vehicleNumber?: string;
  pricePerKm?: string;
  seats?: string;
  driverPhoto?: File | null;
  vehiclePhoto?: File | null;
  profileImage?: File | null;
  driverAadhar?: string;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");


      console.log("[AUTH] Initializing auth - token exists:", !!token, "user exists:", !!storedUser);

      if (token === "null" || token === "undefined") {
        console.log("[AUTH] Clearing invalid token");
        localStorage.removeItem("token");
      }
      if (storedUser === "null" || storedUser === "undefined") {
        console.log("[AUTH] Clearing invalid user");
        localStorage.removeItem("user");
      }

      if (!token || !storedUser) {
        console.log("[AUTH] No token or user - staying logged out");
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        console.log("[AUTH] Validating token with backend...");
        await validateTokenApi();
        console.log("[AUTH] Token validation successful");
      } catch (error) {
        console.warn("[AUTH] Token validation failed, logging out:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("[AUTH] Setting user from localStorage:", parsedUser?.id);
        setUser(parsedUser || null);
      } catch (parseError) {
        console.error("[AUTH] Failed to parse stored user:", parseError);
        localStorage.removeItem("user");
        setUser(null);
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

      console.log("[AUTH] Login successful, saving to localStorage");
      setUser(res.user);
      localStorage.setItem("user", JSON.stringify(res.user));
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
      const res = await signupUser(data);
      if (!res || !res.user || !res.token) {
        throw new Error("Invalid signup response");
      }

      console.log("[AUTH] Signup successful, saving to localStorage");
      setUser(res.user);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("token", res.token);
      console.log("[AUTH] User and token saved to localStorage");

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
        isLoggedIn: !!user,
        login,
        signup,
        logout,
        updateUser,
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
