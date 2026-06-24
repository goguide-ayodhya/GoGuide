"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { galleryData } from "../public/assets/galleryData";
import { ArrowRight } from "lucide-react";
import { poppins } from "../lib/fonts";

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
          <h2 className="text-4xl md:text-6xl font-bold text-center text-foreground mb-4 text-balance">
            Explore <b className={`${poppins.className} text-secondary`}>Ayodhya's</b> Beauty
          </h2>

        </motion.div>

      </div>

      {/* Gallery Grid */}
      <motion.div
        className="max-w-7xl mx-auto"
        variants={item}
      >
        {/* Gallery Images Grid - Uniform sizing for premium layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featured.map((img) => (
            <motion.div
              key={img.id}
              variants={imageVariants}
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer"
              whileHover={{ y: -6 }}
            >
              {/* Image Container */}
              <div className="relative w-full h-72 sm:h-80 bg-slate-200 overflow-hidden">
                <Image
                  src={img.image}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
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
                        className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold rounded-full shadow-sm hover:bg-white transition"
                      >
                        {cat}
                      </span>
                    ))}
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className={`text-lg sm:text-xl font-bold mb-1 leading-tight ${poppins.className}`}>
                    {img.title}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm flex items-center gap-1">
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
          <Link href="/gallery" className="inline-block group">
            <p className="inline-flex items-center gap-2 bg-white text-slate-800 border border-slate-300 hover:border-indigo-600 hover:text-indigo-600 px-8 py-3.5 rounded-full font-semibold shadow-sm hover:shadow-md transition-all duration-300 transform group-hover:scale-[1.02]">
              <span>Explore Full Gallery</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </p>
          </Link>
          <p className="mt-4 text-slate-500 text-sm">
            Discover all {total} stunning experiences
          </p>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
