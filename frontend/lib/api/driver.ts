import { handleApiResponse } from "./authErrorHandler";

const base_url = process.env.NEXT_PUBLIC_BASE_URL

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
  
  console.log("[DRIVER-API] Token check:", {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    tokenStart: token?.substring(0, 20) + "..." || "null",
    localStorageToken: typeof window !== "undefined" ? localStorage.getItem("token")?.substring(0, 20) + "..." : "undefined"
  });
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log("[DRIVER-API] Authorization header added:", {
      headerLength: headers.Authorization.length,
      headerStart: headers.Authorization.substring(0, 30) + "..."
    });
  } else {
    console.error("[DRIVER-API] CRITICAL: No token found for request - localStorage empty or invalid");
  }
  return headers;
};


// Public
export const getAllDrivers = async () => {
  const res = await fetch(`${base_url}drivers`);
  return handleApiResponse(res);
};

export const getDriverById = async (id: string) => {
  const res = await fetch(`${base_url}drivers/${id}`);
  return handleApiResponse(res);
};

// Protected
export const createDriverProfile = async (data: any) => {
  console.log("[DRIVER-API] createDriverProfile called");
  const headers = authHeaders();

  if (!headers.Authorization) {
    console.error("[DRIVER-API] CRITICAL: No Authorization header in createDriverProfile");
    throw new Error("Authentication required for driver profile creation");
  }

  // ✅ HANDLE FORM DATA CORRECTLY
  if (data instanceof FormData) {
    delete headers["Content-Type"]; // VERY IMPORTANT
    console.log("[DRIVER-API] Sending driver create-profile FormData entries:", [...data.entries()]);
    console.log("[DRIVER-API] Request headers:", Object.keys(headers));

    const res = await fetch(`${base_url}drivers/create-profile`, {
      method: "POST",
      headers,
      body: data,
    });

    console.log("[DRIVER-API] createProfile response status:", res.status);
    return handleApiResponse(res);
  }

  // fallback (JSON)
  const res = await fetch(`${base_url}drivers/create-profile`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  console.log("[DRIVER-API] createProfile response status:", res.status);
  return handleApiResponse(res);
};

export const getMyDriverProfile = async () => {
  const res = await fetch(`${base_url}drivers/me/profile`, {
    headers: authHeaders(),
  });
  return handleApiResponse(res);
};

export const updateDriverProfile = async (data: any) => {
  console.log("[DRIVER-API] updateDriverProfile called");
  const headers = authHeaders();

  if (!headers.Authorization) {
    console.error("[DRIVER-API] CRITICAL: No Authorization header in updateDriverProfile");
    throw new Error("Authentication required for driver profile update");
  }

  if (data instanceof FormData) {
    delete headers["Content-Type"];
    console.log("[DRIVER-API] Sending driver update-profile FormData entries:", [...data.entries()]);
    console.log("[DRIVER-API] Request headers:", Object.keys(headers));

    const res = await fetch(`${base_url}drivers/me/profile`, {
      method: "PUT",
      headers,
      body: data,
    });

    console.log("[DRIVER-API] updateProfile response status:", res.status);
    return handleApiResponse(res);
  }

  const hasFile = data.avatar || data.driverPhoto || data.driverLicenseImages || 
    (data.driverLicenseImages && Array.isArray(data.driverLicenseImages)) ||
    (data.driverLicense && Array.isArray(data.driverLicense));

  if (hasFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === "driverLicenseImages" && Array.isArray(value)) {
        value.forEach((item) => {
          if (item instanceof File) {
            formData.append(`driverLicense`, item);
          } else if (typeof item === "string") {
            formData.append(`existingLicenseImages`, item);
          }
        });
      } else if (key === "languages" && Array.isArray(value)) {
        // Send languages as JSON string for proper parsing on backend
        formData.append(key, JSON.stringify(value));
      } else if (Array.isArray(value)) {
        value.forEach(item => {
          formData.append(key, String(item));
        });
      } else if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    });

    delete headers["Content-Type"];
    console.log("[DRIVER-API] FormData being sent with languages:", data.languages);

    const res = await fetch(`${base_url}drivers/me/profile`, {
      method: "PUT",
      headers,
      body: formData,
    });

    return handleApiResponse(res);
  }

  const res = await fetch(`${base_url}drivers/me/profile`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  return handleApiResponse(res);
};

export const toggleDriverAvailability = async (isAvailable: boolean) => {
  const res = await fetch(`${base_url}drivers/me/availability`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ isAvailable }),
  });
  return handleApiResponse(res);
};
