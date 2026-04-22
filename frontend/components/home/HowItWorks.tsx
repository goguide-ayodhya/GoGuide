"use client";
import { motion } from "framer-motion";
import { Search, Calendar, Map } from "lucide-react";

const steps = [
  { title: "Find a Guide", desc: "Search verified local guides.", icon: <Search className="h-6 w-6 text-indigo-600" /> },
  { title: "Book a Slot", desc: "Choose date, time and confirm booking.", icon: <Calendar className="h-6 w-6 text-sky-500" /> },
  { title: "Enjoy the Tour", desc: "Meet your guide and explore safely.", icon: <Map className="h-6 w-6 text-emerald-500" /> },
];

export default function HowItWorks() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-6">How it works</h2>
        <div className="flex flex-col md:flex-row items-start gap-6">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} className="flex-1 bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-100">{s.icon}</div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900">{s.title}</h3>
                  <p className="text-sm text-slate-600">{s.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
