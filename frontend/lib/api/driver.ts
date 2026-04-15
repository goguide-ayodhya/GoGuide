const base_url = process.env.NEXT_PUBLIC_BASE_URL;

const getToken = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") return null;
  return token;
};

const authHeaders = () => {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log("[DRIVER-API] Adding Authorization header, token length:", token.length);
  } else {
    console.warn("[DRIVER-API] No token found for request");
  }
  return headers;
};

const handleRes = async (res: Response) => {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "API error");
  return json.data;
};

// Public
export const getAllDrivers = async () => {
  const res = await fetch(`${base_url}drivers`);
  return handleRes(res);
};

export const getDriverById = async (id: string) => {
  const res = await fetch(`${base_url}drivers/${id}`);
  return handleRes(res);
};

// Protected
export const createCab = async (data: any) => {
  const res = await fetch(`${base_url}cabs`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getMyCabs = async () => {
  const res = await fetch(`${base_url}cabs/my-cabs`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const cancelCab = async (id: string) => {
  const res = await fetch(`${base_url}cabs/${id}/cancel`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return res.json();
};

export const getMyDriverProfile = async () => {
  const res = await fetch(`${base_url}drivers/me/profile`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const updateDriverProfile = async (data: any) => {
  const res = await fetch(`${base_url}drivers/me/profile`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
};

export const toggleDriverAvailability = async (isAvailable: boolean) => {
  const res = await fetch(`${base_url}drivers/me/availability`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ isAvailable }),
  });
  return handleRes(res);
};
