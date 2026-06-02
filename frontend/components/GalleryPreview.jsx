"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { galleryData } from "../public/assets/galleryData";

const container = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function GalleryPreview() {
  const featured = galleryData.filter((g) => g.featured).slice(0, 4);
  const total = galleryData.length;

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={container}
      className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <motion.h2
            variants={item}
            className="text-3xl sm:text-4xl font-extrabold"
          >
            Travel Memories
          </motion.h2>
          <motion.p variants={item} className="mt-2 text-slate-600 max-w-xl">
            Real journeys, real experiences and unforgettable moments.
          </motion.p>
        </div>

        <motion.div variants={item} className="text-sm text-slate-500">
          <span className="bg-gradient-to-r from-amber-100 to-rose-50 px-3 py-1 rounded-full font-medium">
            {total} images
          </span>
        </motion.div>
      </div>

      <motion.div
        className="columns-2 sm:columns-3 lg:columns-4 gap-3"
        variants={item}
      >
        {featured.map((img, idx) => (
          <motion.figure
            key={img.id}
            className={`mb-3 break-inside-avoid rounded-xl overflow-hidden relative group shadow-lg`}
            variants={item}
          >
            <div
              className="relative w-full"
              style={{ paddingBottom: `${120 + (idx % 3) * 10}px` }}
            >
              <Image
                src={img.image}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transform transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <figcaption className="absolute left-3 bottom-3 text-white text-sm font-semibold drop-shadow">
                {img.title}
              </figcaption>
            </div>
          </motion.figure>
        ))}
      </motion.div>

      <motion.div
        variants={item}
        className="mt-6 flex items-center justify-between"
      >
        <Link
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-emerald-500 text-white px-5 py-3 rounded-full shadow-lg hover:scale-[1.02] transition"
          href="/gallery"
        >
          <button className="text-sm font-medium">Explore Full Gallery</button>
        </Link>
      </motion.div>
    </motion.section>
  );
}
