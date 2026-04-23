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

export const getGuidesPayoutOverviewApi = async () => {
  const res = await fetch(`${base_url}admin/guides/payout-overview`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const createAdminPayoutApi = async (guideId: string, amount: number) => {
  const res = await fetch(`${base_url}admin/payout/${guideId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ amount }),
  });
  return handleRes(res);
};

export const getAllPayoutsAdminApi = async () => {
  const res = await fetch(`${base_url}admin/payouts`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};
