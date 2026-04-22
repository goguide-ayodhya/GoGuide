"use client";
import { motion } from "framer-motion";
import { Users, Clock, MapPin, Headphones } from "lucide-react";

const features = [
  { title: "Trusted Guides", desc: "Vetted local experts you can rely on.", icon: <Users className="h-6 w-6 text-indigo-600" /> },
  { title: "Easy Booking", desc: "Fast checkout and secure payments.", icon: <Clock className="h-6 w-6 text-sky-500" /> },
  { title: "Local Experts", desc: "Insider knowledge for authentic experiences.", icon: <MapPin className="h-6 w-6 text-emerald-500" /> },
  { title: "24/7 Support", desc: "We're here to help, anytime.", icon: <Headphones className="h-6 w-6 text-amber-500" /> },
];

export default function Features() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-6">Why choose us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-white to-slate-50 rounded-xl">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{f.title}</h3>
                  <p className="text-xs text-slate-600">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
