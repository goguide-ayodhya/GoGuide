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
  }
  return headers;
};

const handleRes = async (res: Response) => {
  const json = await res.json();
  if (!res.ok) {
    const error = new Error(json.message || "API error");
    (error as any).errors = json.errors;
    throw error;
  }
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
export const cancelBookingApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}bookings/${bookingId}/cancel`, {
    method: "PATCH",
    headers: authHeaders(),
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

// Admin
export const seenBooking = async (bookingId: string) => {
  const res = await fetch(`${base_url}bookings/${bookingId}/seen`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  return handleRes(res);
};
