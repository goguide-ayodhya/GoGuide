"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CTABanner() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl rounded-3xl overflow-hidden bg-gradient-to-r from-destructive to-secondary p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold">Plan your Ayodhya trip today</h3>
            <p className="mt-2 text-sm opacity-90">
              Find trusted guides and comfortable cabs in minutes.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/tourist/guides">
              <p className="bg-white text-indigo-600 px-5 py-3 rounded-full font-semibold shadow hover:scale-105 transition">
                Book Guide
              </p>
            </Link>
            <Link href="/tourist/cabs">
              <p className="bg-white/90 text-indigo-700 px-4 py-3 rounded-full font-semibold shadow-sm hover:scale-105 transition">
                Book Cab
              </p>
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
