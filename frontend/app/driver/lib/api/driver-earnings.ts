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

export const getDriverEarnings = async () => {
  const res = await fetch(`${base_url}payment/driver/earnings`, {
    headers: authHeaders(),
  });

  return res.json();
};
