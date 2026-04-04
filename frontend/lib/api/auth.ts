const base_url = process.env.NEXT_PUBLIC_BASE_URL;
import { LoginData, SignupData } from "@/contexts/AuthContext";

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

// Login
export const loginUser = async (data: LoginData) => {
  const res = await fetch(`${base_url}auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Login failed");

  return json.data;
};

// Signup
export const signupUser = async (data: SignupData) => {
  const form = new FormData();

  form.append("name", data.name);
  form.append("email", data.email);
  form.append("password", data.password);
  form.append("role", data.role);

  if (data.phone) form.append("phone", data.phone);
  if (data.avatar) form.append("avatar", data.avatar);

  const res = await fetch(`${base_url}auth/signup`, {
    method: "POST",
    body: form,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Signup failed");

  return json.data;
};

// Logout
export const logoutUser = async () => {
  const res = await fetch(`${base_url}auth/logout`, {
    method: "POST",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Logout failed");
};

// Logout All
export const logoutAllUsers = async () => {
  const res = await fetch(`${base_url}auth/logoutall`, {
    method: "POST",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Logout all failed");
};

export const validateTokenApi = async () => {
  const headers = authHeaders();

  const res = await fetch(`${base_url}auth/validate-token`, {
    method: "POST",
    headers,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error("Validate Token Failed");
  }
  return json.data;
};

// Change Password
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const res = await fetch(`${base_url}auth/change-password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message);

  return json.data;
};
