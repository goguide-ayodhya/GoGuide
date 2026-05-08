const base_url = process.env.NEXT_PUBLIC_BASE_URL;
import { LoginData, SignupData, User } from "@/contexts/AuthContext";
import { isAuthError, handleAuthError } from "./authErrorHandler";

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
    console.log(
      "[AUTH-API] Adding Authorization header, token length:",
      token.length,
    );
  } else {
    console.warn("[AUTH-API] No token found for request");
  }
  return headers;
};

// Send OTP
export const sendOtp = async (email: string) => {
  const res = await fetch(`${base_url}auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to send OTP");

  return json.data;
};

// Verify Email
export const verifyEmail = async (email: string, otp: string) => {
  const res = await fetch(`${base_url}auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Email verification failed");

  return json.data;
};

// Forgot Password
export const forgotPassword = async (identifier: string) => {
  const res = await fetch(`${base_url}auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to send reset link");

  return json.data;
};

// Reset Password
export const resetPassword = async (
  identifier: string,
  otp: string,
  newPassword: string,
) => {
  const res = await fetch(`${base_url}auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, otp, newPassword }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Password reset failed");

  return json.data;
};

const parseResponse = async (res: Response) => {
  const text = await res.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

export const signupUser = async (data: SignupData) => {
  const hasFiles = data.avatar || data.profileImage || data.certificates;

  if (!hasFiles) {
    const res = await fetch(`${base_url}auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role,
      }),
    });

    const json = await parseResponse(res);
    if (!res.ok) {
      throwAuthAwareError(json.message, json.errors, res.status);
    }

    return json.data;
  }

  // FormData
  const form = new FormData();

  form.append("name", data.name);
  form.append("email", data.email || "");
  form.append("password", data.password);
  form.append("role", data.role);
  form.append("phone", data.phone);

  if (data.avatar) form.append("avatar", data.avatar);

  // GUIDE only
  if (data.specialities) {
    data.specialities.forEach((spec) => form.append("specialities", spec));
  }

  if (data.locations) {
    data.locations.forEach((loc) => form.append("locations", loc));
  }

  if (data.certificates) {
    data.certificates.forEach((cert) => {
      if (cert instanceof File) {
        form.append("certificates", cert);
      }
    });
  }

  const res = await fetch(`${base_url}auth/signup`, {
    method: "POST",
    body: form,
  });

  const json = await parseResponse(res);
  if (!res.ok) {
    throwAuthAwareError(json.message, json.errors, res.status);
  }

  return json.data;
};

export const logoutUser = async () => {
  const res = await fetch(`${base_url}auth/logout`, {
    method: "POST",
    headers: authHeaders(),
  });

  if (!res.ok) {
    if (isAuthError(res.status)) {
      handleAuthError({ message: "Logout failed due to invalid or expired session", statusCode: res.status });
    }
    throw new Error("Logout failed");
  }
};

// Logout All
export const logoutAllUsers = async () => {
  const res = await fetch(`${base_url}auth/logoutall`, {
    method: "POST",
    headers: authHeaders(),
  });

  if (!res.ok) {
    if (isAuthError(res.status)) {
      handleAuthError({ message: "Logout all failed due to invalid or expired session", statusCode: res.status });
    }
    throw new Error("Logout all failed");
  }
};

export const validateTokenApi = async () => {
  const headers = authHeaders();

  const res = await fetch(`${base_url}auth/validate-token`, {
    headers,
  });

  const json = await res.json();
  if (!res.ok) {
    throwAuthAwareError(
      json.message || "Validate Token Failed",
      json.errors,
      res.status,
    );
  }
  return json.data;
};

export const getMe = async () => {
  const res = await fetch(`${base_url}auth/me`, {
    headers: authHeaders(),
  });

  const json = await res.json();
  if (!res.ok) {
    throwAuthAwareError(json.message || "Failed to fetch user", json.errors, res.status);
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
      throwAuthAwareError(
        errorMessages || json.message,
        json.errors,
        res.status,
      );
    }
    throwAuthAwareError(json.message || "Change password failed", undefined, res.status);
  }

  return json.data;
};

// Send OTP API
export const sendOtpApi = async (data: { email: string }) => {
  const res = await fetch(`${base_url}auth/send-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to send OTP");

  return json.data;
};

// Verify Email OTP API
export const verifyEmailOtp = async (data: { email: string; otp: string }) => {
  const res = await fetch(`${base_url}auth/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Invalid or expired OTP");

  return json.data;
};

export class ApiError extends Error {
  constructor(
    public message: string,
    public fieldErrors?: Record<string, string>,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Helper function to throw ApiError and check for auth errors
 * If auth error detected, triggers automatic logout and redirect
 */
function throwAuthAwareError(message: string, errors?: Record<string, string>, statusCode?: number) {
  // Check if this is an auth error and handle accordingly
  if (isAuthError(statusCode, message)) {
    console.warn("[AUTH-API] Authentication error detected, triggering logout");
    handleAuthError({ message, statusCode });
  }
  
  throw new ApiError(message, errors, statusCode);
}

export const loginWithGoogle = async (payload: { idToken: string }) => {
  const res = await fetch(`${base_url}auth/google/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await parseResponse(res);
  if (!res.ok) {
    throwAuthAwareError(json.message || "Google login failed", json.errors, res.status);
  }
  if (!json?.data) {
    throw new Error("Invalid Google login response");
  }
  return json.data;
};

export const signupWithGoogle = async (payload: {
  idToken: string;
  role: string;
}) => {
  const res = await fetch(`${base_url}auth/google/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await parseResponse(res);
  if (!res.ok) {
    throwAuthAwareError(json.message || "Google signup failed", json.errors, res.status);
  }
  if (!json?.data) {
    throw new Error("Invalid Google signup response");
  }
  return json.data;
};

export const loginUser = async (payload: {
  identifier: string;
  password: string;
}) => {
  const res = await fetch(`${base_url}auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  console.log("payload", payload);

  const result = await res.json();
  if (!res.ok) {
    // Throw custom error with field-level errors if available
    throwAuthAwareError(
      result?.message || "Login failed",
      result?.errors,
      res.status,
    );
  }
  if (!result?.data) {
    throw new Error("Invalid login response");
  }
  return result.data;
};
