"use client";
import { SetStateAction, useState, useEffect } from "react";
import { getPublicStats } from "@/lib/api/adminDashboard";

export default function AboutUs() {
  const [open, setOpen] = useState<number | null>(null);
  const [stats, setStats] = useState({
    bookings: 0,
    guides: 0,
    cities: 0,
    reviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPublicStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        // Keep default values if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const toggle = (id: number) => {
    setOpen(open === id ? null : id);
  };

  return (
    <div className="px-6 md:px-16 py-16 space-y-16">

      {/* HERO */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold">
          About <span className="text-primary italic">GoGuide</span>
        </h1>

        <p className="max-w-2xl mx-auto text-muted-foreground text-lg italic">
          Connecting travelers with trusted guides, making journeys smooth,
          simple and unforgettable.
        </p>
      </section>

      {/* GRID FEATURES */}
      <section className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Smart Booking",
            desc: "Easy booking flow with real-time updates.",
          },
          {
            title: "Verified Guides",
            desc: "Only trusted and verified guides available.",
          },
          {
            title: "Secure Payments",
            desc: "Safe and reliable payment system.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="p-6 rounded-xl bg-card border hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <h3 className="text-xl font-semibold text-primary">
              {item.title}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm italic">
              {item.desc}
            </p>
          </div>
        ))}
      </section>

      {/* STORY (expandable) */}
      <section className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">
          Our Story
        </h2>

        <div
          onClick={() => toggle(1)}
          className="cursor-pointer p-5 border rounded-xl bg-muted hover:bg-accent/10 transition"
        >
          <p className="font-medium">
            Why we built this platform?
          </p>

          {open === 1 && (
            <p className="mt-3 text-muted-foreground text-sm italic animate-fadeIn">
              Finding reliable guides and managing bookings was always messy.
              So we built a system that connects tourists and guides in one
              smooth flow — from booking to payment to review.
            </p>
          )}
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { label: "Bookings", value: loading ? "..." : stats.bookings.toLocaleString() },
          { label: "Guides", value: loading ? "..." : stats.guides.toLocaleString() },
          { label: "Cities", value: loading ? "..." : stats.cities.toLocaleString() },
          { label: "Reviews", value: loading ? "..." : stats.reviews.toLocaleString() },
        ].map((item, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-card border hover:scale-105 transition"
          >
            <p className="text-2xl font-bold text-primary">
              {item.value}
            </p>
            <p className="text-sm text-muted-foreground italic">
              {item.label}
            </p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="text-center space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold">
          Start your journey today
        </h2>

        <button className="px-6 py-3 cursor-pointer rounded-xl bg-primary text-white hover:bg-accent transition">
          Explore Now
        </button>
      </section>

    </div>
  );
}