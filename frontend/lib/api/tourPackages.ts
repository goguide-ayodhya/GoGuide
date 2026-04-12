const base_url = process.env.NEXT_PUBLIC_BASE_URL;

// ---------------- GET ALL ----------------
export const getPackages = async () => {
  const res = await fetch(`${base_url}packages`);
  return res.json();
};

// ---------------- GET BY ID ----------------
export const getPackageById = async (id: string) => {
  const res = await fetch(`${base_url}packages/${id}`);
  return res.json();
};

// ---------------- CREATE (ADMIN) ----------------
export const createPackage = async (data: any) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${base_url}packages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

// ---------------- UPDATE (ADMIN) ----------------
export const updatePackage = async (id: string, data: any) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${base_url}packages/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

// ---------------- DELETE (ADMIN) ----------------
export const deletePackage = async (id: string) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${base_url}packages/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};