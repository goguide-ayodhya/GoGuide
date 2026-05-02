const base_url = process.env.NEXT_PUBLIC_BASE_URL?.trim() || "/api/";
const apiBaseUrl = base_url.endsWith("/") ? base_url : `${base_url}/`;

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
    console.log("[DRIVER-API] Adding Authorization header, token length:", token.length);
  } else {
    console.warn("[DRIVER-API] No token found for request");
  }
  return headers;
};

const handleRes = async (res: Response) => {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "API error");
  return json.data;
};

// Public
export const getAllDrivers = async () => {
  const res = await fetch(`${apiBaseUrl}drivers`);
  return handleRes(res);
};

export const getDriverById = async (id: string) => {
  const res = await fetch(`${apiBaseUrl}drivers/${id}`);
  return handleRes(res);
};

// Protected
export const createDriverProfile = async (data: any) => {
  const headers = authHeaders();

  // ✅ HANDLE FORM DATA CORRECTLY
  if (data instanceof FormData) {
    delete headers["Content-Type"]; // VERY IMPORTANT
    console.log("[DRIVER-API] Sending driver create-profile FormData entries:", [...data.entries()]);

    const res = await fetch(`${apiBaseUrl}drivers/create-profile`, {
      method: "POST",
      headers,
      body: data,
    });

    return handleRes(res);
  }

  // fallback (JSON)
  const res = await fetch(`${apiBaseUrl}drivers/create-profile`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  return handleRes(res);
};

export const getMyDriverProfile = async () => {
  const res = await fetch(`${apiBaseUrl}drivers/me/profile`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

export const updateDriverProfile = async (data: any) => {
  const hasFile = data.driverPhoto || data.vehiclePhoto || data.driverLicense || (data.driverLicense && Array.isArray(data.driverLicense));
  const headers = authHeaders();

  if (hasFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach(file => {
          if (file instanceof File) {
            formData.append(key, file);
          }
        });
      } else if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    });

    delete headers["Content-Type"];

    const res = await fetch(`${apiBaseUrl}drivers/me/profile`, {
      method: "PUT",
      headers,
      body: formData,
    });

    return handleRes(res);
  }

  const res = await fetch(`${apiBaseUrl}drivers/me/profile`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  return handleRes(res);
};

export const toggleDriverAvailability = async (isAvailable: boolean) => {
  const res = await fetch(`${apiBaseUrl}drivers/me/availability`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ isAvailable }),
  });
  return handleRes(res);
};
