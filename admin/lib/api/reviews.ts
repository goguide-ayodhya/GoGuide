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
  if (!res.ok) throw new Error(json.message || "Review API error");
  return json.data;
};

// Create
export const createReviewApi = async (bookingId: string, data: any) => {
  const res = await fetch(`${base_url}reviews/booking/${bookingId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  return handleRes(res);
};

// Guide Reviews
export const getGuideReviewsApi = async (guideId: string) => {
  const res = await fetch(`${base_url}reviews/guide/${guideId}`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

// Driver Reviews
export const getDriverReviewsApi = async (driverId: string) => {
  const res = await fetch(`${base_url}reviews/driver/${driverId}`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

// Booking Review
export const getBookingReviewApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}reviews/booking/${bookingId}`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

// Update
export const updateReviewApi = async (reviewId: string, data: any) => {
  const res = await fetch(`${base_url}reviews/${reviewId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  return handleRes(res);
};

// Delete
export const deleteReviewApi = async (reviewId: string) => {
  const res = await fetch(`${base_url}reviews/${reviewId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message);

  return true;
};
