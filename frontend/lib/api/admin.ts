const base_url = process.env.NEXT_PUBLIC_BASE_URL;

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// Get Users
export const getUsersApi = async () => {
  const res = await fetch(`${base_url}admin/users`, {
    headers: authHeaders(),
  });
  return res.json();
};

// Block
export const blockUserApi = async (id: string) => {
  const res = await fetch(`${base_url}admin/users/${id}/block`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return res.json();
};

// Activate
export const activateUserApi = async (id: string) => {
  const res = await fetch(`${base_url}admin/users/${id}/activate`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return res.json();
};

// Suspend
export const suspendUserApi = async (id: string) => {
  const res = await fetch(`${base_url}admin/users/${id}/suspend`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return res.json();
};

// Delete
export const deleteUserApi = async (id: string) => {
  const res = await fetch(`${base_url}admin/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
};