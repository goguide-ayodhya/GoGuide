const base_url = process.env.NEXT_PUBLIC_BASE_URL;
// const token = localStorage.getItem("token"); // could return old token also
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Get Get All Guides
export const getAllGuides = async () => {
  const res = await fetch(`${base_url}guides`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const json = await res.json();
  return json.data;
};

// Get My Guide
export const getGuideProfile = async () => {
  const res = await fetch(`${base_url}guides/me`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const json = await res.json();
  return json.data;
};

// Get Guide By ID
export const getGuideById = async (id: string) => {
  const res = await fetch(`${base_url}guides/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const json = await res.json();
  return json.data;
};

// Update Guide By ID
export const updateGuide = async (data: any) => {
  const res = await fetch(`${base_url}guides/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return json.data;
};

// Set Availability
export const setAvailabilityApi = async (id: string, isAvailable: boolean) => {
  const res = await fetch(`${base_url}guides/me/availability`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ isAvailable }),
  });
  const json = await res.json();
  return json.data;
};

// Set Online Status
export const setOnlineStatusApi = async (id: string, isOnline: boolean) => {
  const res = await fetch(`${base_url}guides/me/online-status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ isOnline }),
  });
  const json = await res.json();
  return json.data;
};

// --------------------- ADMIN ---------------------

// Verify Guide
export const verifyGuide = async (id: string) => {
  const res = await fetch(`${base_url}guides/${id}/verify`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const json = await res.json();
  return json.data;
};

// Reject Guide
export const rejectGuide = async (id: string) => {
  const res = await fetch(`${base_url}guides/${id}/reject`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const json = await res.json();
  return json.data;
};
