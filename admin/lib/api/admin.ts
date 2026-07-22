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
export const getUsersApi = async (
  role?: string,
  status?: string,
  search?: string,
  verification?: string,
  page: number = 1,
  limit: number = 20
) => {
  const params = new URLSearchParams();
  if (role && role !== "all") params.set("role", role);
  if (status && status !== "all") params.set("status", status);
  if (search) params.set("search", search);
  if (verification && verification !== "all") params.set("verification", verification);
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const url = `${base_url}admin/users${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, {
    headers: authHeaders(),
  });

  return handleResOrError(res);
};

// Get User Detail
export const getUserDetailApi = async (id: string) => {
  const res = await fetch(`${base_url}admin/users/${id}`, {
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
export const suspendUserApi = async (id: string, duration?: string) => {
  const res = await fetch(`${base_url}admin/users/${id}/suspend`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ duration }),
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

// Mark user as viewed
export const markUserAsViewedApi = async (id: string) => {
  const res = await fetch(`${base_url}admin/users/${id}/viewed`, {
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

// Get all cab bookings for admin
export const getAllCabBookingsApi = async () => {
  const res = await fetch(`${base_url}cab-bookings/admin/all`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

// Update status of cab booking
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

// Admin Cab Locations CRUD
export const getCabLocationsAdminApi = async () => {
  const res = await fetch(`${base_url}cab-bookings/locations`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const createCabLocationApi = async (data: any) => {
  const res = await fetch(`${base_url}cab-bookings/admin/locations`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleRes(res);
};

export const updateCabLocationApi = async (id: string, data: any) => {
  const res = await fetch(`${base_url}cab-bookings/admin/locations/${id}`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleRes(res);
};

export const deleteCabLocationApi = async (id: string) => {
  const res = await fetch(`${base_url}cab-bookings/admin/locations/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleRes(res);
};

// Admin Cab Categories CRUD
export const getCabCategoriesAdminApi = async () => {
  const res = await fetch(`${base_url}cab-bookings/categories`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const createCabCategoryApi = async (data: any) => {
  const res = await fetch(`${base_url}cab-bookings/admin/categories`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleRes(res);
};

export const updateCabCategoryApi = async (id: string, data: any) => {
  const res = await fetch(`${base_url}cab-bookings/admin/categories/${id}`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleRes(res);
};

export const deleteCabCategoryApi = async (id: string) => {
  const res = await fetch(`${base_url}cab-bookings/admin/categories/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleRes(res);
};

// Admin Route Pricing CRUD
export const getCabRoutePricesApi = async () => {
  const res = await fetch(`${base_url}cab-bookings/admin/prices`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const createCabRoutePriceApi = async (data: any) => {
  const res = await fetch(`${base_url}cab-bookings/admin/prices`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleRes(res);
};

export const updateCabRoutePriceApi = async (id: string, data: any) => {
  const res = await fetch(`${base_url}cab-bookings/admin/prices/${id}`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleRes(res);
};

export const deleteCabRoutePriceApi = async (id: string) => {
  const res = await fetch(`${base_url}cab-bookings/admin/prices/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleRes(res);
};

// Admin Tax Config APIs
export const getCabTaxApi = async () => {
  const res = await fetch(`${base_url}cab-bookings/admin/tax`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const updateCabTaxApi = async (taxPercent: number) => {
  const res = await fetch(`${base_url}cab-bookings/admin/tax`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ taxPercent }),
  });
  return handleRes(res);
};

// Admin Additional Charges APIs
export const getCabAdditionalChargesAdminApi = async () => {
  const res = await fetch(`${base_url}cab-bookings/admin/additional-charges`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const updateCabAdditionalChargesApi = async (wheelchairCharge: number, medicalSupportCharge: number) => {
  const res = await fetch(`${base_url}cab-bookings/admin/additional-charges`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ wheelchairCharge, medicalSupportCharge }),
  });
  return handleRes(res);
};

export const confirmCabPaymentApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}cab-bookings/${bookingId}/confirm-payment`, {
    method: "PATCH",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
  });
  return handleRes(res);
};