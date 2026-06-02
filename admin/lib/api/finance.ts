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

// Admin Settings APIs
export const getAdminSettingsApi = async () => {
  const res = await fetch(`${base_url}finance/settings`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const updateCommissionPercentApi = async (driverCommissionPercent: number) => {
  const res = await fetch(`${base_url}finance/settings/commission`, {
    method: "PATCH",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ driverCommissionPercent }),
  });
  return handleRes(res);
};

// Driver Commission Payment APIs
export const recordCommissionPaymentApi = async (
  driverId: string,
  amount: number,
  note?: string
) => {
  const res = await fetch(`${base_url}finance/commission/record`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
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

// Driver Wallet APIs
export const getDriverWalletApi = async (driverId: string) => {
  const res = await fetch(`${base_url}finance/driver/${driverId}/wallet`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const getDriverPaymentHistoryApi = async (driverId: string) => {
  const res = await fetch(`${base_url}finance/driver/${driverId}/payments`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleRes(res);
};

// Admin Finance Overview APIs
export const getPendingCommissionsApi = async () => {
  const res = await fetch(`${base_url}finance/commissions/pending`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const getDriverCollectionOverviewApi = async () => {
  const res = await fetch(`${base_url}finance/drivers/collection/overview`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleRes(res);
};
