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
  if (!res.ok) throw new Error(json.message || "Payment API error");
  return json.data;
};

// Create Payment
export const createPaymentApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}payments/booking/${bookingId}`, {
    method: "POST",
    headers: authHeaders(),
  });

  return handleRes(res);
};

// Process Payment
export const processPaymentApi = async (paymentId: string) => {
  const res = await fetch(`${base_url}payments/${paymentId}/process`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      status: "COMPLETED",
      paymentMethod: "CARD",
      transactionId: "txn_" + Date.now(),
    }),
  });

  return handleRes(res);
};

// Driver Earnings
export const getDriverEarnings = async () => {
  const res = await fetch(`${base_url}payments/driver/earnings`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

// Driver Monthly Earnings
export const getDriverMonthlyEarnings = async () => {
  const res = await fetch(`${base_url}payments/driver/monthly-earnings`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

// Driver Weekly Earnings
export const getDriverWeeklyEarnings = async () => {
  const res = await fetch(`${base_url}payments/driver/weekly-earnings`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

// Get Guide Earnings
export const getGuideEarningsApi = async () => {
  const res = await fetch(`${base_url}payments/guide/earnings`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

// Get Guide Monthly Earnings
export const getGuideMonthlyEarningsApi = async () => {
  const res = await fetch(`${base_url}payments/guide/monthly-earnings`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

// Get Guide Weekly Earnings
export const getGuideWeeklyEarningsApi = async () => {
  const res = await fetch(`${base_url}payments/guide/weekly-earnings`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

// My Payments
export const getMyPaymentsApi = async () => {
  const res = await fetch(`${base_url}payments/my-payments`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

// Guide Payments
export const getGuidePaymentsApi = async () => {
  const res = await fetch(`${base_url}payments/guide`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

// Stats
export const getPaymentStatsApi = async () => {
  const res = await fetch(`${base_url}payments/guide/stats`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

// Earnings
export const getGuideEarnings = async () => {
  const res = await fetch(`${base_url}payments/guide/earnings`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};
