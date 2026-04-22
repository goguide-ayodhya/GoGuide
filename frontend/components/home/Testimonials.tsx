"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  { name: "Priya", text: "Amazing guide, so knowledgeable and friendly!", rating: 5, image: "/assets/avatar1.jpg" },
  { name: "Rahul", text: "Smooth booking experience and great service.", rating: 4.5, image: "/assets/avatar2.jpg" },
  { name: "Anita", text: "Highly recommend for first-time visitors.", rating: 5, image: "/assets/avatar3.jpg" },
];

export default function Testimonials() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-6">What travelers say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.blockquote key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.06 }} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                  <Image src={r.image} alt={r.name} width={48} height={48} className="object-cover"/>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">{r.name}</h3>
                    <div className="flex items-center text-amber-400">{Array.from({length:5}).map((_, idx) => <Star key={idx} className={`h-4 w-4 ${idx < Math.round(r.rating) ? 'text-amber-400' : 'text-slate-200'}`} />)}</div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{r.text}</p>
                </div>
              </div>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
