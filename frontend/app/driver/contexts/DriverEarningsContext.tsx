"use client";

import React, { createContext, useState, useContext } from "react";
import { getDriverEarnings } from "@/app/driver/lib/api/driver-earnings";

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

type DriverEarningsContextType = {
  earnings: EarningsData | null;
  loading: boolean;
  fetchEarnings: () => Promise<void>;
};

const DriverEarningsContext = createContext<DriverEarningsContextType | null>(
  null,
);

export const DriverEarningsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchEarnings = async () => {
    setLoading(true);
    const res = await getDriverEarnings();
    setEarnings(res.data);
    setLoading(false);
  };

  return (
    <DriverEarningsContext.Provider
      value={{ earnings, loading, fetchEarnings }}
    >
      {children}
    </DriverEarningsContext.Provider>
  );
};

export function useDriverEarnings() {
  const context = useContext(DriverEarningsContext);
  if (!context) {
    throw new Error(
      "useDriverEarnings must be used within DriverEarningsProvider",
    );
  }
  return context;
}
