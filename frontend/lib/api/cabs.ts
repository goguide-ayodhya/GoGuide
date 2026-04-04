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

export const createCab = async (data: any) => {
  const res = await fetch(`${base_url}cabs`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getMyCabs = async () => {
  const res = await fetch(`${base_url}cabs/my-cabs`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const cancelCab = async (id: string) => {
  const res = await fetch(`${base_url}cabs/${id}/cancel`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return res.json();
};
