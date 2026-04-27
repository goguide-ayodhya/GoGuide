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
  const json = await res.json();
  if (!res.ok) {
    const errorMessage =
      json.message || `API Error: ${res.status} ${res.statusText}`;
    console.error("[API_ERROR] Payment API Error:", {
      status: res.status,
      statusText: res.statusText,
      message: errorMessage,
      fullResponse: json,
    });
    const error = new Error(errorMessage) as any;
    error.response = { data: json, status: res.status };
    throw error;
  }
  return json.data;
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

  const json = await res.json().catch(() => ({}));
  // If booking already has a pending/completed payment, backend may return 200 with data
  // or 409 to indicate duplicate prevention. Treat 409 as a recoverable response.
  if (res.ok) return json.data;
  if (res.status === 409) return json.data ?? json; // return data when present, else full json
  throw new Error(json.message || `API Error: ${res.status} ${res.statusText}`);
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
