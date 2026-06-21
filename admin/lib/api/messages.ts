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

const jsonHeaders = () => ({
  ...authHeaders(),
  "Content-Type": "application/json",
});

const handleRes = async (res: Response) => {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "API error");
  return json.data || json;
};

export interface AdminMessage {
  _id?: string;
  title: string;
  description: string;
  priority: "normal" | "important";
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const listMessagesApi = async (): Promise<AdminMessage[]> => {
  const res = await fetch(`${base_url}messages`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const createMessageApi = async (message: AdminMessage): Promise<AdminMessage> => {
  const res = await fetch(`${base_url}messages`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(message),
  });
  return handleRes(res);
};

export const updateMessageApi = async (id: string, message: AdminMessage): Promise<AdminMessage> => {
  const res = await fetch(`${base_url}messages/${id}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(message),
  });
  return handleRes(res);
};

export const deleteMessageApi = async (id: string): Promise<{ success: boolean }> => {
  const res = await fetch(`${base_url}messages/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleRes(res);
};
