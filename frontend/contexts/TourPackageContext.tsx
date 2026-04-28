"use client";

import { createContext, useContext, useState } from "react";
import { getPackages, getPackageById } from "@/lib/api/tourPackages";

// ---------------- TYPES ----------------
export interface Package {
  _id: string;
  title: string;
  description: string;

  price: number;
  discount?: number;

  duration: number;
  durationType: "hours" | "days";

  locations: string[];
  state?: string;

  includesCab: boolean;
  includesGuide: boolean;

  images: string[];
  mainImage?: string;

  type: "basic" | "medium" | "premium";

  maxGroupSize?: number;

  soldCount?: number;
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

      let list: Package[] = [];

      if (Array.isArray(data)) list = data;
      else if (data && Array.isArray(data.packages)) list = data.packages;
      else if (data && Array.isArray(data.data)) list = data.data;
      else if (data && Array.isArray(data.items)) list = data.items;
      else list = [];
      setPackages(Array.isArray(list) ? list : []);
    } catch (err) {
      console.log("Fetch packages error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackageById = async (id: string) => {
    try {
      const data = await getPackageById(id);
      let pkg: Package = data?.package || data?.data || data;
      
      // if (!data) pkg = null;
      // else if (data.package) pkg = data.package;
      // else if (data.data && !Array.isArray(data.data)) pkg = data.data;
      // else pkg = data;
      setSelectedPackage(pkg as Package | null);
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
