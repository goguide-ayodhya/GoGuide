"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { assets } from "@/public/assets/assets";

export default function CTABanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-14 px-4 sm:px-6 lg:px-8"
    >
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-primary via-indigo-600 to-secondary p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">

        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">

          {/* Left */}
          <div className="max-w-xl text-white">
            <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-sm font-medium backdrop-blur">
              ✨ Trusted by Travelers
            </span>

            <h2 className="mt-4 text-3xl md:text-5xl font-bold leading-tight">
              Plan Your Perfect
              <span className="block uppercase bg-white rounded-full px-4 text-primary">
                Ayodhya Journey
              </span>
            </h2>

            <p className="mt-4 text-white/80 text-lg">
              Book verified local guides and comfortable cabs
              for a smooth and memorable experience.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <a
                href="tel:+918881993735"
                className="rounded-full bg-white px-6 py-3 font-semibold text-primary shadow-lg hover:scale-105 transition"
              >
                📞 Call Expert
              </a>

              <Link href="/tourist/cabs">
                <span className="cursor-pointer rounded-full border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur hover:bg-white/20 transition">
                  🚕 Book Cab
                </span>
              </Link>
            </div>
          </div>

          {/* Right Illustration */}
          <div >
            <Image
              src={assets.planTrip}
              alt="Plan Trip"
              className="h-64 sm:h-auto w-120 object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
