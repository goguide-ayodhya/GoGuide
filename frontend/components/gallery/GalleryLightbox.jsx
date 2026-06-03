"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function GalleryLightbox({
  open,
  item,
  items = [],
  onClose,
  onNavigate,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        navigate(1);
      }
      if (e.key === "ArrowLeft") {
        navigate(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, item]);

  if (!item) return null;

  const idx = items.findIndex((i) => i.id === item.id);

  const navigate = (dir) => {
    const next = items[(idx + dir + items.length) % items.length];
    onNavigate(next);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="relative z-50 max-w-5xl w-full mx-auto rounded-2xl overflow-hidden"
          >
            <div className="relative w-full " style={{ paddingBottom: "56%" }}>
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/30 to-transparent"></div>{" "}
            <div className="absolute left-4 top-4">
              <button
                onClick={onClose}
                className="bg-white/90 text-slate-800 rounded-full p-2 shadow hover:scale-105 transition"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3">
              <button
                onClick={() => navigate(-1)}
                className="bg-white/90 text-slate-800 text-xl font-bold rounded-full p-3 shadow hover:scale-105 transition"
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                onClick={() => navigate(1)}
                className="bg-white/90 text-slate-800 text-xl font-bold rounded-full p-3 shadow hover:scale-105 transition"
                aria-label="Next"
              >
                ›
              </button>
            </div>

            <div className="absolute left-6 bottom-6 text-white z-50">
              <h3 className="font-bold text-lg">{item.title}</h3>
              {/* <p className="text-sm opacity-90">{item.location} • {item.category}</p> */}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
