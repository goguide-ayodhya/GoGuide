"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "How can I book a guide in Ayodhya?",
    answer:
      "Browse verified guides, check ratings, pick a slot and confirm — all in a few clicks. You’ll receive email/SMS confirmation with details.",
  },
  {
    question: "Are the guides verified and trusted?",
    answer:
      "Yes — our guides complete a verification process and have reviews from real travelers. Ratings and past feedback are visible on each profile.",
  },
  {
    question: "Can I book cabs for local travel?",
    answer:
      "Yes. We support cab bookings for local sightseeing and full-day travel; you can add transportation when selecting your guide or package.",
  },
  {
    question: "Do you offer tour packages?",
    answer:
      "We provide curated packages that combine guides, transport and major attractions — ideal for first-time visitors or full-day plans.",
  },
  {
    question: "Can I schedule bookings in advance?",
    answer:
      "Absolutely — select your date and time when booking. You’ll get reminders and the guide receives a notification to confirm.",
  },
  {
    question: "What if I need help during my trip?",
    answer:
      "Our support team is available 24/7 via the app — contact us and we’ll coordinate with your guide to resolve issues quickly.",
  },
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const stats = [
    { label: "Clients", value: "50+" },
    { label: "On Time", value: "100%" },
    { label: "Success", value: "98%+" },
    { label: "Support", value: "24/7" },
  ];

  return (
    <section id="faq" className="py-12 px-4 sm:px-6 lg:px-8 bg-secondary/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left: Heading + description + stats */}
          <div className="flex flex-col justify-between h-full gap-6">
            <div
              className="flex flex-col gap-3 px-3 py-1 rounded-full border faq-badge font-medium"
              style={{ borderWidth: 1 }}
            >
              <div className="rounded-full text-secondary mb-2">
                <b className="font-semibold text-black p-2 border border-secondary rounded-full bg-secondary/20">
                  Common Questions
                </b>
              </div>
              <h2 className="text-3xl text-destructive font-semibold ">
                Frequently Asked Questions
              </h2>
              <p className="text-black max-w-xl tracking-wide text-lg">
                Get answers to common questions about our development process,
                project complexity and system integrations.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 mt-6">
              {stats.map((s, i) => (
                <div key={i} className="stat-card text-center">
                  <div className="stat-value text-primary font-bold text-2xl">
                    {s.value}
                  </div>
                  <div className="stat-label font-semibold text-destructive">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Accordion */}
          <div className="w-full bg-white rounded-2xl shadow-sm p-6">
            <div className="p-4 elevated-card rounded-2xl">
              <div className="space-y-4">
                {faqs.map((faq, idx) => {
                  const isOpen = activeIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-white shadow-sm overflow-hidden transition"
                    >
                      {/* QUESTION */}
                      <button
                        onClick={() => toggle(idx)}
                        aria-expanded={isOpen}
                        className="w-full flex items-center justify-between p-4"
                      >
                        <div className="text-left text-md font-semibold tracking-wide">
                          {faq.question}
                        </div>

                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.22 }}
                          className="ml-4 text-muted-foreground"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </motion.span>
                      </button>

                      {/* ANSWER */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-0 text-sm tracking-wide">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
