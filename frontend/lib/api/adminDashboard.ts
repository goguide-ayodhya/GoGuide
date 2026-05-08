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
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// PUBLIC
export const getPublicStats = async () => {
  const res = await fetch(`${base_url}adminDashboard/public/stats`);
  return handleApiResponse(res);
};

// ADMIN
export const getAdminDashboard = async () => {
  const res = await fetch(`${base_url}adminDashboard/admin`, {
    headers: authHeaders(),
  });
  return handleApiResponse(res);
};

// GUIDE
export const getGuideDashboard = async () => {
  const res = await fetch(`${base_url}adminDashboard/guide`, {
    headers: authHeaders(),
  });
  return handleApiResponse(res);
};

// USER
export const getUserDashboard = async () => {
  const res = await fetch(`${base_url}adminDashboard/user`, {
    headers: authHeaders(),
  });
  return handleApiResponse(res);
};