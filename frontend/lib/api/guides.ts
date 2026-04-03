const base_url = process.env.NEXT_PUBLIC_BASE_URL;

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

const handleRes = async (res: Response) => {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "API error");
  return json.data;
};

// Public
export const getAllGuides = async () => {
  const res = await fetch(`${base_url}guides`);
  return handleRes(res);
};

// Protected
export const getGuideProfile = async () => {
  const res = await fetch(`${base_url}guides/me`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const getGuideById = async (id: string) => {
  const res = await fetch(`${base_url}guides/${id}`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const updateGuide = async (data: any) => {
  const res = await fetch(`${base_url}guides/me`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  return handleRes(res);
};

// Availability
export const setAvailabilityApi = async (isAvailable: boolean) => {
  const res = await fetch(`${base_url}guides/me/availability`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ isAvailable }),
  });

  return handleRes(res);
};

// Online
export const setOnlineStatusApi = async (isOnline: boolean) => {
  const res = await fetch(`${base_url}guides/me/online-status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ isOnline }),
  });

  return handleRes(res);
};

// ADMIN
export const verifyGuide = async (id: string) => {
  const res = await fetch(`${base_url}guides/${id}/verify`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const rejectGuide = async (id: string) => {
  const res = await fetch(`${base_url}guides/${id}/reject`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  return handleRes(res);
};
