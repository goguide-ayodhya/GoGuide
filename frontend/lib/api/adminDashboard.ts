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

// PUBLIC
export const getPublicStats = async () => {
  const res = await fetch(`${base_url}adminDashboard/public/stats`);
  return handleRes(res);
};

// ADMIN
export const getAdminDashboard = async () => {
  const res = await fetch(`${base_url}adminDashboard/admin`, {
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