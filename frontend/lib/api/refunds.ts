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
  if (!res.ok) throw new Error(json.message || "Refund API error");
  return json.data;
};

export type RefundStatus = "REQUESTED" | "PROCESSED" | "FAILED";

export interface Refund {
  _id: string;
  id?: string;
  paymentId: string | { _id: string };
  bookingId: string | { _id: string };
  amount: number;
  reason?: string;
  status: RefundStatus;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
}

/**
 * Get all refunds for a specific booking
 */
export const getBookingRefundsApi = async (
  bookingId: string,
): Promise<Refund[]> => {
  const res = await fetch(
    `${base_url}payments/booking/${bookingId}/refunds`,
    {
      headers: authHeaders(),
    },
  );
  return handleRes(res);
};

/**
 * Get all refunds for the current user
 */
export const getMyRefundsApi = async (): Promise<Refund[]> => {
  const res = await fetch(`${base_url}payments/my-refunds`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

/**
 * Request a refund for a payment
 */
export const requestRefundApi = async (data: {
  paymentId: string;
  amount: number;
  reason: string;
}): Promise<Refund> => {
  const res = await fetch(`${base_url}payments/${data.paymentId}/refund`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      amount: data.amount,
      reason: data.reason,
    }),
  });
  return handleRes(res);
};
