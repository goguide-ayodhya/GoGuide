"use client";

import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingsContext";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { CabBookingForm } from "@/components/booking/CabBookingForm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { Star, Circle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDriver, Driver } from "@/contexts/DriverContext";
import { assets } from "@/public/assets/assets";
import { createBooking } from "@/lib/api/bookings";
import { poppins } from "@/lib/fonts";
import { useState, useEffect } from "react";

export default function CabBookingPage() {
  const params = useParams();
  const router = useRouter();
  const { drivers, loading: driversLoading, getDriverById } = useDriver();
  const { isLoggedIn } = useAuth();
  const { setCurrentBooking } = useBooking();

  const driverId = params.id as string;
  console.log("driverId from URL:", driverId);

  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDriver = async () => {
      if (!driverId) {
        router.replace("/tourist/cabs");
        return;
      }

      try {
        setLoading(true);
        // First try to find in cached drivers
        let foundDriver: any = drivers.find((d: Driver) => d.id === driverId);

        if (!foundDriver) {
          // If not found in cache, fetch and normalize from backend
          foundDriver = await getDriverById(driverId);
        }

        if (!foundDriver) {
          notFound();
          return;
        }

        setDriver(foundDriver);
      } catch (error) {
        console.error("Error fetching driver:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    if (driverId) {
      fetchDriver();
    }
  }, [driverId, drivers, router, getDriverById]);

  if (loading || driversLoading) {
    return (
      <main className={`${poppins.className} min-h-screen bg-slate-50 text-slate-950`}>
        <Header />
        <div className="flex min-h-[calc(100vh-96px)] items-center justify-center px-4 py-16">
          <Card className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/30">
            <p className="text-xl font-semibold text-slate-900">Loading driver details...</p>
          </Card>
        </div>
        <Footer />
      </main>
    );
  }

  if (!driver) {
    notFound();
  }

  const isDriverAvailable =
    driver.isAvailable && driver.verificationStatus === "VERIFIED";

  const handleProceedToPayment = async (formData: {
    meetingPoint: string;
    dropoffLocation: string;
    bookingDate: string;
    startTime: string;
    groupSize: number;
    touristName: string;
    email: string;
    phone: string;
  }) => {
    setError(null);

    try {
      const estimatedDistance = 10;
      const totalPrice = estimatedDistance * driver.pricePerKm;
      const bookingDateTime = `${formData.bookingDate}T${formData.startTime}:00.000Z`;

      const bookingPayload = {
        driverId: driverId,
        bookingType: "DRIVER",
        touristName: formData.touristName,
        email: formData.email,
        phone: formData.phone,
        groupSize: formData.groupSize,
        bookingDate: bookingDateTime,
        startTime: formData.startTime,
        tourType: "Cab Service",
        meetingPoint: formData.meetingPoint,
        dropoffLocation: formData.dropoffLocation,
        totalPrice: totalPrice,
      };

      const bookingRes = await createBooking(bookingPayload);
      const bookingData = bookingRes?.data || bookingRes;

      if (!bookingData) {
        throw new Error("Booking failed");
      }

      const normalizedBooking = {
        ...bookingData,
        id: bookingData._id || bookingData.id,
      };

      setCurrentBooking({
        ...normalizedBooking,
        paymentMethod: null,
      });
      router.push(`/tourist/payment?bookingId=${normalizedBooking.id}`);
    } catch (error: any) {
      console.log("Error: ", error);
      const errorMessage = error.errors
        ? Object.values(error.errors).join(", ")
        : error.message || "An error occurred while creating the booking";
      setError(errorMessage);
    }
  };

  return (
    <main className={`${poppins.className} min-h-screen bg-slate-50 text-slate-950`}>
      <Header showBack={true} />

      <div className="px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Driver Profile Section */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/20">
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
              <div className="flex flex-col gap-6">
                <div className="grid gap-4 sm:grid-cols-[160px_1fr] items-center">
                  <div className="relative aspect-square overflow-hidden rounded-[1.75rem] bg-slate-100">
                    <Image
                      src={driver.avatar || assets.guideImage}
                      alt={driver.name}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-orange-600">Driver profile</p>
                        <h1 className="mt-2 text-3xl font-semibold text-slate-950">{driver.name}</h1>
                      </div>
                      <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                        {isDriverAvailable ? "Available" : "Unavailable"}
                      </div>
                    </div>

                    <p className="text-sm leading-7 text-slate-600">
                      {driver.vehicleName} • {driver.vehicleType} • {driver.seats} seats
                    </p>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-orange-500 text-orange-500" />
                        <span className="font-semibold text-slate-900">{driver.averageRating.toFixed(1)}</span>
                        <span className="text-sm text-slate-500">({driver.totalRides} rides)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Price per km</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">₹{driver.pricePerKm}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Rating</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">{driver.averageRating.toFixed(1)}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total rides</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">{driver.totalRides}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-orange-600">Quick details</p>
                <div className="mt-6 space-y-4 text-sm text-slate-600">
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="font-semibold text-slate-900">Vehicle info</p>
                    <p className="mt-2">{driver.vehicleName} - {driver.vehicleType}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="font-semibold text-slate-900">Contact</p>
                    <p className="mt-2 text-slate-700">{driver.email}</p>
                    <p className="text-slate-700">{driver.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {!isDriverAvailable && (
            <Alert className="rounded-[1.75rem] border border-amber-200 bg-amber-50 text-amber-900">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This driver is currently not available for booking. Please choose another driver.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="rounded-[1.75rem] border border-red-200 bg-red-50 text-red-900">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Booking Section */}
          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
            <div className="space-y-6">
              <Card className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-semibold text-slate-950 mb-4">About this driver</h2>
                <p className="text-slate-600 leading-7">
                  Experience reliable, professional cab service with a verified driver. Your comfort and safety are our top priority. Professional driving with local expertise and excellent customer service.
                </p>
              </Card>

              <Card className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-950 mb-4">What to expect</h3>
                <ul className="space-y-4 text-slate-600">
                  <li className="flex items-start gap-3">
                    <Circle className="mt-1 h-3 w-3 text-orange-500" />
                    <span>Professional and courteous driver service</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Circle className="mt-1 h-3 w-3 text-orange-500" />
                    <span>Clean and well-maintained vehicle</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Circle className="mt-1 h-3 w-3 text-orange-500" />
                    <span>Safe route and timely arrival guaranteed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Circle className="mt-1 h-3 w-3 text-orange-500" />
                    <span>Flexible pickup and dropoff locations</span>
                  </li>
                </ul>
              </Card>
            </div>

            <Card className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm h-fit">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-orange-600">Book the driver</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">Booking details</h2>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {isDriverAvailable ? "Open" : "Unavailable"}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Price per km</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">₹{driver.pricePerKm}</p>
                </div>

                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Rating</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{driver.averageRating.toFixed(1)} / 5</p>
                </div>
              </div>

              <div className="relative">
                {!isLoggedIn && (
                  <div className="absolute inset-0 rounded-[1.75rem] bg-white/70 flex items-center justify-center z-10">
                    <div className="text-center">
                      <p className="text-slate-900 font-semibold mb-2">Sign in to book</p>
                      <a
                        href={`/login?redirect=/tourist/cabs/book/${driverId}`}
                        className="text-orange-600 hover:text-orange-700 font-semibold"
                      >
                        Sign in here
                      </a>
                    </div>
                  </div>
                )}
                <CabBookingForm onSubmit={handleProceedToPayment} />
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
