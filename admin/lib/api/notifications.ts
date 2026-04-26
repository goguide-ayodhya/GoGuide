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
  if (!res.ok) throw new Error(json.message || "API error");
  return json;
};

export const getNotificationsApi = async (opts?: { unreadOnly?: boolean; page?: number; limit?: number }) => {
  const params = new URLSearchParams();
  if (opts?.unreadOnly) params.set("unreadOnly", "true");
  if (opts?.page) params.set("page", String(opts.page));
  if (opts?.limit) params.set("limit", String(opts.limit));

  const url = `${base_url}notifications${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { headers: authHeaders() });
  return handleResOrError(res);
};

export const getUnreadCountApi = async () => {
  const res = await fetch(`${base_url}notifications/unread-count`, { headers: authHeaders() });
  return handleRes(res);
};

export const markAsReadApi = async (id: string) => {
  const res = await fetch(`${base_url}notifications/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResOrError(res);
};

export const markAllAsReadApi = async () => {
  const res = await fetch(`${base_url}notifications/read-all`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResOrError(res);
};

export const deleteNotificationApi = async (id: string) => {
  const res = await fetch(`${base_url}notifications/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResOrError(res);
};

export const deleteAllApi = async () => {
  const res = await fetch(`${base_url}notifications`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResOrError(res);
};
