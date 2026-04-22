"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "How can I book a guide in Ayodhya?",
    answer:
      "You can browse verified guides, check ratings, and book instantly through our platform in just a few clicks.",
  },
  {
    question: "Are the guides verified and trusted?",
    answer:
      "Yes, all guides go through a verification process and have ratings and reviews from real users.",
  },
  {
    question: "Can I book cabs for local travel?",
    answer:
      "Yes, you can book cabs for local sightseeing, temple visits, and full-day travel within Ayodhya.",
  },
  {
    question: "Do you offer tour packages?",
    answer:
      "We provide curated tour packages that include guides, transportation, and major attraction visits.",
  },
  {
    question: "Can I schedule bookings in advance?",
    answer:
      "Yes, you can schedule your bookings in advance for a smooth and planned travel experience.",
  },
  {
    question: "What if I need help during my trip?",
    answer:
      "Our support team is available to assist you during your journey for any issues or help required.",
  },
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="bg-[#f5f5f5] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-semibold text-gray-900 mb-10">
          Frequently asked questions
        </h2>

        {/* FAQ List */}
        <div className="divide-y divide-gray-300">
          {faqs.map((faq, index) => (
            <div key={index} className="py-5">
              {/* Question */}
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-lg md:text-xl text-gray-900 font-medium">
                  {faq.question}
                </span>

                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${
                    activeIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Answer */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  activeIndex === index ? "max-h-40 mt-3" : "max-h-0"
                }`}
              >
                <p className="text-gray-600 text-sm md:text-base">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}