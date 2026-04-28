const base_url = process.env.NEXT_PUBLIC_BASE_URL;

const getToken = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") return null;
  return token;
};

const authHeaders = () => {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleRes = async (res: Response) => {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "API error");
  return json.data || json;
};

// ---------------- GET ALL ----------------
export const getPackages = async () => {
  const res = await fetch(`${base_url}packages?isActive=true`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

// ---------------- GET BY ID ----------------
export const getPackageById = async (id: string) => {
  const res = await fetch(`${base_url}packages/${id}`, {
    headers: authHeaders(),
  });
  return handleRes(res);
};

// ---------------- CREATE (ADMIN) ----------------
export const createPackage = async (data: any) => {
  const res = await fetch(`${base_url}packages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });
  return handleRes(res);
};

// ---------------- UPDATE (ADMIN) ----------------
export const updatePackage = async (id: string, data: any) => {
  const res = await fetch(`${base_url}packages/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });
  return handleRes(res);
};

// ---------------- CREATE (FORM-DATA with files) ----------------
export const createPackageForm = async (formData: FormData) => {
  const headers = authHeaders();
  const res = await fetch(`${base_url}packages`, {
    method: "POST",
    headers: headers, // browser will set Content-Type including boundary
    body: formData,
  });
  return handleRes(res);
};

// ---------------- UPDATE (FORM-DATA with files) ----------------
export const updatePackageForm = async (id: string, formData: FormData) => {
  const headers = authHeaders();
  const res = await fetch(`${base_url}packages/${id}`, {
    method: "PUT",
    headers: headers,
    body: formData,
  });
  return handleRes(res);
};

// ---------------- DELETE (ADMIN) ----------------
export const deletePackage = async (id: string) => {
  const res = await fetch(`${base_url}packages/${id}`, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
    },
  });
  return handleRes(res);
};