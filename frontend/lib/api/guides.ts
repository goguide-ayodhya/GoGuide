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

const handleRes = async (res: Response) => {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "API error");
  return json.data;
};

// Public
export const getAllGuides = async () => {
  const res = await fetch(`${base_url}guides`);
  return handleRes(res);
};

// Protected
export const getGuideProfile = async () => {
  const res = await fetch(`${base_url}guides/me`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const getGuideById = async (id: string) => {
  const res = await fetch(`${base_url}guides/${id}`, {
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const updateGuide = async (data: any) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (value === null || value === undefined) {
      return;
    }

    if (key === "certificates" && Array.isArray(value)) {
      value.forEach((cert: any, index: number) => {
        const imageFile =
          cert instanceof File
            ? cert
            : cert?.image instanceof File
            ? cert.image
            : null;

        if (imageFile) {
          formData.append("certificates", imageFile);
          formData.append(
            "certificateNames",
            cert.name || `Certificate ${index + 1}`,
          );
        }
      });
      return;
    }

    if (key === "avatar" && value instanceof File) {
      formData.append("avatar", value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item: any) => {
        formData.append(`${key}[]`, String(item));
      });
      return;
    }

    formData.append(key, String(value));
  });

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${base_url}guides/me`, {
    method: "PUT",
    headers,
    body: formData,
  });

  return handleRes(res);
};

// Availability
export const setAvailabilityApi = async (isAvailable: boolean) => {
  const res = await fetch(`${base_url}guides/me/availability`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ isAvailable }),
  });

  return handleRes(res);
};

// Online
// export const setOnlineStatusApi = async (isOnline: boolean) => {
//   const res = await fetch(`${base_url}guides/me/online-status`, {
//     method: "PATCH",
//     headers: authHeaders(),
//     body: JSON.stringify({ isOnline }),
//   });

//   return handleRes(res);
// };

// ADMIN
export const verifyGuide = async (id: string) => {
  const res = await fetch(`${base_url}guides/${id}/verify`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  return handleRes(res);
};

export const rejectGuide = async (id: string) => {
  const res = await fetch(`${base_url}guides/${id}/reject`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  return handleRes(res);
};
