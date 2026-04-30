"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useGuide } from "@/contexts/GuideContext";

import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { ServiceCard } from "@/components/common/ServiceCard";
import { Car, MapPin, Ticket, Users, Star } from "lucide-react";

import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import CTABanner from "@/components/home/CTABanner";
import Link from "next/link";
import { assets } from "@/public/assets/assets";

import { poppins, manrope } from "@/lib/fonts";
import Image from "next/image";
import FAQSection from "@/components/home/FAQs";
import TeamSection from "@/components/home/Team";

export default function Home() {
  const router = useRouter();
  const { user, loading, isLoggedIn } = useAuth();
  const { guides, loading: guidesLoading } = useGuide();

  // Calculate top-rated guides (unchanged logic)
  const topRatedGuides = guides
    .filter((guide) => guide.verificationStatus === "VERIFIED")
    .sort((a, b) =>
      b.rating !== a.rating
        ? b.rating - a.rating
        : (b.totalReviews || 0) - (a.totalReviews || 0),
    )
    .slice(0, 6);

  const destinations = [
    { name: "Ram Mandir", image: assets.ramMandir },
    { name: "Hanuman Garhi", image: assets.hanumanGarhi },
    { name: "Hanuman Gufa", image: assets.hanumanGufa },
    { name: "Surya Kund", image: assets.suryaKundLaserShow },
    { name: "Valmiki Bhawan", image: assets.valmikiBhawan },
    { name: "Dashrath Mahal", image: assets.dashrathMahal },
    { name: "Kanak Bhawan", image: assets.kanakBhawan },
    { name: "Lata Mangeshkar Chowk", image: assets.lataMangeshkar },
    { name: "Digambar Jain Mandir Mandir", image: assets.digambarJainMandir },
    { name: "Mani Parvat", image: assets.maniParvatAyodhya },
    { name: "Shwetambar Mandir", image: assets.shwetambarMandir },
    { name: "Sita Ki Rasoi", image: assets.sitaKiRasoi },
    { name: "Sri Ram Lala Sadan", image: assets.sriRamLalaSadan },
    { name: "Swami Narayan Chhapiya", image: assets.swamiNarayanChhapiya },
  ];

  const partners = [
    { name: "GoGuide | Ayodhya", image: assets.p_01 },
    { name: "GoCabs", image: assets.p_02 },
    { name: "Local Guides Co-op", image: assets.p_03 },
    { name: "Ayodhya Passes", image: assets.p_04 },
    { name: "Temple Tickets", image: assets.p_01 },
    { name: "City Tours Inc.", image: assets.p_02 },
    { name: "Local Guides Co-op", image: assets.p_03 },
    { name: "Ayodhya Passes", image: assets.p_04 },
  ];

  useEffect(() => {
    if (isLoggedIn) {
      if (user?.role === "GUIDE") router.push("/guide/dashboard");
      if (user?.role === "DRIVER") router.push("/driver/dashboard");
      if (user?.role === "TOURIST") router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div
          className="w-12 h-12 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"
          aria-hidden="true"
        ></div>
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="tel:+918881993735"
          className="bg-white text-white px-4 py-3 rounded-full shadow-lg"
        >
          📞
        </a>
      </div>
      <Header />

      <div className="flex-grow">
        {/* Hero */}
        <section className="relative flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute w-full h-full object-cover"
            >
              <source src="/assets/main/goguideHero.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white"></div>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-6xl">
            <div className="rounded-3xl  backdrop-blur-sm shadow-lg ring-1 ring-slate-200 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 md:p-12 items-center">
                <div>
                  <h1
                    className={`${poppins.className} text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-slate-900`}
                  >
                    Explore Ayodhya
                  </h1>
                  <p className="mt-4 text-lg text-slate-700 max-w-xl">
                    Discover the sacred city with ease. Book cabs, guided tours,
                    passes, and connect with local experts.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/tourist/guides" aria-label="Find a Guide">
                      <p className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-400 to-indigo-700 text-white px-5 py-3 rounded-full shadow-md hover:scale-[1.02] transform transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                        Find a Guide
                      </p>
                    </Link>
                    <Link href="/tourist/packages" aria-label="Explore Ayodhya">
                      <p className="inline-flex items-center gap-2 border border-slate-200 text-slate-800 px-4 py-2 rounded-full bg-white hover:shadow-sm transition">
                        Explore Packages
                      </p>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ServiceCard
                    title="Find a Guide"
                    description="Connect with experienced local guides"
                    href="/tourist/guides"
                    icon={<Users className="h-6 w-6 text-indigo-600" />}
                  />
                  <ServiceCard
                    title="Cabs"
                    description="Reliable transportation across the city"
                    href="/tourist/cabs"
                    icon={<Car className="h-6 w-6 text-sky-500" />}
                  />
                  <ServiceCard
                    title="Tour Packages"
                    description="Curated experiences and guided tours"
                    href="/tourist/packages"
                    icon={<MapPin className="h-6 w-6 text-emerald-500" />}
                  />
                  <ServiceCard
                    title="Contact Us"
                    description="Purchase tickets and passes"
                    href="/contact-us"
                    icon={<Ticket className="h-6 w-6 text-amber-500" />}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Destinations */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-4xl md:text-6xl font-bold text-center text-foreground mb-8 text-balance">
              Popular{" "}
              <b className={`${poppins.className} text-secondary`}>
                Destinations
              </b>{" "}
            </h2>

            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
              {destinations.map((item, index) => (
                <div
                  key={index}
                  className="
              min-w-[35%] sm:min-w-[22%] md:min-w-[18%] lg:min-w-[16%]
              snap-start
              rounded-xl overflow-hidden hover:shadow-sm
            "
                >
                  <div className="relative h-32 sm:h-40 md:h-48 lg:h-56">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 120px, 240px"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-800">
                      {item.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent"></div>

            <div className="flex justify-center mt-2 sm:hidden">
              <p className="text-xs text-slate-500 animate-pulse">
                ← Swipe to explore →
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Link href="/tourist/packages">
                <p className="w-38 text-sm text-gray-600 mt-8 p-2 text-sm text-center text-black font-semibold border border-gray-600 rounded-md hover:bg-hray-300">
                  View Packages
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Top Guides */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-4xl md:text-6xl font-bold text-center text-foreground mb-8 text-balance">
              Popular{" "}
              <b className={`${poppins.className} text-secondary`}>
                Guides
              </b>{" "}
            </h2>

            {guidesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div
                  className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"
                  aria-hidden
                ></div>
              </div>
            ) : topRatedGuides.length === 0 ? (
              <div className="text-center py-12 text-slate-600">
                No verified guides available yet. Check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {topRatedGuides.map((guide) => (
                  <article
                    key={guide.id}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="relative h-48 bg-slate-100">
                      {guide.image ? (
                        <Image
                          src={guide.image}
                          alt={guide.userId?.name || guide.name || "Guide"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          {" "}
                          <Users className="h-12 w-12" />
                        </div>
                      )}

                      <div className="absolute left-3 top-3 bg-white/80 text-slate-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        {guide.verificationStatus === "VERIFIED"
                          ? "Verified"
                          : "Unverified"}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-slate-900 truncate">
                        {guide.userId?.name || guide.name || "Verified guide"}
                      </h3>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < Math.round(guide.rating) ? "text-amber-400" : "text-slate-300"}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            {guide.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-sm text-slate-500">
                          {guide.totalReviews || 0} reviews
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-center">
            <Link href="/tourist/guides">
              <p className="w-24 text-sm text-gray-600 mt-8 p-2 text-sm text-center text-black font-semibold border border-gray-600 rounded-md hover:bg-hray-300">
                View all
              </p>
            </Link>
          </div>
        </section>

        {/* CTA Banner */}
        <CTABanner />

        {/* Testimonials */}
        {/* <Testimonials /> */}

        {/* Features */}
        <Features />

        {/* Team Section */}
        {/* <TeamSection /> */}

        {/* How it works */}
        <HowItWorks />

        <FAQSection />

        {/* Partners */}
        <div className="overflow-hidden w-full py-12 px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-6xl font-bold text-center text-foreground mb-8 text-balance">
            Our{" "}
            <b className={`${poppins.className} text-secondary`}>
              Partners
            </b>{" "}
          </h2>
          <div className="flex gap-4 w-max auto-scroll">
            {[...partners, ...partners].map((item, index) => (
              <div
                key={index}
                className="
              min-w-[5%] sm:min-w-[10%] md:min-w-[12%] lg:min-w-[15%]
              rounded-xl overflow-hidden hover:shadow-md transition-all
            "
              >
                <div className="relative h-32 sm:h-36 md:h-48 lg:h-56">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 240px, (max-width: 768px) 160px, (max-width: 1024px) 200px, 144px"
                  />
                </div>

                <p className="text-center text-sm font-semibold py-2">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
