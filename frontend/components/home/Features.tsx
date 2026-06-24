"use client";
import { assets } from "@/public/assets/assets";
import { motion } from "framer-motion";
import { Users, Clock, MapPin, Headphones } from "lucide-react";
import Image from "next/image";

const features = [
  {
    title: "Trusted Guides",
    desc: "Vetted local experts you can rely on.",
    icon: <Users className="h-6 w-6 text-white" />,
    image: assets.trustedGuides
  },
  {
    title: "Easy Booking",
    desc: "Fast checkout and secure payments.",
    icon: <Clock className="h-6 w-6 text-white" />,
    image: assets.easyBookings
  },
  {
    title: "Local Experts",
    desc: "Insider knowledge for authentic experiences.",
    icon: <MapPin className="h-6 w-6 text-white" />,
    image: assets.localExperts
  },
  {
    title: "24/7 Support",
    desc: "We're here to help, anytime.",
    icon: <Headphones className="h-6 w-6 text-white" />,
    image: assets.anytime
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
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`bg-secondary rounded-lg p-3 shadow-sm`}
                >
                  {f.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground text-center pb-4 leading-tight">
                    {f.title}
                  </h3>
                  <div className="overflow-hidden rounded-lg">
                    <Image
                      alt={f.title}
                      src={f.image}
                      width={400}
                      height={250}
                      className="w-full h-40 object-cover transition duration-300 hover:scale-105"
                    />
                  </div>

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
