"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useGuide } from "@/contexts/GuideContext";

import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { ServiceCard } from "@/components/common/ServiceCard";
import Link from "next/link";
import { Car, MapPin, Ticket, Users, Star } from "lucide-react";
import { assets } from "@/public/assets/assets";

import { poppins, manrope } from "@/lib/fonts";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const { user, loading, isLoggedIn } = useAuth();
  const { guides, loading: guidesLoading } = useGuide();

  // Calculate top-rated guides
  const topRatedGuides = guides
    .filter((guide) => guide.verificationStatus === "VERIFIED")
    .sort((a, b) => {
      // Sort by rating first (descending), then by number of reviews (descending)
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return (b.totalReviews || 0) - (a.totalReviews || 0);
    })
    .slice(0, 6);

  const destinations = [
    { name: "Ram Mandir", image: assets.img_01 },
    { name: "Guptar Ghar", image: assets.img_02 },
    { name: "Surya Kund", image: assets.img_03 },
    { name: "Hanuman Garhi", image: assets.img_04 },
    { name: "Bharat Kund", image: assets.img_05 },
    { name: "Ayodhya", image: assets.img_06 },
  ];

  const partners = [
    { name: "Ram Mandir", image: assets.img_01 },
    { name: "Guptar Ghar", image: assets.img_02 },
    { name: "Surya Kund", image: assets.img_03 },
    { name: "Hanuman Garhi", image: assets.img_04 },
    { name: "Bharat Kund", image: assets.img_05 },
    { name: "Ayodhya", image: assets.img_06 },
  ];

  useEffect(() => {
    if (isLoggedIn) {
      if (user?.role === "GUIDE") {
        router.push("/guide/dashboard");
      }

      if (user?.role === "DRIVER") {
        router.push("/driver/dashboard");
      }

      if (user?.role === "TOURIST") {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {loading && (
        <div className="text-center">
          <div className="w-12 h-screen border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      )}
      <Header />

      <div className="flex-grow">
        {/* Hero Section */}
        <section className="relative flex items-center justify-center h-screen px-4 md:px-6 py-12 md:py-16">
          <img
            src={assets.bgHero.src}
            alt="ayodhyaTouristHeroImage"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-12 md:mb-16 flex flex-col items-center justify-center">
              <h1
                className={`${poppins.className} text-5xl md:text-8xl lg:text-9xl font-bold text-foreground mb-4 text-center text-white`}
              >
                Explore Ayodhya
              </h1>
              <p className="text-lg text-white text-center md:text-xl text-muted-foreground max-w-2xl text-pretty">
                Discover the sacred city with ease. Book cabs, guided tours,
                passes, and connect with local experts.
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <ServiceCard
                title="Find a Guide"
                description="Connect with experienced local guides"
                href="/tourist/guides"
                icon={<Users className="h-8 w-8" />}
                target="_blank"
                rel="noopener noreferrer"
              />
              <ServiceCard
                title="Cabs"
                description="Fast and reliable transportation throughout the city"
                href="/tourist/cabs"
                icon={<Car className="h-8 w-8" />}
                target="_blank"
                rel="noopener noreferrer"
              />

              <ServiceCard
                title="Tour Packages"
                description="Curated experiences and guided tours of sacred sites"
                href="/tourist/packages"
                icon={<MapPin className="h-8 w-8" />}
                target="_blank"
                rel="noopener noreferrer"
              />

              <ServiceCard
                title="Contact Us"
                description="Purchase tickets and passes for attractions"
                href="/contact-us"
                icon={<Ticket className="h-8 w-8" />}
                target="_blank"
                rel="noopener noreferrer"
              />
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="px-4 md:px-6 py-12 md:py-16 bg-muted/50">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-4xl md:text-6xl font-bold text-center text-foreground mb-8 text-balance">
              Popular{" "}
              <b className={`${poppins.className} text-destructive`}>
                Destinations
              </b>{" "}
            </h2>

            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">
              {destinations.map((item, index) => (
                <div
                  key={index}
                  className="
              min-w-[30%] sm:min-w-[22%] md:min-w-[18%] lg:min-w-[16%]
              snap-start
              rounded-xl overflow-hidden hover:shadow-sm
            "
                >
                  <div className="relative h-32 sm:h-36 md:h-48 lg:h-56">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <p className="text-center text-sm font-semibold py-2">
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Top Guides Section */}
        <section className="px-4  md:px-6 py-12 md:py-16 bg-primary/10">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-4xl md:text-6xl font-bold text-center text-foreground mb-8 text-balance">
              <b className={`${poppins.className} text-secondary`}>Our </b> Top
              Rated{" "}
              <b className={`${poppins.className} text-secondary`}>
                Guides
              </b>{" "}
            </h2>

            {guidesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : topRatedGuides.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No verified guides available yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">
                {topRatedGuides.map((guide) => (
                  <div
                    key={guide.id}
                    className="
              min-w-[30%] sm:min-w-[22%] md:min-w-[18%] lg:min-w-[16%]
              snap-start
              rounded-xl overflow-hidden hover:shadow-md transition-shadow
            "
                  >
                    <div className="relative h-32 sm:h-36 md:h-48 lg:h-56">
                      {guide.image ? (
                        <Image
                          src={guide.image}
                          alt={guide.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Users className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-background">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary">
                        {guide.name}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.round(guide.rating)
                                  ? "fill-secondary text-secondary"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          {guide.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {guide.totalReviews || 0} review
                        {(guide.totalReviews || 0) !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/tourist/guides">
              <button className="border border-ring px-4 py-2 rounded-md bg-primary hover:bg-muted text-white hover:text-black mt-4 cursor-pointer">
                View All Guides
              </button>
            </Link>
          </div>
        </section>

        {/* Top Drivers Section */}
        <section className="px-4  md:px-6 py-12 md:py-16 bg-primary/10">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-4xl md:text-6xl font-bold text-center text-foreground mb-8 text-balance">
              <b className={`${poppins.className} text-secondary`}>Our </b> Top
              Rated{" "}
              <b className={`${poppins.className} text-secondary`}>
                Drivers
              </b>{" "}
            </h2>

            {guidesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : topRatedGuides.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No verified guides available yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">
                {topRatedGuides.map((guide) => (
                  <div
                    key={guide.id}
                    className="
              min-w-[30%] sm:min-w-[22%] md:min-w-[18%] lg:min-w-[16%]
              snap-start
              rounded-xl overflow-hidden hover:shadow-md transition-shadow
            "
                  >
                    <div className="relative h-32 sm:h-36 md:h-48 lg:h-56">
                      {guide.image ? (
                        <Image
                          src={guide.image}
                          alt={guide.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Users className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-background">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary">
                        {guide.name}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.round(guide.rating)
                                  ? "fill-secondary text-secondary"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          {guide.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {guide.totalReviews || 0} review
                        {(guide.totalReviews || 0) !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/tourist/guides">
              <button className="border border-ring px-4 py-2 rounded-md bg-primary hover:bg-muted text-white hover:text-black mt-4 cursor-pointer">
                View All Guides
              </button>
            </Link>
          </div>
        </section>

        {/* Our Partners */}
        <section className="px-4 md:px-6 py-12 md:py-16 bg-muted/50">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-4xl md:text-6xl font-bold text-center text-foreground mb-8 text-balance">
              Our{" "}
              <b className={`${poppins.className} text-destructive`}>
                Partners
              </b>{" "}
            </h2>

            {/* SCROLLER */}
            <div className="overflow-hidden w-full">
              <div className="flex gap-4 w-max auto-scroll">
                {[...partners, ...partners].map((item, index) => (
                  <div
                    key={index}
                    className="
              min-w-[60%] sm:min-w-[40%] md:min-w-[25%] lg:min-w-[18%]
              rounded-xl overflow-hidden hover:shadow-md transition-all
            "
                  >
                    <div className="relative h-32 sm:h-36 md:h-48 lg:h-56">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
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
        </section>
      </div>

      <Footer />
    </main>
  );
}
