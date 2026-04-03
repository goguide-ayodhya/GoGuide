import React, { createContext, useState, useContext } from "react";
import { getGuideEarnings } from "@/lib/api/payments";

type EarningsData = {
  totalEarnings: number;
  pendingAmount: number;
  bookingStats: {
    total: number;
    completed: number;
    pending: number;
  };
  recentTransactions: any[];
};

type EarningsContextType = {
  earnings: EarningsData | null;
  loading: boolean;
  fetchEarnings: () => Promise<void>;
};

const EarningsContext = createContext<EarningsContextType | null>(null);

export const EarningsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const data = await getGuideEarnings();
      setEarnings(data);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching earnings", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <EarningsContext.Provider value={{ earnings, loading, fetchEarnings }}>
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
