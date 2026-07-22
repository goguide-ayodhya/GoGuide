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

// Get Cab Locations
export const getCabLocationsApi = async () => {
  const res = await fetch(`${base_url}cab-bookings/locations`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

// Get Cab Categories
export const getCabCategoriesApi = async () => {
  const res = await fetch(`${base_url}cab-bookings/categories`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

// Calculate Cab Booking Price
export const calculateCabPriceApi = async (
  pickupLocationId: string,
  dropLocationId: string,
  carCategoryId: string,
  wheelchair = false,
  medicalSupport = false
) => {
  const query = new URLSearchParams({
    pickupLocationId,
    dropLocationId,
    carCategoryId,
    wheelchair: String(wheelchair),
    medicalSupport: String(medicalSupport),
  }).toString();
  const res = await fetch(`${base_url}cab-bookings/price?${query}`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

// Reschedule Cab Booking
export const rescheduleCabBookingApi = async (
  bookingId: string,
  startDate: string,
  pickupTime: string
) => {
  const res = await fetch(`${base_url}cab-bookings/${bookingId}/reschedule`, {
    method: "PATCH",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ startDate, pickupTime }),
  });
  return handleRes(res);
};

// Get Cab Additional Charges
export const getCabAdditionalChargesApi = async () => {
  const res = await fetch(`${base_url}cab-bookings/additional-charges`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};
