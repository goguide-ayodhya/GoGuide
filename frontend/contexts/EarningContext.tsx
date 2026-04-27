import React, { createContext, useState, useContext, useEffect } from "react";
import { getGuideEarningsApi, getGuideMonthlyEarningsApi, getGuideWeeklyEarningsApi } from "@/lib/api/payments";
import { getDriverEarnings, getDriverMonthlyEarnings, getDriverWeeklyEarnings } from "@/lib/api/payments";
import { useAuth } from "@/contexts/AuthContext";

type EarningsData = {
  totalEarnings: number;
  pendingAmount: number;
  bookingStats: {
    total: number;
    completed: number;
    pending: number;
  };
  revenueByTourType?: Array<{
    type: string;
    revenue: number;
    bookings: number;
  }>;
  recentTransactions: any[];
};

type MonthlyData = {
  month: string;
  revenue: number;
}[];

type WeeklyData = {
  week: string;
  revenue: number;
}[];

type EarningsContextType = {
  earnings: EarningsData | null;
  monthlyData: MonthlyData | null;
  weeklyData: WeeklyData | null;
  loading: boolean;
  fetchEarnings: () => Promise<void>;
  fetchMonthlyEarnings: () => Promise<void>;
  fetchWeeklyEarnings: () => Promise<void>;
};

const EarningsContext = createContext<EarningsContextType | null>(null);

export const EarningsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const data = user?.role === "DRIVER" 
        ? await getDriverEarnings()
        : await getGuideEarningsApi();
      setEarnings(data);
    } catch (error) {
      console.log("Error fetching earnings", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyEarnings = async () => {
    try {
      const data = user?.role === "DRIVER"
        ? await getDriverMonthlyEarnings()
        : await getGuideMonthlyEarningsApi();
      setMonthlyData(data);
    } catch (error) {
      console.log("Error fetching monthly earnings", error);
    }
  };

  const fetchWeeklyEarnings = async () => {
    try {
      const data = user?.role === "DRIVER"
        ? await getDriverWeeklyEarnings()
        : await getGuideWeeklyEarningsApi();
      setWeeklyData(data);
    } catch (error) {
      console.log("Error fetching weekly earnings", error);
    }
  };

  useEffect(() => {
    if (!user) {
      setEarnings(null);
      setMonthlyData(null);
      setWeeklyData(null);
      return;
    }

    void (async () => {
      await fetchEarnings();
      await fetchMonthlyEarnings();
      await fetchWeeklyEarnings();
    })();
  }, [user]);

  return (
    <EarningsContext.Provider value={{ 
      earnings, 
      monthlyData, 
      weeklyData, 
      loading, 
      fetchEarnings, 
      fetchMonthlyEarnings, 
      fetchWeeklyEarnings 
    }}>
      {children}
    </EarningsContext.Provider>
  );
};

export function useEarnings() {
  const context = useContext(EarningsContext);
  if (context === undefined) {
    throw new Error("useEarnings must be used within an EarningsProvider");
  }
  return context;
}
