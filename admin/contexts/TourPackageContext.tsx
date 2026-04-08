"use client";

import { createContext, useContext, useState } from "react";
import { getPackages, getPackageById } from "@/lib/api/tourPackages";

// ---------------- TYPES ----------------
interface Package {
  _id: string;
  name: string;
  price: number;
  description?: string;
}

interface PackageContextType {
  packages: Package[];
  selectedPackage: Package | null;
  loading: boolean;

  fetchPackages: () => Promise<void>;
  fetchPackageById: (id: string) => Promise<void>;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

// ---------------- PROVIDER ----------------
export const PackageProvider = ({ children }: any) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await getPackages();
      setPackages(data || []);
    } catch (err) {
      console.log("Fetch packages error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackageById = async (id: string) => {
    try {
      const data = await getPackageById(id);
      setSelectedPackage(data);
    } catch (err) {
      console.log("Fetch package error", err);
    }
  };

  return (
    <PackageContext.Provider
      value={{
        packages,
        selectedPackage,
        loading,
        fetchPackages,
        fetchPackageById,
      }}
    >
      {children}
    </PackageContext.Provider>
  );
};

export const usePackage = () => {
  const context = useContext(PackageContext);
  if (!context) throw new Error("usePackage must be used within provider");
  return context;
};
