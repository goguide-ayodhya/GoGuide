"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import {
  BookingForm,
  type BookingData,
} from "@/components/features/BookingForm";
import { ConfirmationModal } from "@/components/features/ConfirmationModal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Guide, useGuide } from "@/contexts/GuideContext";
import { getGuideById } from "@/lib/api/guides";
import { assets } from "@/public/assets/assets";
import {
  Star,
  MapPin,
  Users,
  Award,
  MessageCircle,
  Circle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { poppins } from "@/lib/fonts";

export default function GuideDetailsPage() {
  const params = useParams();
  const guideId = params.id as string;
  const { guides } = useGuide();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [selectedCertificateIndex, setSelectedCertificateIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    const fetchGuide = async () => {
      const guideFromContext = guides.find((g: Guide) => g.id === guideId);
      if (guideFromContext) {
        setGuide(guideFromContext);
        setLoading(false);
        return;
      }

      try {
        const data = await getGuideById(guideId);
        if (!data) {
          notFound();
          return;
        }

        const normalizedUserId = data.userId
          ? {
              id: data.userId._id || data.userId.id || "",
              name: data.userId.name || "Unknown Guide",
              email: data.userId.email || "",
              avatar: data.userId.avatar || "",
              phone: data.userId.phone || "",
              status: data.userId.status || "ACTIVE",
            }
          : null;

        const formattedGuide: Guide = {
          id: data._id,
          userId: normalizedUserId,
          name: normalizedUserId?.name || data.name || "Unknown Guide",
          email: normalizedUserId?.email || data.email || "",
          bio: data.bio || data.userId?.bio || "",
          avatar: normalizedUserId?.avatar || "",
          image: normalizedUserId?.avatar || data.userId?.profileImage || "",
          experience: data.yearsOfExperience || data.experience || 0,
          rating: data.averageRating || data.rating || 0,
          languages: Array.isArray(data.languages) ? data.languages : [],
          specialities: Array.isArray(data.specialities)
            ? data.specialities
            : data.speciality
            ? [data.speciality]
            : [],
          locations: Array.isArray(data.locations) ? data.locations : [],
          price: data.price || 0,
          duration: data.duration || "hour",
          isAvailable: data.isAvailable ?? false,
          certificates: Array.isArray(data.certificates) ? data.certificates : [],
          yearsOfExperience: data.yearsOfExperience || data.experience || 0,
          totalReviews: data.totalReviews || 0,
          verificationStatus: data.verificationStatus as "PENDING" | "VERIFIED" | "REJECTED",
        };

        setGuide(formattedGuide);
      } catch (error) {
        console.error("Error fetching guide:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [guideId, guides]);

  if (loading) {
    return (
      <main className={`${poppins.className} min-h-screen bg-slate-50 text-slate-950`}>
        <Header />
        <div className="flex min-h-[calc(100vh-96px)] items-center justify-center px-4 py-16">
          <Card className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/30">
            <p className="text-xl font-semibold text-slate-900">Loading guide profile...</p>
          </Card>
        </div>
        <Footer />
      </main>
    );
  }

  if (!guide) {
    return notFound();
  }

  const languages = Array.isArray(guide.languages)
    ? guide.languages
    : guide.languages
    ? [guide.languages]
    : [];

  const specialties = guide.specialities || [];
  const isAvailable = guide.isAvailable;
  const certificates = guide?.certificates || [];
  const selectedCertificate =
    selectedCertificateIndex !== null
      ? certificates[selectedCertificateIndex]
      : null;

  const openCertificateViewer = (index: number) => {
    setSelectedCertificateIndex(index);
  };

  const closeCertificateViewer = () => {
    setSelectedCertificateIndex(null);
  };

  const showPreviousCertificate = () => {
    if (!certificates.length) return;
    setSelectedCertificateIndex((current) => {
      if (current === null) return certificates.length - 1;
      return current === 0 ? certificates.length - 1 : current - 1;
    });
  };

  const showNextCertificate = () => {
    if (!certificates.length) return;
    setSelectedCertificateIndex((current) => {
      if (current === null) return 0;
      return (current + 1) % certificates.length;
    });
  };

  const handleBookingSubmit = (data: BookingData) => {
    setBookingData(data);
    setShowConfirmation(true);
  };

  const availableStatus = isAvailable ? (
    <Badge className="bg-secondary text-white border-0">Available</Badge>
  ) : (
    <Badge variant="outline">Currently Unavailable</Badge>
  );

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header showBackButton />

      <div className="flex-grow">
        <div className="px-4 md:px-6 py-8">
          <div className="mx-auto max-w-6xl">
            {/* Guide Header */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Section */}
                <div className="md:col-span-1">
                  <Card className="overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Users className="h-24 w-24 text-primary/20" />
                    </div>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold text-foreground mb-1">
                        {guide.userId?.name || guide.name}
                      </h1>
                      <p className="text-muted-foreground mb-4">
                        {guide.experience}+ years experience
                      </p>

                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 fill-accent text-accent" />
                            <span className="font-semibold text-foreground">
                              {guide.rating}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Rating
                          </span>
                        </div>

                      <div className="flex items-center justify-between">
                          <div className="text-xl font-bold text-primary">
                            ₹{guide.price}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            /{guide.duration || "hour"}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4">
                        <p className="text-sm font-semibold text-foreground mb-2">
                          Status
                        </p>
                        {availableStatus}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Info Section */}
                <div className="md:col-span-2 space-y-6">
                  {/* Bio */}
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-3">
                      About
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {guide.bio}
                    </p>
                  </Card>

                  {/* Languages */}
                  <Card className="p-6">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((lang: string) => (
                        <Badge key={lang} variant="secondary">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </Card>

                  {/* Specialties */}
                  <Card className="p-6">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5 text-secondary" />
                      Specialties
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {specialties.length ? (
                        specialties.map((speciality: string) => (
                          <Badge key={speciality} variant="outline">
                            {speciality}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Custom itinerary tailoring available
                        </span>
                      )}
                    </div>
                  </Card>

                  {/* Certificates */}
                  {guide.certificates && guide.certificates.length > 0 && (
                    <Card className="p-6">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Award className="h-5 w-5 text-accent" />
                        Certificates
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {guide.certificates.map((cert: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => cert.image && openCertificateViewer(index)}
                          >
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <Award className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {cert.name && !cert.name.match(/\.(jpg|jpeg|png|webp|gif|pdf|avif)$/i) && !cert.name.startsWith("http") ? cert.name : `Certificate ${index + 1}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Click to view
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  About Your Tour
                </h2>
                <Card className="p-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      What to Expect
                    </h4>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Personalized walking tour of sacred sites</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>In-depth cultural and historical insights</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Photography opportunities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Flexible itinerary based on your interests</span>
                      </li>
                    </ul>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Book This Guide
                </h2>
                <BookingForm guide={guide} onSubmit={handleBookingSubmit} />
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Reviews
              </h2>
              <Card className="p-6">
                <div className="text-center py-8">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="h-6 w-6 fill-accent text-accent" />
                    <span className="text-3xl font-bold text-foreground">
                      {guide.rating}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Based on verified bookings
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {selectedCertificate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeCertificateViewer}
        >
          <div
            className="relative w-full max-w-5xl rounded-[1.5rem] border border-border bg-background p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeCertificateViewer}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Close certificate viewer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {selectedCertificate.name &&
                  !selectedCertificate.name.match(
                    /\.(jpg|jpeg|png|webp|gif|pdf|avif)$/i,
                  ) &&
                  !selectedCertificate.name.startsWith("http")
                    ? selectedCertificate.name
                    : `Certificate ${selectedCertificateIndex! + 1}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedCertificateIndex! + 1} of {certificates.length}
                </p>
              </div>
            </div>

            <div className="relative flex min-h-[60vh] items-center justify-center rounded-[1rem] bg-muted/30 p-2">
              <button
                type="button"
                onClick={showPreviousCertificate}
                disabled={certificates.length <= 1}
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous certificate"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={showNextCertificate}
                disabled={certificates.length <= 1}
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next certificate"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {selectedCertificate.image?.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={selectedCertificate.image}
                  title="Certificate preview"
                  className="h-[70vh] w-full rounded-[0.8rem] border border-border"
                />
              ) : (
                <img
                  src={selectedCertificate.image}
                  alt={
                    selectedCertificate.name || `Certificate ${selectedCertificateIndex! + 1}`
                  }
                  className="max-h-[75vh] w-full rounded-[0.8rem] object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        guide={guide}
        bookingData={bookingData}
        onClose={() => setShowConfirmation(false)}
      />
    </main>
  );
}
