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
  return json.data;
};

const handleResOrError = async (res: Response) => {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `API Error: ${res.statusText}`);
  }
  return json;
};

// Get Users
export const getUsersApi = async (role?: string, status?: string, search?: string) => {
  const params = new URLSearchParams();
  if (role && role !== "all") params.set("role", role);
  if (status && status !== "all") params.set("status", status);
  if (search) params.set("search", search);

  const url = `${base_url}admin/users${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, {
    headers: authHeaders(),
  });

  return handleResOrError(res);
};

// Block
export const blockUserApi = async (id: string) => {
  const res = await fetch(`${base_url}admin/users/${id}/block`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResOrError(res);
};

// Activate
export const activateUserApi = async (id: string) => {
  const res = await fetch(`${base_url}admin/users/${id}/activate`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResOrError(res);
};

// Suspend
export const suspendUserApi = async (id: string) => {
  const res = await fetch(`${base_url}admin/users/${id}/suspend`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResOrError(res);
};

// Verify guide
export const verifyUserApi = async (id: string) => {
  const res = await fetch(`${base_url}admin/users/${id}/verify`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResOrError(res);
};

// Unverify guide
export const unverifyUserApi = async (id: string) => {
  const res = await fetch(`${base_url}admin/users/${id}/unverify`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResOrError(res);
};

// Delete
export const deleteUserApi = async (id: string) => {
  const res = await fetch(`${base_url}admin/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResOrError(res);
};

// Get all cabs for admin
export const getAllCabsApi = async () => {
  const res = await fetch(`${base_url}drivers/admin/all`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

// Get cab pricing (or default if not available)
export const getCabPricingApi = async () => {
  const res = await fetch(`${base_url}settings/cab-pricing`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

// Update cab pricing
export const updateCabPricingApi = async (pricing: { baseFare: number; pricePerKm: number }) => {
  const res = await fetch(`${base_url}settings/cab-pricing`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pricing),
  });
  return handleRes(res);
};