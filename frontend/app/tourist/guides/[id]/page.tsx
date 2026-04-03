"use client";

import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import {
  BookingForm,
  type BookingData,
} from "@/components/features/BookingForm";
import { ConfirmationModal } from "@/components/features/ConfirmationModal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Star, MapPin, Users, Award, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { Guide, useGuide } from "@/contexts/GuideContext";

export default function GuideDetailsPage() {
  const params = useParams();
  const guideId = params.id as string;
  const { guides } = useGuide();

  const guide = guides.find((g: Guide) => g.id === guideId);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  if (!guide) {
    notFound();
  }

  const handleBookingSubmit = (data: BookingData) => {
    setBookingData(data);
    setShowConfirmation(true);
  };

  const availableStatus = guide.isAvailable ? (
    <Badge className="bg-secondary text-white border-0">Available</Badge>
  ) : (
    <Badge variant="outline">Currently Unavailable</Badge>
  );

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header title="Guide Details" showBackButton />

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
                        {guide.name}
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
                            /hour
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
                      {(guide.languages || []).map((lang: string) => (
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
                      {guide.specialities ||
                        [].map((speciality: string) => (
                          <Badge key={speciality} variant="outline">
                            {speciality}
                          </Badge>
                        ))}
                    </div>
                  </Card>
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
