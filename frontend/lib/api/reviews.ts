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
  }
  return headers;
};

// ─── Website Reviews (Public) ────────────────────────────────────────────────
export const createWebsiteReviewApi = async (data: any) => {
  const res = await fetch(`${base_url}reviews/website`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleApiResponse(res);
};

export const getWebsiteReviewsApi = async (limit = 10) => {
  const res = await fetch(`${base_url}reviews/website?limit=${limit}`);
  return handleApiResponse(res);
};

export const getWebsiteStatsApi = async () => {
  const res = await fetch(`${base_url}reviews/website/stats`);
  return handleApiResponse(res);
};

// ─── Public Lists & Actions (Helpful / Report) ───────────────────────────────
export const getReviewsAdminApi = async (params: Record<string, any> = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      query.append(key, String(val));
    }
  });
  const res = await fetch(`${base_url}reviews?${query.toString()}`);
  return handleApiResponse(res);
};

export const toggleHelpfulApi = async (reviewId: string, type: "website" | "guide") => {
  const res = await fetch(`${base_url}reviews/${reviewId}/helpful?type=${type}`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleApiResponse(res);
};

export const reportReviewApi = async (reviewId: string, type: "website" | "guide", reason: string) => {
  const res = await fetch(`${base_url}reviews/${reviewId}/report?type=${type}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ reason }),
  });
  return handleApiResponse(res);
};

// ─── Public Image Upload ─────────────────────────────────────────────────────
export const uploadReviewImagesApi = async (formData: FormData) => {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${base_url}reviews/upload`, {
    method: "POST",
    headers,
    body: formData,
  });
  return handleApiResponse(res);
};

// ─── Guide/Driver Reviews (Auth Required) ────────────────────────────────────
export const createReviewApi = async (bookingId: string, data: any) => {
  const res = await fetch(`${base_url}reviews/booking/${bookingId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleApiResponse(res);
};

export const getGuideReviewsApi = async (guideId: string) => {
  const res = await fetch(`${base_url}reviews/guide/${guideId}`, {
    headers: authHeaders(),
  });
  return handleApiResponse(res);
};

export const getDriverReviewsApi = async (driverId: string) => {
  const res = await fetch(`${base_url}reviews/driver/${driverId}`, {
    headers: authHeaders(),
  });
  return handleApiResponse(res);
};

export const getBookingReviewApi = async (bookingId: string) => {
  const res = await fetch(`${base_url}reviews/booking/${bookingId}`, {
    headers: authHeaders(),
  });
  return handleApiResponse(res);
};

// ─── Update/Delete (Owner/Admin) ─────────────────────────────────────────────
export const updateReviewApi = async (reviewId: string, data: any) => {
  const res = await fetch(`${base_url}reviews/${reviewId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleApiResponse(res);
};

export const deleteReviewApi = async (reviewId: string, type: "website" | "guide" = "guide") => {
  const res = await fetch(`${base_url}reviews/${reviewId}?type=${type}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await handleApiResponse(res, { allowEmpty: true });
  return true;
};
