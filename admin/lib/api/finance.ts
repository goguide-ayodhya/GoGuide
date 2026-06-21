const base_url = process.env.NEXT_PUBLIC_BASE_URL;

const getToken = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") return null;
  return token;
};

const authHeaders = () => {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const jsonHeaders = () => ({
  ...authHeaders(),
  "Content-Type": "application/json",
});

const handleRes = async (res: Response) => {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "API error");
  return json.data || json;
};

const handleResOrError = async (res: Response) => {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `API Error: ${res.statusText}`);
  }
  return json;
};

// ──────────────────────────────────────────────
// Admin Settings
// ──────────────────────────────────────────────
export const getAdminSettingsApi = async () => {
  const res = await fetch(`${base_url}finance/settings`, { headers: authHeaders() });
  return handleRes(res);
};

export const updateCommissionPercentApi = async (driverCommissionPercent: number) => {
  const res = await fetch(`${base_url}finance/settings/commission`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify({ driverCommissionPercent }),
  });
  return handleRes(res);
};

export const updateGuidePricingApi = async (guidePricing: any) => {
  const res = await fetch(`${base_url}finance/settings/guide-pricing`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify({ guidePricing }),
  });
  return handleRes(res);
};

export const updateLocationsApi = async (locations: string[]) => {
  const res = await fetch(`${base_url}finance/settings/locations`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify({ locations }),
  });
  return handleRes(res);
};

export const updatePaymentQRApi = async (url: string, isEnabled: boolean) => {
  const res = await fetch(`${base_url}finance/settings/payment-qr`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify({ url, isEnabled }),
  });
  return handleRes(res);
};

export const uploadPaymentQRApi = async (file: File, isEnabled: boolean) => {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const fd = new FormData();
  fd.append("paymentQRFile", file);
  fd.append("isEnabled", String(isEnabled));

  const res = await fetch(`${base_url}finance/settings/payment-qr`, {
    method: "PATCH",
    headers,
    body: fd,
  });

  return handleRes(res);
};

// ──────────────────────────────────────────────
// Admin: Commission Overview Stats
// ──────────────────────────────────────────────
export const getCommissionOverviewStatsApi = async () => {
  const res = await fetch(`${base_url}finance/commission/overview`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

// ──────────────────────────────────────────────
// Admin: All Commission Requests (filterable)
// ──────────────────────────────────────────────
export const getAllCommissionRequestsApi = async (status: string = "ALL") => {
  const res = await fetch(`${base_url}finance/commission/requests?status=${status}`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

// ──────────────────────────────────────────────
// Admin: Approve / Reject
// ──────────────────────────────────────────────
export const approveCommissionRequestApi = async (paymentId: string) => {
  const res = await fetch(`${base_url}finance/commission/${paymentId}/approve`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResOrError(res);
};

export const rejectCommissionRequestApi = async (paymentId: string, reason: string) => {
  const res = await fetch(`${base_url}finance/commission/${paymentId}/reject`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify({ reason }),
  });
  return handleResOrError(res);
};

// ──────────────────────────────────────────────
// Admin: Legacy endpoints
// ──────────────────────────────────────────────
export const recordCommissionPaymentApi = async (
  driverId: string,
  amount: number,
  note?: string
) => {
  const res = await fetch(`${base_url}finance/commission/record`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ driverId, amount, note }),
  });
  return handleRes(res);
};

export const confirmCommissionPaymentApi = async (paymentId: string) => {
  const res = await fetch(`${base_url}finance/commission/${paymentId}/confirm`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResOrError(res);
};

// ──────────────────────────────────────────────
// Driver Wallet
// ──────────────────────────────────────────────
export const getDriverWalletApi = async (driverId: string) => {
  const res = await fetch(`${base_url}finance/driver/${driverId}/wallet`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const getDriverPaymentHistoryApi = async (driverId: string) => {
  const res = await fetch(`${base_url}finance/driver/${driverId}/payments`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

// ──────────────────────────────────────────────
// Admin: Driver Priority List (pending > 0 only)
// ──────────────────────────────────────────────
export const getPendingCommissionsApi = async () => {
  const res = await fetch(`${base_url}finance/commissions/pending`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const getDriverCollectionOverviewApi = async () => {
  const res = await fetch(`${base_url}finance/drivers/collection/overview`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};
