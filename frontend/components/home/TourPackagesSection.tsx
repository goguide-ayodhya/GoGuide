"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { usePackage } from "@/contexts/TourPackageContext";
import { PackageCard } from "@/components/features/PackageCard";
import { poppins } from "@/lib/fonts";

export default function TourPackagesSection() {
  const { packages, fetchPackages, loading } = usePackage();

  useEffect(() => {
    // Fetch packages on load
    fetchPackages().catch((err) => console.error("Error fetching packages in home:", err));
  }, []);

  // Filter only active packages, then sort by popular (soldCount) or take the first 3
  const activePackages = packages
    .slice(0, 3); // Take at most 3 packages

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Curating tour packages...</p>
        </div>
      </section>
    );
  }

  if (activePackages.length === 0) {
    return null; // Don't show the section if no packages exist
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Our Tour{" "}
            <b className={`${poppins.className} text-secondary`}>
              Packages
            </b>
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Choose from our highly-rated plans designed for ultimate comfort, spirituality, and local discovery.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activePackages.map((pkg, i) => (
            <motion.div
              key={pkg._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <PackageCard pkg={pkg} />
            </motion.div>
          ))}
        </div>

        {/* View All Packages Button */}
        <div className="mt-12 text-center">
          <Link href="/tourist/packages" className="inline-block group">
            <p className="inline-flex items-center gap-2 bg-white text-slate-800 border border-slate-300 hover:border-indigo-600 hover:text-indigo-600 px-8 py-3.5 rounded-full font-semibold shadow-sm hover:shadow-md transition-all duration-300 transform group-hover:scale-[1.02]">
              <span>View All Packages</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
