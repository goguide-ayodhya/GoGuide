const base_url = process.env.NEXT_PUBLIC_BASE_URL;

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

// Profile
export const getProfile = async () => {
  const res = await fetch(`${base_url}settings/me`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const updateProfile = async (data: any) => {
  const res = await fetch(`${base_url}settings/me`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};