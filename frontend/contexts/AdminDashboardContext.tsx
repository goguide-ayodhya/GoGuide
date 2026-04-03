"use client";

import { createContext, useContext, useState } from "react";
import {
  getAdminDashboard,
  getGuideDashboard,
  getUserDashboard,
} from "@/lib/api/adminDashboard";

// ---------------- TYPES ----------------
type DashboardData = {
  totalUsers?: number;
  totalGuides?: number;
  totalBookings?: number;
  totalRevenue?: number;
  recentBookings?: any[];
  recentUsers?: any[];
};

interface DashboardContextType {
  adminData: DashboardData | null;
  guideData: DashboardData | null;
  userData: DashboardData | null;
  loading: boolean;

  fetchAdminDashboard: () => Promise<void>;
  fetchGuideDashboard: () => Promise<void>;
  fetchUserDashboard: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

// ---------------- PROVIDER ----------------
export const AdminDashboardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [adminData, setAdminData] = useState<DashboardData | null>(null);
  const [guideData, setGuideData] = useState<DashboardData | null>(null);
  const [userData, setUserData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  // ---------------- ADMIN ----------------
  const fetchAdminDashboard = async () => {
    setLoading(true);
    try {
      const data = await getAdminDashboard();
      // ❗ API already data return karti hai
      setAdminData(data);
    } catch (err) {
      console.log("Admin Dashboard Error", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GUIDE ----------------
  const fetchGuideDashboard = async () => {
    setLoading(true);
    try {
      const data = await getGuideDashboard();
      setGuideData(data);
    } catch (err) {
      console.log("Guide Dashboard Error", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- USER ----------------
  const fetchUserDashboard = async () => {
    setLoading(true);
    try {
      const data = await getUserDashboard();
      setUserData(data);
    } catch (err) {
      console.log("User Dashboard Error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        adminData,
        guideData,
        userData,
        loading,
        fetchAdminDashboard,
        fetchGuideDashboard,
        fetchUserDashboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

// ---------------- HOOK ----------------
export const useAdminDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useAdminDashboard must be used within provider");
  }
  return context;
};
