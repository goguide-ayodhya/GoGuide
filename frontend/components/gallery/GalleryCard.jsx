"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function GalleryCard({ item, onClick }) {
  return (
    <motion.article
      whileHover={{ scale: 1.02 }}
      className="relative rounded-xl overflow-hidden shadow-lg bg-white cursor-pointer"
      onClick={onClick}
    >
      <div className="relative w-full " style={{ paddingBottom: "70%" }}>
        <Image
          src={item.image}
          alt={item.alt}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 640px) 100vw, 33vw"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/30 to-transparent"></div>{" "}
        <div className="absolute left-4 bottom-4 text-white">
          <h3 className="font-semibold text-sm">{item.title}</h3>
          {/* <p className="text-xs text-white/90">{item.location}</p> */}
        </div>
      </div>
    </motion.article>
  );
}
