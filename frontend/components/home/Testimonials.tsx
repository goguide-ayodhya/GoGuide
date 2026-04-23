"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Priya",
    text: "Amazing guide, so knowledgeable and friendly!",
    rating: 5,
    image: "/assets/avatar1.jpg",
  },
  {
    name: "Rahul",
    text: "Smooth booking experience and great service.",
    rating: 4.5,
    image: "/assets/avatar2.jpg",
  },
  {
    name: "Anita",
    text: "Highly recommend for first-time visitors.",
    rating: 5,
    image: "/assets/avatar3.jpg",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
            What travelers say
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Real experiences from our happy travelers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.36 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transform-gpu hover:-translate-y-1 transition"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-none">
                  <Image
                    src={r.image}
                    alt={r.name}
                    width={56}
                    height={56}
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground">
                    {r.name}
                  </h3>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-4 w-4 ${
                            idx < Math.round(r.rating) ? "text-amber-400" : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">{r.rating}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                “{r.text}”
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
