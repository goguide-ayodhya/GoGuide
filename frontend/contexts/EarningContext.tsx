import React, { createContext, useState, useContext } from "react";
import { getGuideEarningsApi, getGuideMonthlyEarningsApi, getGuideWeeklyEarningsApi } from "@/lib/api/payments";

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
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const data = await getGuideEarningsApi();
      setEarnings(data);
    } catch (error) {
      console.log("Error fetching earnings", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyEarnings = async () => {
    try {
      const data = await getGuideMonthlyEarningsApi();
      setMonthlyData(data);
    } catch (error) {
      console.log("Error fetching monthly earnings", error);
    }
  };

  const fetchWeeklyEarnings = async () => {
    try {
      const data = await getGuideWeeklyEarningsApi();
      setWeeklyData(data);
    } catch (error) {
      console.log("Error fetching weekly earnings", error);
    }
  };

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
