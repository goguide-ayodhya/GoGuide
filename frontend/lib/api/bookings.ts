import { handleApiResponse } from "./authErrorHandler";

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
    console.log("[API] Adding Authorization header, token length:", token.length);
  } else {
    console.warn("[API] No token found for request");
  }
  return headers;
};

// Create Booking
export const createBooking = async (data: any) => {
  const res = await fetch(`${base_url}bookings/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiResponse(res);
};

// My Bookings
export const getMyBookings = async () => {
  const res = await fetch(`${base_url}bookings/my-bookings`, {
    headers: authHeaders(),
  });

  return handleApiResponse(res);
};

// Guide Bookings
export const getGuideBookings = async () => {
  const res = await fetch(`${base_url}bookings/guide`, {
    headers: authHeaders(),
  });

  return handleApiResponse(res);
};

// Driver Bookings
export const getDriverBookings = async () => {
  const res = await fetch(`${base_url}bookings/driver`, {
    headers: authHeaders(),
  });

  return handleApiResponse(res);
};

// Get by ID
export const getBookingsById = async (bookingId: string) => {
  const res = await fetch(`${base_url}bookings/${bookingId}`, {
    headers: authHeaders(),
  });

  return handleApiResponse(res);
};

// Cancel
export const cancelBookingApi = async (bookingId: string, reason: string) => {
  const res = await fetch(`${base_url}bookings/${bookingId}/cancel`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ reason }),
  });

  return handleApiResponse(res);
};

// Guide Actions
export const acceptBookingApi = async (bookingId: string) => {
  console.log("[BOOKING-API] acceptBookingApi called with bookingId:", bookingId);
  const res = await fetch(`${base_url}bookings/${bookingId}/accept`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  return handleApiResponse(res);
};

export const rejectBookingApi = async (bookingId: string) => {
  console.log("[BOOKING-API] rejectBookingApi called with bookingId:", bookingId);
  const res = await fetch(`${base_url}bookings/${bookingId}/reject`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  return handleApiResponse(res);
};

export const completeBookingApi = async (bookingId: string) => {
  console.log("[BOOKING-API] completeBookingApi called with bookingId:", bookingId);
  const res = await fetch(`${base_url}bookings/${bookingId}/complete`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  return handleApiResponse(res);
};

export const startTourApi = async (bookingId: string) => {
  console.log("[BOOKING-API] startTourApi called with bookingId:", bookingId);
  const res = await fetch(`${base_url}bookings/${bookingId}/start-tour`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  return handleApiResponse(res);
};

// Admin
export const seenBooking = async (bookingId: string) => {
  const res = await fetch(`${base_url}bookings/${bookingId}/seen`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  return handleApiResponse(res);
};

// Public: get total bookings count
export const getTotalBookingsCount = async () => {
  const res = await fetch(`${base_url}bookings/count`);
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || "Failed to fetch bookings count");
  }
  const json = await res.json();
  // Support either { data: { count } } or { count }
  if (json.data && typeof json.data.count === "number") return json.data.count;
  if (typeof json.count === "number") return json.count;
  return Number(json) || 0;
};
