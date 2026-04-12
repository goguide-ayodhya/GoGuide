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
  role: "GUIDE" | "TOURIST" | "ADMIN" | "DRIVER";
  avatar?: string;
  bio?: string;
  profileImage?: string;
  phone: string;
  hourlyRate?: number;
  speciality?: string;
  certification?: string;
  yearsOfExperience?: number;
  languages?: string[];
  averageRating?: number;
  isAvailable?: boolean;
  isOnline?: boolean;
}

export type SignupData = {
  name: string;
  email?: string;
  password: string;
  role: string;
  phone: string;
  avatar?: File;
  speciality?: string;
  hourlyRate?: string;
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

      if (!token || !storedUser || token === "null" || token === "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        await validateTokenApi();
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("token");
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
      const res = await loginUser(data);
      if (!res?.user || !res?.token) {
        throw new Error("Invalid login response");
      }
      setUser(res.user);

      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("token", res.token);

      return res.user;
    } catch (error: unknown) {
      console.log(
        "Login error:",
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const res = await signupUser(data);

      setUser(res.user);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("token", res.token);

      return res.user;
    } catch (error: unknown) {
      console.log(
        "Signup error:",
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.log("Logout error (ignored): ", error);
    }
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
