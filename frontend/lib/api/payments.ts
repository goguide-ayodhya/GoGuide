const base_url = process.env.NEXT_PUBLIC_BASE_URL;

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

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
  