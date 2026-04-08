"use client";

import { createContext, useContext, useState } from "react";
import { createCab, getMyCabs, cancelCab } from "@/lib/api/driver";

// ---------------- TYPES ----------------
interface Cab {
  _id: string;
  pickup: string;
  drop: string;
  date: string;
  status: string;
}

interface CabContextType {
  cabs: Cab[];
  loading: boolean;

  fetchMyCabs: () => Promise<void>;
  createNewCab: (data: any) => Promise<void>;
  cancelCabBooking: (id: string) => Promise<void>;
}

const CabContext = createContext<CabContextType | undefined>(undefined);

// ---------------- PROVIDER ----------------
export const CabProvider = ({ children }: any) => {
  const [cabs, setCabs] = useState<Cab[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMyCabs = async () => {
    setLoading(true);
    try {
      const data = await getMyCabs();
      setCabs(data || []);
    } catch (err) {
      console.log("Fetch cabs error", err);
    } finally {
      setLoading(false);
    }
  };

  const createNewCab = async (data: any) => {
    try {
      const newCab = await createCab(data);
      setCabs((prev) => [newCab, ...prev]);
    } catch (err) {
      console.log("Create cab error", err);
    }
  };

  const cancelCabBooking = async (id: string) => {
    await cancelCab(id);

    setCabs((prev) =>
      prev.map((c) => (c._id === id ? { ...c, status: "CANCELLED" } : c)),
    );
  };

  return (
    <CabContext.Provider
      value={{ cabs, loading, fetchMyCabs, createNewCab, cancelCabBooking }}
    >
      {children}
    </CabContext.Provider>
  );
};

export const useCab = () => {
  const context = useContext(CabContext);
  if (!context) throw new Error("useCab must be used within provider");
  return context;
};
