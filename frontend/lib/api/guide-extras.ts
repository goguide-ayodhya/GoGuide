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
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const handleRes = async (res: Response) => handleApiResponse(res);

// ─── Guide: Get my review QR token ───────────────────────────────────────────
export const getMyReviewQRApi = async () => {
  const res = await fetch(`${base_url}review-qr/my-qr`, { headers: authHeaders() });
  return handleRes(res);
};

// ─── Public: Get guide info by token (for tourist review page) ────────────────
export const getGuideByTokenApi = async (token: string) => {
  const res = await fetch(`${base_url}review-qr/token/${token}`);
  if (!res.ok) throw new Error("Guide not found");
  const json = await res.json();
  return json.data;
};

// ─── Public: Submit a review via QR token ────────────────────────────────────
export const submitQRReviewApi = async (
  token: string,
  payload: { rating: number; comments: string; reviewerName?: string }
) => {
  const res = await fetch(`${base_url}review-qr/token/${token}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message || "Failed to submit review");
  }
  return res.json();
};

// ─── Messages: Get active admin messages ──────────────────────────────────────
export const getActiveMessagesApi = async () => {
  const res = await fetch(`${base_url}messages/active`, { headers: authHeaders() });
  return handleRes(res);
};

// ─── Messages: Mark notifications as read (reuses existing endpoint) ──────────
export const markAllNotificationsReadApi = async () => {
  const res = await fetch(`${base_url}notifications/read-all`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const getNotificationUnreadCountApi = async () => {
  const res = await fetch(`${base_url}notifications/unread-count`, { headers: authHeaders() });
  return handleRes(res);
};

export const getNotificationsApi = async (type?: string) => {
  const url = type ? `${base_url}notifications?type=${type}` : `${base_url}notifications`;
  const res = await fetch(url, { headers: authHeaders() });
  return handleRes(res);
};
