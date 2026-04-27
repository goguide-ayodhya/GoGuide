import { useContext, createContext, useState } from "react";
import {
  createPaymentApi,
  skipPaymentApi,
  processPaymentApi,
  getGuidePaymentsApi,
  getMyPaymentsApi,
  getPaymentStatsApi,
  type ProcessPaymentPayload,
} from "@/lib/api/payments";

export interface Payment {
  _id: string;
  bookingId: any;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
}

interface PaymentStats {
  totalEarnings: number;
  completedPayment: number;
  averagePayment: number;
}

interface PaymentContextType {
  payments: Payment[];
  stats: PaymentStats | null;
  loading: boolean;

  fetchMyPayments: () => Promise<void>;
  fetchGuidePayments: () => Promise<void>;
  fetchStats: () => Promise<void>;

  createPayment: (bookingId: string) => Promise<any>;
  skipPayment: (bookingId: string) => Promise<any>;
  processPayment: (
    paymentId: string,
    payload?: ProcessPaymentPayload,
  ) => Promise<any>;
}

// const PaymentContext = createContext<PaymentContextType | null>(null);
const PaymentContext = createContext<PaymentContextType>(
  {} as PaymentContextType,
);

export const PaymentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMyPayments = async () => {
    try {
      setLoading(true);
      const data = await getMyPaymentsApi();
      setPayments(data || []);
    } catch (error) {
      console.log("Error fetching Payments", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuidePayments = async () => {
    try {
      setLoading(true);
      const data = await getGuidePaymentsApi();
      setPayments(data || []);
    } catch (error) {
      console.log("Error fetching Guide Payments", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getPaymentStatsApi();
      setStats(data);
    } catch (error) {
      console.log("Error fetching Stats", error);
    }
  };

  const createPayment = async (bookingId: string) => {
    try {
      const data = await createPaymentApi(bookingId);
      return data;
    } catch (error) {
      console.log("Error Creating Payment", error);
    }
  };

  const skipPayment = async (bookingId: string) => {
    try {
      const data = await skipPaymentApi(bookingId);
      return data;
    } catch (error) {
      console.log("Error Skipping Payment", error);
    }
  };

  const processPayment = async (
    paymentId: string,
    payload?: ProcessPaymentPayload,
  ) => {
    try {
      const data = await processPaymentApi(
        paymentId,
        payload ?? {
          status: "COMPLETED",
          paymentMethod: "CARD",
          transactionId: "txn_" + Date.now(),
        },
      );

      setPayments((prev) =>
        prev.map((p) =>
          p._id === paymentId ? { ...p, status: "COMPLETED" } : p,
        ),
      );
      return data;
    } catch (error: any) {
      // Extract actual backend error message
      let errorMessage = "Payment processing failed";
      
      if (error?.response?.data?.message) {
        // Axios error format
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        // Standard error message
        errorMessage = error.message;
      }
      
      console.error("[PAYMENT_ERROR] Error Processing Payment:", {
        errorMessage,
        fullError: error,
        paymentId,
      });
      
      // Throw error with extracted message
      throw new Error(errorMessage);
    }
  };

  return (
    <PaymentContext.Provider
      value={{
        payments,
        stats,
        loading,
        fetchGuidePayments,
        fetchMyPayments,
        fetchStats,
        createPayment,
        skipPayment,
        processPayment,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePayment must be used within PaymentProvider");
  }
  return context;
}
