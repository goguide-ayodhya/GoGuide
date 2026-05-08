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

export const sendSupportMessageApi = async (message: string) => {
  const res = await fetch(`${base_url}support/send`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ message }),
  });

  return handleApiResponse(res);
};

// Profile
export const getProfile = async () => {
  const res = await fetch(`${base_url}settings/me`, {
    headers: authHeaders(),
  });
  // Check for auth errors and handle accordingly (401, expired tokens, etc.)
  return handleApiResponse(res);
};

export const updateProfile = async (data: any) => {
  const res = await fetch(`${base_url}settings/me`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  // Check for auth errors and handle accordingly (401, expired tokens, etc.)
  return handleApiResponse(res);
};
