const base_url = process.env.NEXT_PUBLIC_BASE_URL;
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const createBooking = async (data: any) => {
  const res = await fetch(`${base_url}bookings/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();

  if (!res.ok) {
    console.log("Booking API Error:", json);
    throw new Error(json.message || "Booking failed");
  }

  return json;
};

export const getMyBookings = async () => {
  const res = await fetch(`${base_url}bookings/my-bookings`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const json = await res.json();
  return json.data;
};

export const getGuideBookings = async (guideId: string) => {
  const res = await fetch(`${base_url}bookings/guide`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const json = await res.json();
  return json.data;
};

export const getBookingsById = async (bookingId: string) => {
  const res = await fetch(`${base_url}bookings/${bookingId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const json = await res.json();
  return json.data;
};

export const cancelBookingApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}bookings/${bookingId}/cancel`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const json = await res.json();
  return json.data;
};

export const acceptBookingApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}bookings/${bookingId}/accept`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const json = await res.json();
  return json.data;
};

export const rejectBookingApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}bookings/${bookingId}/reject`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const json = await res.json();
  return json.data;
};

export const completeBookingApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}bookings/${bookingId}/complete`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const json = await res.json();
  return json.data;
};

// ---------------------- For Admin ----------------------

export const seenBooking = async (bookingId: string) => {
  const res = await fetch(`${base_url}bookings/${bookingId}/seen`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const json = await res.json();
  return json.data;
};
