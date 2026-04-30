const base_url = process.env.NEXT_PUBLIC_BASE_URL;

const getToken = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") return null;
  return token;
};

type CancelBookingResponse = {
  refundAmount: number;
};

const authHeaders = () => {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleRes = async (res: Response) => {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Unable to complete booking");
  return json.data;
};

// Create Booking
export const createBooking = async (data: any) => {
  const res = await fetch(`${base_url}bookings/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  return handleRes(res);
};

// My Bookings
export const getMyBookings = async () => {
  const res = await fetch(`${base_url}bookings/my-bookings`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

// Guide Bookings
export const getGuideBookings = async () => {
  const res = await fetch(`${base_url}bookings/guide`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

// Driver Bookings
export const getDriverBookings = async () => {
  const res = await fetch(`${base_url}bookings/driver`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

// Get by ID
export const getBookingsById = async (bookingId: string) => {
  const res = await fetch(`${base_url}bookings/${bookingId}`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

// Cancel
export const cancelBookingApi = async (
  bookingId: string,
  reason: string,
): Promise<CancelBookingResponse> => {
  const res = await fetch(`${base_url}bookings/${bookingId}/cancel`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ reason }),
  });

  return handleRes(res);
};

// Guide Actions
export const acceptBookingApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}bookings/${bookingId}/accept`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const rejectBookingApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}bookings/${bookingId}/reject`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const completeBookingApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}bookings/${bookingId}/complete`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const refundBookingApi = async (bookingId: string, reason?: string) => {
  const res = await fetch(
    `${base_url}payments/booking/${bookingId}/refund/cancellation`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ reason: reason || "Admin refund" }),
    },
  );

  return handleRes(res);
};

// Admin - Get All Bookings
export const getAllBookings = async (filters?: {
  status?: string;
  paymentStatus?: string;
  dateRange?: string;
  search?: string;
}) => {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== "all")
    params.append("status", filters.status);
  if (filters?.paymentStatus && filters.paymentStatus !== "all")
    params.append("paymentStatus", filters.paymentStatus);
  if (filters?.dateRange && filters.dateRange !== "all")
    params.append("dateRange", filters.dateRange);
  if (filters?.search) params.append("search", filters.search);

  const url = `${base_url}bookings/admin/all${params.toString() ? "?" + params.toString() : ""}`;
  const res = await fetch(url, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

// Admin - Mark as Seen
export const seenBooking = async (bookingId: string) => {
  const res = await fetch(`${base_url}bookings/${bookingId}/seen`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  return handleRes(res);
};

// Admin - Accept Package Booking
export const adminAcceptBookingApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}bookings/${bookingId}/admin-accept`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  return handleRes(res);
};
