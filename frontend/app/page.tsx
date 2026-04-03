"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { ServiceCard } from "@/components/common/ServiceCard";
import { Car, MapPin, Ticket, Users } from "lucide-react";
import { assets } from "@/public/assets/assets";

import { poppins, manrope } from "@/lib/fonts";

export default function Home() {
  const router = useRouter();
  const { user, loading, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      if (user?.role === "GUIDE") {
        router.push("/guide/dashboard");
      }

      if (user?.role === "TOURIST") {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div> */}

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
                title="Passes"
                description="Purchase tickets and passes for attractions"
                href="/tourist/tokens"
                icon={<Ticket className="h-8 w-8" />}
                target="_blank"
                rel="noopener noreferrer"
              />

              <ServiceCard
                title="Find a Guide"
                description="Connect with experienced local guides"
                href="/tourist/guides"
                icon={<Users className="h-8 w-8" />}
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
              Why Choose <i className="text-primary">Ayodhya</i> Tourism?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-border">
                <div className="text-primary text-3xl font-bold mb-3">100%</div>
                <h3 className="font-semibold text-foreground mb-2">Trusted</h3>
                <p className="text-muted-foreground">
                  Verified providers and secure transactions for peace of mind.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-border">
                <div className="text-secondary text-3xl font-bold mb-3">
                  24/7
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Available
                </h3>
                <p className="text-muted-foreground">
                  Round-the-clock support for all your travel needs.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-border">
                <div className="text-accent text-3xl font-bold mb-3">Best</div>
                <h3 className="font-semibold text-foreground mb-2">Prices</h3>
                <p className="text-muted-foreground">
                  Competitive rates and special packages for all budgets.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
