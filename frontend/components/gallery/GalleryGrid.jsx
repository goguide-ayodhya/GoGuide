"use client";

import GalleryCard from "./GalleryCard";
import { motion, AnimatePresence } from "framer-motion";

export default function GalleryGrid({ items = [], onOpen }) {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } },
  };

  return (
    <motion.section initial="hidden" animate="show" variants={container} className="columns-2 md:columns-3 lg:columns-4 gap-4">
      <AnimatePresence>
        {items.map((it) => (
          <motion.div key={it.id} layout className="mb-4 break-inside-avoid">
            <GalleryCard item={it} onClick={() => onOpen(it)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.section>
  );
}