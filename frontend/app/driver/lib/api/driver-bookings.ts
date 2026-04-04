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

export const getDriverBookings = async (driverId: string) => {
  const res = await fetch(`${base_url}bookings/driver/${driverId}`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  return json.data;
};
