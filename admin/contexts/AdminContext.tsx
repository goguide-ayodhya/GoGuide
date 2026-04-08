"use client";

import { createContext, useContext, useState } from "react";
import {
  getUsersApi,
  blockUserApi,
  activateUserApi,
  suspendUserApi,
  deleteUserApi,
} from "@/lib/api/admin";

// ---------------- TYPES ----------------
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
}

interface AdminContextType {
  users: User[];
  loading: boolean;

  fetchUsers: () => Promise<void>;
  blockUser: (id: string) => Promise<void>;
  activateUser: (id: string) => Promise<void>;
  suspendUser: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// ---------------- PROVIDER ----------------
export const AdminProvider = ({ children }: any) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsersApi();
      // ❗ backend res.json() return kar raha → direct use
      setUsers(data);
    } catch (err) {
      console.log("Fetch users error", err);
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (id: string) => {
    await blockUserApi(id);

    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, status: "BLOCKED" } : u)),
    );
  };

  const activateUser = async (id: string) => {
    await activateUserApi(id);

    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, status: "ACTIVE" } : u)),
    );
  };

  const suspendUser = async (id: string) => {
    await suspendUserApi(id);

    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, status: "SUSPENDED" } : u)),
    );
  };

  const deleteUser = async (id: string) => {
    await deleteUserApi(id);

    setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  return (
    <AdminContext.Provider
      value={{
        users,
        loading,
        fetchUsers,
        blockUser,
        activateUser,
        suspendUser,
        deleteUser,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within provider");
  return context;
};
