const base_url = process.env.NEXT_PUBLIC_BASE_URL;

const getToken = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") return null;
  return token;
};

const authHeaders = () => {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const handleRes = async (res: Response) => {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Payout API error");
  return json.data;
};

export type PayoutWalletSummary = {
  totalEarnings: number;
  paidOut: number;
  pendingConfirmation: number;
  pendingPayout: number;
  availableForPayout: number;
};

export const getPayoutSummaryApi = async (): Promise<PayoutWalletSummary> => {
  const res = await fetch(`${base_url}payout/me/summary`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const getPayoutHistoryApi = async () => {
  const res = await fetch(`${base_url}payout/me/history`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const confirmPayoutApi = async (payoutId: string) => {
  const res = await fetch(`${base_url}payout/confirm/${payoutId}`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleRes(res);
};
