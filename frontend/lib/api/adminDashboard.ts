const base_url = process.env.NEXT_PUBLIC_BASE_URL;

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const handleRes = async (res: Response) => {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
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