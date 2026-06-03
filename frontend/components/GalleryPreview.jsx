"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { galleryData } from "../public/assets/galleryData";
import { ArrowRight } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7 } },
};

export default function GalleryPreview() {
  const featured = galleryData.filter((g) => g.featured).slice(0, 6);
  const total = galleryData.length;

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
      className="w-full bg-gradient-to-b from-slate-50 via-white to-slate-50 py-20 px-4 sm:px-6 lg:px-8"
    >
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-16">
        <motion.div variants={item} className="text-center mb-10">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
            Explore <span className="bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">Ayodhya's</span> Beauty
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover captivating moments from our curated collection of authentic experiences, spiritual journeys, and unforgettable adventures.
          </p>
        </motion.div>

        <motion.div variants={item} className="flex justify-center gap-4 flex-wrap">
          <div className="px-4 py-2 bg-amber-100 text-amber-900 rounded-full text-sm font-semibold">
            {total} Curated Photos
          </div>
          <div className="px-4 py-2 bg-rose-100 text-rose-900 rounded-full text-sm font-semibold">
            Real Stories
          </div>
          <div className="px-4 py-2 bg-blue-100 text-blue-900 rounded-full text-sm font-semibold">
            Travel Inspiration
          </div>
        </motion.div>
      </div>

      {/* Gallery Grid */}
      <motion.div
        className="max-w-7xl mx-auto"
        variants={item}
      >
        {/* Large Featured Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featured.map((img, idx) => (
            <motion.div
              key={img.id}
              variants={imageVariants}
              className={`group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer
                ${idx === 0 ? "lg:col-span-2 lg:row-span-2" : ""}
              `}
              whileHover={{ y: -8 }}
            >
              {/* Image Container */}
              <div className={`relative w-full bg-slate-200 overflow-hidden
                ${idx === 0 ? "h-96 md:h-full" : "h-80"}
              `}>
                <Image
                  src={img.image}
                  alt={img.alt}
                  fill
                  sizes={idx === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-75 transition-opacity duration-500"></div>

                {/* Category Badges */}
                <div className="absolute top-4 right-4 flex gap-2 flex-wrap justify-end">
                  {Array.isArray(img.category) &&
                    img.category.map((cat, cidx) => (
                      <span
                        key={cidx}
                        className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold rounded-full shadow-md hover:bg-white transition"
                      >
                        {cat}
                      </span>
                    ))}
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">
                    {img.title}
                  </h3>
                  <p className="text-white/90 text-sm flex items-center gap-1">
                    📍 {img.location}
                  </p>
                </div>

                {/* Hover Arrow */}
                <div className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500">
                  <ArrowRight size={20} className="text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          variants={item}
          className="text-center mt-12"
        >
          <Link href="/gallery">
            <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <span>Explore Full Gallery</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <p className="mt-4 text-slate-600 text-sm">
            Discover all {total} stunning experiences
          </p>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
