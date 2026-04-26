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
  if (!res.ok) throw new Error(json.message);
  return json.data;
};

// ADMIN
export const getAdminDashboard = async (filter?: { startDate?: string; endDate?: string }) => {
  const params = new URLSearchParams();
  if (filter?.startDate) params.set('startDate', filter.startDate);
  if (filter?.endDate) params.set('endDate', filter.endDate);

  const res = await fetch(`${base_url}adminDashboard/admin?${params}`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const getRecentUsers = async (limit = 10) => {
  const res = await fetch(`${base_url}adminDashboard/admin/recent-users?limit=${limit}`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const getRecentGuides = async (limit = 10) => {
  const res = await fetch(`${base_url}adminDashboard/admin/recent-guides?limit=${limit}`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const getRecentAlerts = async (limit = 10) => {
  const res = await fetch(`${base_url}adminDashboard/admin/recent-alerts?limit=${limit}`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const getPendingGuides = async (limit = 10) => {
  const res = await fetch(`${base_url}adminDashboard/admin/pending-guides?limit=${limit}`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const getAdminDashboardWithDateFilter = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const res = await fetch(`${base_url}adminDashboard/admin?${params.toString()}`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

// GUIDE
export const getGuideDashboard = async () => {
  const res = await fetch(`${base_url}adminDashboard/guide`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

// USER
export const getUserDashboard = async () => {
  const res = await fetch(`${base_url}adminDashboard/user`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};