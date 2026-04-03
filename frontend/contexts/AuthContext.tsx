"use client";

import {
  signupUser,
  loginUser,
  logoutAllUsers,
  logoutUser,
} from "@/lib/api/auth";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "GUIDE" | "TOURIST" | "ADMIN";
  avatar?: string;
  bio?: string;
  profileImage?: string;
  phone?: string;
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
  email: string;
  password: string;
  role: string;
  phone?: string;
  avatar?: File;
};

export type LoginData = {
  email: string;
  password: string;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (data: LoginData) => Promise<User>;
  signup: (data: SignupData) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      const res = await loginUser(data);
      setUser(res.user);

      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("token", res.token);

      return res.user;
    } catch (error: any) {
      console.log("Login error:", error.message);
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
    } catch (error: any) {
      console.log("Signup error:", error.message);
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

  const logoutAll = async () => {
    try {
      await logoutAllUsers()
    } catch (error) {
      
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn: !!user,
        login,
        signup,
        logout,
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
