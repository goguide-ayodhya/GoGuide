"use client";

import { createContext, useContext, useState } from "react";
import { getPasses, getPassById } from "@/lib/api/pass";

// ---------------- TYPES ----------------
interface Pass {
  _id: string;
  name: string;
  price: number;
}

interface PassContextType {
  passes: Pass[];
  selectedPass: Pass | null;
  loading: boolean;

  fetchPasses: () => Promise<void>;
  fetchPassById: (id: string) => Promise<void>;
}

const PassContext = createContext<PassContextType | undefined>(undefined);

// ---------------- PROVIDER ----------------
export const PassProvider = ({ children }: any) => {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [selectedPass, setSelectedPass] = useState<Pass | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPasses = async () => {
    setLoading(true);
    try {
      const data = await getPasses();
      setPasses(data || []);
    } catch (err) {
      console.log("Fetch passes error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPassById = async (id: string) => {
    try {
      const data = await getPassById(id);
      setSelectedPass(data);
    } catch (err) {
      console.log("Fetch pass error", err);
    }
  };

  return (
    <PassContext.Provider
      value={{
        passes,
        selectedPass,
        loading,
        fetchPasses,
        fetchPassById,
      }}
    >
      {children}
    </PassContext.Provider>
  );
};

export const usePass = () => {
  const context = useContext(PassContext);
  if (!context) throw new Error("usePass must be used within provider");
  return context;
};
