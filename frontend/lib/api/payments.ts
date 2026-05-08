import { handleApiResponse, isAuthError } from "./authErrorHandler";

const base_url = process.env.NEXT_PUBLIC_BASE_URL;

const getToken = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") return null;
  return token;
};

const authHeaders = () => {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleRes = async (res: Response) => {
  const text = await res.text();

  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = {};
  }

  if (!res.ok) {
    const errorMessage =
<<<<<<< HEAD
      (json as any).message || `API Error: ${res.status} ${res.statusText}`;
=======
      (json as any).message ||
      `API Error: ${res.status} ${res.statusText}`;
>>>>>>> d0ee4af7f85c1f60a1977528887202f42df26d56

    console.error("[API_ERROR] Payment API Error:", {
      status: res.status,
      statusText: res.statusText,
      message: errorMessage,
      fullResponse: json,
    });

<<<<<<< HEAD
    return handleApiResponse(res);

=======
>>>>>>> d0ee4af7f85c1f60a1977528887202f42df26d56
    throw new Error(errorMessage);
  }

  return (json as any).data;
};

export type TouristPaymentMode = "FULL" | "PARTIAL" | "COD" | "REMAINING";

/** Ensure placeholder payment exists (usually after guide acceptance). */
export const createPaymentApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}payments/booking/${bookingId}`, {
    method: "POST",
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const setPaymentModeApi = async (
  bookingId: string,
  paymentType: TouristPaymentMode,
) => {
  const res = await fetch(`${base_url}payments/booking/${bookingId}/mode`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ paymentType }),
  });

  return handleRes(res);
};

export const createRazorpayOrderApi = async (
  bookingId: string,
  payload?: any,
) => {
  // Ensure payload amounts are integers when provided
  if (payload && typeof payload.amount === "number") {
    payload.amount = Math.round(payload.amount);
  }
  const res = await fetch(
    `${base_url}payments/booking/${bookingId}/razorpay-order`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload ?? {}),
    },
  );

  const text = await res.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = {};
  }

  if (res.ok) return json.data;
  if (res.status === 409) return json.data ?? json;

  const errorMessage =
    json.message || `API Error: ${res.status} ${res.statusText}`;
  if (isAuthError(res.status, errorMessage, json)) {
    console.warn(
      "[PAYMENTS_API] Authentication error detected, triggering logout",
    );
    const { handleAuthError } = await import("./authErrorHandler");
    handleAuthError({ message: errorMessage });
  }

  throw new Error(errorMessage);
};

export const getBookingPaymentsApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}payments/booking/${bookingId}`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const skipPaymentApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}payments/booking/${bookingId}/skip`, {
    method: "POST",
    headers: authHeaders(),
  });

  return handleRes(res);
};

export type ProcessPaymentPayload =
  | {
      status: string;
      paymentMethod?: string;
      transactionId?: string;
    }
  | {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    };

export const processPaymentApi = async (
  paymentId: string,
  payload: ProcessPaymentPayload,
) => {
  const res = await fetch(`${base_url}payments/${paymentId}/process`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return handleRes(res);
};

export const retryPaymentApi = async (paymentId: string) => {
  const res = await fetch(`${base_url}payments/${paymentId}/retry`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const getPaymentRefundsApi = async (paymentId: string) => {
  const res = await fetch(`${base_url}payments/${paymentId}/refunds`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const createRefundApi = async (
  paymentId: string,
  payload: { amount: number; reason?: string },
) => {
  const res = await fetch(`${base_url}payments/${paymentId}/refund`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleRes(res);
};

export const createCancellationRefundApi = async (
  bookingId: string,
  payload?: { reason?: string },
) => {
  const res = await fetch(
    `${base_url}payments/booking/${bookingId}/refund/cancellation`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload ?? {}),
    },
  );
  return handleRes(res);
};

export const getDriverEarnings = async () => {
  const res = await fetch(`${base_url}payments/driver/earnings`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const getDriverMonthlyEarnings = async () => {
  const res = await fetch(`${base_url}payments/driver/monthly-earnings`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const getDriverWeeklyEarnings = async () => {
  const res = await fetch(`${base_url}payments/driver/weekly-earnings`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const getGuideEarningsApi = async () => {
  const res = await fetch(`${base_url}payments/guide/earnings`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const getGuideMonthlyEarningsApi = async () => {
  const res = await fetch(`${base_url}payments/guide/monthly-earnings`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const getGuideWeeklyEarningsApi = async () => {
  const res = await fetch(`${base_url}payments/guide/weekly-earnings`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const getMyPaymentsApi = async () => {
  const res = await fetch(`${base_url}payments/my-payments`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const getGuidePaymentsApi = async () => {
  const res = await fetch(`${base_url}payments/guide`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const getPaymentStatsApi = async () => {
  const res = await fetch(`${base_url}payments/guide/stats`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const getGuideEarnings = async () => {
  const res = await fetch(`${base_url}payments/guide/earnings`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

/** Guide/driver/admin: mark COD booking as cash collected */
export const completeCodPaymentApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}payments/cod/complete/${bookingId}`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  return handleRes(res);
};

/** Admin dashboard */
export const getAdminPaymentsSummaryApi = async () => {
  const res = await fetch(`${base_url}payments/admin/payments/summary`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};
