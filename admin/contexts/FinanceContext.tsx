"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  getAdminSettingsApi,
  updateCommissionPercentApi,
  recordCommissionPaymentApi,
  confirmCommissionPaymentApi,
  getDriverWalletApi,
  getDriverPaymentHistoryApi,
  getPendingCommissionsApi,
  getDriverCollectionOverviewApi,
} from "@/lib/api/finance";

export type AdminSettings = {
  _id?: string;
  driverCommissionPercent: number;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
};

export type DriverWallet = {
  driverId: string;
  totalEarned: number;
  adminCommissionGenerated: number;
  adminCommissionPaid: number;
  pendingAdminCommission: number;
};

export type CommissionPayment = {
  _id: string;
  driverId: string;
  amount: number;
  commissionPercent: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdBy?: any;
  confirmedAt?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type DriverCollection = {
  driverId: string;
  driverName: string;
  totalEarned: number;
  adminCommissionGenerated: number;
  adminCommissionPaid: number;
  pendingAdminCommission: number;
};

interface FinanceContextType {
  // Admin Settings
  adminSettings: AdminSettings | null;
  loadingSettings: boolean;
  fetchAdminSettings: () => Promise<void>;
  updateCommission: (percent: number) => Promise<void>;

  // Driver Wallets
  driverWallet: DriverWallet | null;
  loadingWallet: boolean;
  fetchDriverWallet: (driverId: string) => Promise<void>;

  // Payment History
  paymentHistory: CommissionPayment[];
  loadingPaymentHistory: boolean;
  fetchPaymentHistory: (driverId: string) => Promise<void>;

  // Collection Overview
  drivers: DriverCollection[];
  loadingCollection: boolean;
  fetchCollectionOverview: () => Promise<void>;

  // Pending Commissions
  pendingCommissions: CommissionPayment[];
  loadingPending: boolean;
  fetchPendingCommissions: () => Promise<void>;

  // Operations
  recordPayment: (driverId: string, amount: number, note?: string) => Promise<void>;
  confirmPayment: (paymentId: string) => Promise<void>;

  // Error handling
  error: string | null;
  clearError: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);

  const [driverWallet, setDriverWallet] = useState<DriverWallet | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);

  const [paymentHistory, setPaymentHistory] = useState<CommissionPayment[]>([]);
  const [loadingPaymentHistory, setLoadingPaymentHistory] = useState(false);

  const [drivers, setDrivers] = useState<DriverCollection[]>([]);
  const [loadingCollection, setLoadingCollection] = useState(false);

  const [pendingCommissions, setPendingCommissions] = useState<CommissionPayment[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const handleError = useCallback((err: any) => {
    const message = err?.message || "An error occurred";
    setError(message);
    console.error("[FinanceContext]", message);
  }, []);

  const fetchAdminSettings = useCallback(async () => {
    try {
      setLoadingSettings(true);
      clearError();
      const data = await getAdminSettingsApi();
      setAdminSettings(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoadingSettings(false);
    }
  }, [clearError, handleError]);

  const updateCommission = useCallback(
    async (percent: number) => {
      try {
        setLoadingSettings(true);
        clearError();
        const data = await updateCommissionPercentApi(percent);
        setAdminSettings(data);
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoadingSettings(false);
      }
    },
    [clearError, handleError]
  );

  const fetchDriverWallet = useCallback(
    async (driverId: string) => {
      try {
        setLoadingWallet(true);
        clearError();
        const data = await getDriverWalletApi(driverId);
        setDriverWallet(data);
      } catch (err) {
        handleError(err);
      } finally {
        setLoadingWallet(false);
      }
    },
    [clearError, handleError]
  );

  const fetchPaymentHistory = useCallback(
    async (driverId: string) => {
      try {
        setLoadingPaymentHistory(true);
        clearError();
        const data = await getDriverPaymentHistoryApi(driverId);
        setPaymentHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        handleError(err);
      } finally {
        setLoadingPaymentHistory(false);
      }
    },
    [clearError, handleError]
  );

  const fetchCollectionOverview = useCallback(async () => {
    try {
      setLoadingCollection(true);
      clearError();
      const data = await getDriverCollectionOverviewApi();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err) {
      handleError(err);
    } finally {
      setLoadingCollection(false);
    }
  }, [clearError, handleError]);

  const fetchPendingCommissions = useCallback(async () => {
    try {
      setLoadingPending(true);
      clearError();
      const data = await getPendingCommissionsApi();
      setPendingCommissions(Array.isArray(data) ? data : []);
    } catch (err) {
      handleError(err);
    } finally {
      setLoadingPending(false);
    }
  }, [clearError, handleError]);

  const recordPayment = useCallback(
    async (driverId: string, amount: number, note?: string) => {
      try {
        clearError();
        await recordCommissionPaymentApi(driverId, amount, note);
        // Refetch collections and pending
        await Promise.all([fetchCollectionOverview(), fetchPendingCommissions()]);
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [clearError, handleError, fetchCollectionOverview, fetchPendingCommissions]
  );

  const confirmPayment = useCallback(
    async (paymentId: string) => {
      try {
        clearError();
        await confirmCommissionPaymentApi(paymentId);
        // Refetch pending and collection
        await Promise.all([fetchPendingCommissions(), fetchCollectionOverview()]);
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [clearError, handleError, fetchPendingCommissions, fetchCollectionOverview]
  );

  const value: FinanceContextType = {
    adminSettings,
    loadingSettings,
    fetchAdminSettings,
    updateCommission,
    driverWallet,
    loadingWallet,
    fetchDriverWallet,
    paymentHistory,
    loadingPaymentHistory,
    fetchPaymentHistory,
    drivers,
    loadingCollection,
    fetchCollectionOverview,
    pendingCommissions,
    loadingPending,
    fetchPendingCommissions,
    recordPayment,
    confirmPayment,
    error,
    clearError,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within FinanceProvider");
  }
  return context;
};
