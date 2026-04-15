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
  if (data.email) form.append("email", data.email);
  form.append("password", data.password);
  form.append("role", data.role);

  if (data.phone) form.append("phone", data.phone);
  if (data.avatar) form.append("avatar", data.avatar);
  if (data.speciality) form.append("speciality", data.speciality);
  if (data.hourlyRate) form.append("hourlyRate", data.hourlyRate);
  if (data.experience) form.append("experience", data.experience);
  if (data.languages) {
    data.languages.forEach((lang) => form.append("languages", lang));
  }
  if (data.vehicleType) form.append("vehicleType", data.vehicleType);
  if (data.vehicleName) form.append("vehicleName", data.vehicleName);
  if (data.vehicleNumber) form.append("vehicleNumber", data.vehicleNumber);
  if (data.pricePerKm) form.append("pricePerKm", data.pricePerKm);
  if (data.seats) form.append("seats", data.seats);
  if (data.driverPhoto) form.append("driverPhoto", data.driverPhoto);
  if (data.vehiclePhoto) form.append("vehiclePhoto", data.vehiclePhoto);
  if (data.profileImage) form.append("profileImage", data.profileImage);
  form.append("driverAadhar", data.driverAadhar || "");

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
    headers,
  });

  const json = await res.json();
  console.log("STATUS:", res.status);
  console.log("RESPONSE:", json);

  if (!res.ok) {
    throw new Error("Validate Token Failed");
  }
  return json.data;
};

// Change Password
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const res = await fetch(`${base_url}auth/change-password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) {
    // Handle validation errors
    if (json.errors) {
      const errorMessages = Object.values(json.errors).join(", ");
      throw new Error(errorMessages || json.message);
    }
    throw new Error(json.message);
  }

  return json.data;
};
