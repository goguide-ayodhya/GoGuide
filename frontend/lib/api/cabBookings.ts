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

export const createCabBookingApi = async (bookingData: any) => {
  const res = await fetch(`${base_url}cab-bookings`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingData),
  });
  return handleRes(res);
};

export const getMyCabBookingsApi = async () => {
  const res = await fetch(`${base_url}cab-bookings/my-bookings`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const updateCabBookingStatusApi = async (bookingId: string, status: string) => {
  const res = await fetch(`${base_url}cab-bookings/${bookingId}/status`, {
    method: "PATCH",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  return handleRes(res);
};
