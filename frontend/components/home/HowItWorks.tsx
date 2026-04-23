"use client";
import { motion } from "framer-motion";
import { Search, Calendar, Map } from "lucide-react";

const steps = [
  {
    title: "Find a Guide",
    desc: "Search verified local guides.",
    icon: <Search className="h-5 w-5 text-white" />,
    color: "bg-indigo-600",
  },
  {
    title: "Book a Slot",
    desc: "Choose date, time and confirm booking.",
    icon: <Calendar className="h-5 w-5 text-white" />,
    color: "bg-indigo-600",
  },
  {
    title: "Enjoy the Tour",
    desc: "Meet your guide and explore safely.",
    icon: <Map className="h-5 w-5 text-white" />,
    color: "bg-indigo-600",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-indigo-600/10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl  text-indigo-600 font-semibold text-foreground">
            How<i className="text-6xl text-destructive">?</i> it works
          </h2>
          <p className="mt-2 max-w-2xl mx-auto">
            Simple steps to plan your journey — clear and effortless.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* horizontal timeline for md+ */}
          <div className="hidden md:block absolute left-0 right-0 top-28 h-[2px] bg-border" />

          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.36 }}
              className="relative flex flex-col items-center text-center px-2"
            >
              <div className="relative z-10 -mt-6">
                <div
                  className={`mx-auto w-12 h-12 flex items-center justify-center rounded-full shadow-sm ${s.color}`}
                >
                  <span className="text-sm text-white font-semibold">{i + 1}</span>
                </div>
              </div>

              <div className="mt-3 w-full">
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition transform-gpu hover:-translate-y-1">
                  <div className="mb-3 inline-flex items-center bg-secondary justify-center rounded-md p-2 bg-muted/40">
                    {s.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{s.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
