import { LoginData, SignupData } from "@/contexts/AuthContext";
const base_url = process.env.NEXT_PUBLIC_BASE_URL;

// Login API
export const loginUser = async (data: LoginData) => {
  const res = await fetch(`${base_url}auth/login`, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error("Login failed");
  }

  // return res.json();
  return json.data;
};

// Signup API
export const signupUser = async (data: SignupData) => {
  const form = new FormData();
  (form.append("name", data.name),
    form.append("email", data.email),
    form.append("password", data.password),
    form.append("role", data.role));

  if (data.phone) {
    form.append("phone", data.phone);
  }

  if (data.avatar) {
    form.append("avatar", data.avatar);
  }

  const res = await fetch(`${base_url}auth/signup`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error("Signup failed");
  }
  const json = await res.json();
  return json.data;
};

// Logout API
export const logoutUser = async () => {
  const res = await fetch(`${base_url}auth/logout`);
};

// LogoutAllUser API
export const logoutAllUsers = async () => {
  const res = await fetch(`${base_url}auth/logoutall`, { method: "POST" });
};

// LogoutAllUser API
export const changePassword = async () => {
  const res = await fetch(`${base_url}auth/change-password`, {
    method: "POST",
  });
};
