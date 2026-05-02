const base_url = process.env.NEXT_PUBLIC_BASE_URL;
import { LoginData, SignupData, User } from "@/contexts/AuthContext";

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
      throw new ApiError(json.message, json.errors, res.status);
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
    throw new ApiError(json.message, json.errors, res.status);
  }

  return json.data;
};

// Signup
// export const signupUser = async (data: SignupData) => {
//   const hasFiles =
//     data.avatar ||
//     data.profileImage ||
//     data.certificates ||
//     data.driverPhoto ||
//     data.vehiclePhoto;

//   if (!hasFiles) {
//     // Send as JSON
//     const res = await fetch(`${base_url}auth/signup`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     });

//     const json = await parseResponse(res);
//     if (!res.ok) {
//       throw new ApiError(
//         json.message || `Signup failed with status ${res.status}`,
//         json.errors,
//         res.status,
//       );
//     }

//     return json.data;
//   }

//   // Send as FormData
//   const form = new FormData();
//   const { email } = data;

//   form.append("name", data.name);
//   form.append("email", email || "");
//   form.append("password", data.password);
//   form.append("role", data.role);

//   if (data.phone) form.append("phone", data.phone);
//   if (data.avatar) form.append("avatar", data.avatar);

//   // Updated fields for guides
//   if (data.specialities) {
//     data.specialities.forEach((spec) => form.append("specialities", spec));
//   }
//   if (data.price) form.append("price", data.price.toString());
//   if (data.duration) form.append("duration", data.duration);
//   if (data.locations) {
//     data.locations.forEach((loc) => form.append("locations", loc));
//   }
//   if (data.certificates && Array.isArray(data.certificates)) {
//     data.certificates.forEach((cert) => {
//       if (cert instanceof File) {
//         form.append("certificates", cert);
//       } else if (
//         cert &&
//         typeof cert === "object" &&
//         "image" in cert &&
//         cert.image instanceof File
//       ) {
//         form.append("certificates", cert.image);
//       }
//     });
//   }

//   // Driver fields
//   if (data.vehicleType) form.append("vehicleType", data.vehicleType);
//   if (data.vehicleName) form.append("vehicleName", data.vehicleName);
//   if (data.vehicleNumber) form.append("vehicleNumber", data.vehicleNumber);
//   if (data.seats) form.append("seats", data.seats);
//   if (data.driverPhoto) form.append("driverPhoto", data.driverPhoto);
//   if (data.vehiclePhoto) form.append("vehiclePhoto", data.vehiclePhoto);
//   if (data.driverLicenseName)
//     form.append("driverLicenseName", data.driverLicenseName);
//   if (data.driverLicenseImage)
//     form.append("driverLicense", data.driverLicenseImage);
//   if (data.profileImage) form.append("profileImage", data.profileImage);

//   console.log("SIGNUP PAYLOAD:", data);

//   const res = await fetch(`${base_url}auth/signup`, {
//     method: "POST",
//     body: form,
//   });

//   console.log("SIGNUP PAYLOAD:", data);
//   const json = await parseResponse(res);
//   if (!res.ok) {
//     throw new ApiError(
//       json.message || `Signup failed with status ${res.status}`,
//       json.errors,
//       res.status,
//     );
//   }

//   return json.data;
// };

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
  if (!res.ok) {
    throw new ApiError(
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
    throw new Error(json.message || "Failed to fetch user");
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
    throw new ApiError(
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
