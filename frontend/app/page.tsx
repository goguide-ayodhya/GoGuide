"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useGuide } from "@/contexts/GuideContext";
import { getPublicSettingsApi } from "@/lib/api/finance";

import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { ServiceCard } from "@/components/common/ServiceCard";
import { Car, MapPin, Ticket, Users, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import HappyTravelers from "@/components/home/HappyTravelers";
import CTABanner from "@/components/home/CTABanner";
import GalleryPreview from "@/components/GalleryPreview";
import Link from "next/link";
import { assets } from "@/public/assets/assets";

import { poppins, manrope } from "@/lib/fonts";
import Image from "next/image";
import FAQSection from "@/components/home/FAQs";
import TouristLoader from "@/components/common/TouristLoader";
import TourPackagesSection from "@/components/home/TourPackagesSection";

export default function Home() {
  const router = useRouter();
  const { user, loading, isLoggedIn } = useAuth();
  const { guides, loading: guidesLoading } = useGuide();
  const [pricing, setPricing] = useState<{
    halfDayPrice: number;
    fullDayPrice: number;
  } | null>(null);

  useEffect(() => {
    getPublicSettingsApi()
      .then((data: any) => {
        if (data?.guidePricing) {
          setPricing({
            halfDayPrice: data.guidePricing.halfDay.touristPrice,
            fullDayPrice: data.guidePricing.fullDay.touristPrice,
          });
        }
      })
      .catch((err) => console.error("Error fetching pricing", err));
  }, []);

  // Calculate top-rated guides (unchanged logic)
  const topRatedGuides = guides
    .filter((guide) => guide.verificationStatus === "VERIFIED")
    .sort((a, b) =>
      b.rating !== a.rating
        ? b.rating - a.rating
        : (b.totalReviews || 0) - (a.totalReviews || 0),
    )
    .slice(0, 4);

  const destinations = [
    { name: "Ram Mandir", image: assets.ramMandir },
    { name: "Hanuman Garhi", image: assets.hanumanGarhi },
    { name: "Hanuman Gufa", image: assets.hanumanGufa },
    { name: "Surya Kund", image: assets.suryaKundLaserShow },
    { name: "Valmiki Bhawan", image: assets.valmikiBhawan },
    { name: "Dashrath Mahal", image: assets.dashrathMahal },
    { name: "Kanak Bhawan", image: assets.kanakBhawan },
    { name: "Digambar Jain Mandir", image: assets.digambarJainMandir },
    { name: "Mani Parvat", image: assets.maniParvatAyodhya },
    { name: "Shwetambar Mandir", image: assets.shwetambarMandir },
    { name: "Sita Ki Rasoi", image: assets.sitaKiRasoi },
    { name: "Sri Ram Lala Sadan", image: assets.sriRamLalaSadan },
    { name: "Swami Narayan Chhapiya", image: assets.swamiNarayanChhapiya },
  ];

  const partners = [
    { image: assets.p_01 },
    { image: assets.aayovea },
    { image: assets.mj_wains },

    { image: assets.p_01 },
    { image: assets.aayovea },
    { image: assets.mj_wains },
  ];

  useEffect(() => {
    if (isLoggedIn) {
      if (user?.role === "GUIDE" && user.isProfileComplete)
        router.push("/guide/dashboard");
      if (user?.role === "DRIVER" && user.isProfileComplete)
        router.push("/driver/dashboard");
    }
  }, [user, loading, router, isLoggedIn]);

  if (loading) {
    return <TouristLoader fullScreen />;
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
                    title="GoCabs"
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
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
          <div className="mx-auto max-w-6xl relative">
            <h2 className="text-4xl md:text-6xl font-bold text-center text-foreground mb-12 text-balance">
              Popular{" "}
              <b className={`${poppins.className} text-secondary`}>
                Destinations
              </b>{" "}
            </h2>

            <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-6 px-1">
              {destinations.map((item, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-[75%] sm:w-[48%] md:w-[31%] lg:w-[23%] xl:w-[19%] snap-start group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-slate-900 border border-slate-800"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 75vw, (max-width: 768px) 48vw, (max-width: 1024px) 31vw, 19vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-4">
                    <p className="text-center font-bold text-white text-sm sm:text-base tracking-wide uppercase drop-shadow-md">
                      {item.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-slate-50 to-transparent"></div>

            <div className="flex justify-center mt-4 sm:hidden">
              <p className="text-xs text-slate-500 animate-pulse">
                ← Swipe to explore →
              </p>
            </div>
          </div>
        </section>

        {/* Top Guides */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-6xl font-bold text-foreground text-balance">
                Popular{" "}
                <b className={`${poppins.className} text-secondary`}>
                  Guides
                </b>{" "}
              </h2>
              {pricing && (
                <p className="mt-4 text-slate-600 font-medium">
                  Flat and transparent pricing: Half Day at just <span className="text-secondary font-bold">₹{pricing.halfDayPrice}</span> & Full Day at <span className="text-secondary font-bold">₹{pricing.fullDayPrice}</span>
                </p>
              )}
            </div>

            {guidesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div
                  className="w-10 h-10 border-4 border-primary border-t-indigo-500 rounded-full animate-spin"
                  aria-hidden
                ></div>
              </div>
            ) : topRatedGuides.length === 0 ? (
              <div className="text-center py-12 text-slate-600">
                No verified guides available yet. Check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {topRatedGuides.map((guide) => {
                  const reviewsCount = guide.totalReviews ?? 0;
                  const displayRating = reviewsCount > 0 ? guide.rating : 5;

                  return (
                    <article
                      key={guide.id}
                      className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col"
                    >
                      <div className="relative aspect-square overflow-hidden bg-slate-50 border-b border-slate-100">
                        {guide.image ? (
                          <Image
                            src={guide.image}
                            alt={guide.userId?.name || guide.name || "Guide"}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                            sizes="(max-width:768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Users className="h-12 w-12" />
                          </div>
                        )}

                        <div className="absolute left-3 top-3 backdrop-blur-md bg-white/70 border border-white/40 text-slate-800 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1 shadow-sm">
                          {guide.verificationStatus === "VERIFIED" ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Verified
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Pending
                            </>
                          )}
                        </div>
                      </div>

                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors duration-200 truncate">
                            {guide.userId?.name || guide.name || "Verified guide"}
                          </h3>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${i < Math.round(displayRating) ? "text-amber-400 fill-current" : "text-slate-200 fill-current"}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-bold text-slate-700">
                              {displayRating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-slate-500">
                            {reviewsCount === 0
                              ? ""
                              : `${reviewsCount} reviews`}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex justify-center pt-8">
            <Link href="/tourist/guides">
              <p className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary to-primary text-white hover:from-secondary/90 hover:to-orange-600/90 px-8 py-3.5 rounded-full font-bold shadow-md hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 transform hover:scale-[1.02]">
                <span>View All Guides</span>
                <ArrowRight className="w-4 h-4" />
              </p>
            </Link>
          </div>
        </section>

        {/* Tour Packages Section */}
        <TourPackagesSection />

        {/* Gallery Preview */}
        <GalleryPreview />

        {/* CTA Banner */}
        <CTABanner />

        {/* How it works */}
        <HowItWorks />

        {/* Happy Travelers */}
        <HappyTravelers />

        {/* Features */}
        <Features />

        {/* Team Section */}
        {/* <TeamSection /> */}

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
                  w-36 h-40 sm:w-44 sm:h-48 md:w-52 md:h-52
                  flex-shrink-0
                  rounded-2xl overflow-hidden
                  border-4 border-indigo-600/20 hover:border-indigo-600
                  transition-all duration-300 bg-white shadow-sm hover:shadow-md
                "
              >
                <div className="relative w-full h-full p-2 flex items-center justify-center">
                  <Image
                    alt="Our Partner"
                    src={item.image}
                    fill
                    className="object-contain p-2 hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 208px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
