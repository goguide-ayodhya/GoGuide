"use client";
import { motion } from "framer-motion";
import { Users, Clock, MapPin, Headphones } from "lucide-react";

const features = [
  {
    title: "Trusted Guides",
    desc: "Vetted local experts you can rely on.",
    icon: <Users className="h-6 w-6 text-white" />,
  },
  {
    title: "Easy Booking",
    desc: "Fast checkout and secure payments.",
    icon: <Clock className="h-6 w-6 text-white" />,
  },
  {
    title: "Local Experts",
    desc: "Insider knowledge for authentic experiences.",
    icon: <MapPin className="h-6 w-6 text-white" />,
  },
  {
    title: "24/7 Support",
    desc: "We're here to help, anytime.",
    icon: <Headphones className="h-6 w-6 text-white" />,
  },
];

export default function Features() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl text-destructive font-semibold">
            Why<i className="text-6xl text-secondary">?</i> choose us
          </h2>
          <p className="mt-2 max-w-2xl mx-auto">
            Built for comfort, trust and a seamless travel experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{
                translateY: -6,
                boxShadow: "0 10px 30px rgba(2,6,23,0.08)",
              }}
              viewport={{ once: true }}
              transition={{ duration: 0.36, ease: "easeOut", delay: i * 0.06 }}
              className="relative bg-card border border-border rounded-2xl p-6 hover:shadow-lg transform-gpu transition-all"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`bg-secondary flex-none rounded-lg p-3 shadow-sm`}
                >
                  {f.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground leading-tight">
                    {f.title}
                  </h3>
                  <p className="text-sm mt-1">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
