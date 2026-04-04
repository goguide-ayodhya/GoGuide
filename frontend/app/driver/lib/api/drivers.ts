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

export const getAllDrivers = async () => {
  const res = await fetch(`${base_url}drivers`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  return json.data;
};

export const getMyDriver = async () => {
  const res = await fetch(`${base_url}drivers/me`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  return json.data;
};

export const getDriverById = async (id: string) => {
  const res = await fetch(`${base_url}drivers/${id}`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  return json.data;
};

export const updateDriver = async (id: string, data: any) => {
  const res = await fetch(`${base_url}drivers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return json.data;
};

export const setDriverAvailabilityApi = async (
  id: string,
  isAvailable: boolean,
) => {
  const res = await fetch(`${base_url}drivers/${id}/availability`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ isAvailable }),
  });
  const json = await res.json();
  return json.data;
};

export const setDriverOnlineStatusApi = async (id: string, isOnline: boolean) => {
  const res = await fetch(`${base_url}drivers/${id}/online-status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ isOnline }),
  });
  const json = await res.json();
  return json.data;
};
