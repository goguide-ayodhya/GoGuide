import { useContext, createContext, useState } from "react";
import {
  createPaymentApi,
  processPaymentApi,
  getGuidePaymentsApi,
  getMyPaymentsApi,
  getPaymentStatsApi,
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
  processPayment: (paymentId: string) => Promise<any>;
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

  const processPayment = async (paymentId: string) => {
    try {
      const data = await processPaymentApi(paymentId);

      setPayments((prev) =>
        prev.map((p) =>
          p._id === paymentId ? { ...p, status: "COMPLETED" } : p,
        ),
      );
      return data;
    } catch (error) {
      console.log("Error Processing Payment", error);
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
