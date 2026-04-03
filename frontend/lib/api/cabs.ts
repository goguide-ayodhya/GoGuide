const base_url = process.env.NEXT_PUBLIC_BASE_URL;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

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
