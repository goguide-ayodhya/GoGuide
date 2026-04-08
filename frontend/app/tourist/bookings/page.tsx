"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingsContext";
import { useReview } from "@/contexts/ReviewContext";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { BookingCard } from "@/components/booking/BookingCard";
import { CancelBookingModal } from "@/components/booking/CancelBookingModal";
import { ReviewModal } from "@/components/booking/ReviewModal";
import { ViewReviewModal } from "@/components/booking/ViewReviewModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, User, Filter } from "lucide-react";
import Link from "next/link";
import HeadingTitle from "@/components/common/headingTitle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BookingsPage() {
  const { isLoggedIn } = useAuth();
  const { bookings, cancelBooking, setBookings } = useBooking();
  const { createReview, getBookingReview } = useReview();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewReviewOpen, setViewReviewOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<
    string | null
  >(null);
  const [viewingReview, setViewingReview] = useState<{
    rating: number;
    comment: string;
    date?: string;
  } | null>(null);
  const statusOptions = [
    "PENDING",
    "ACCEPTED",
    "COMPLETED",
    "REJECTED",
    "CANCELLED",
  ] as const;
  const reviewOptions = ["REVIEWED", "UNREVIEWED"] as const;
  const [selectedStatuses, setSelectedStatuses] = useState<
    (typeof statusOptions)[number][]
  >([...statusOptions]);
  const [selectedReviewStatuses, setSelectedReviewStatuses] = useState<
    (typeof reviewOptions)[number][]
  >(["REVIEWED", "UNREVIEWED"]);

  const toggleStatus = (status: (typeof statusOptions)[number]) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status],
    );
  };

  const toggleReviewStatus = (reviewStatus: (typeof reviewOptions)[number]) => {
    setSelectedReviewStatuses((prev) =>
      prev.includes(reviewStatus)
        ? prev.filter((item) => item !== reviewStatus)
        : [...prev, reviewStatus],
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatuses([...statusOptions]);
    setSelectedReviewStatuses([...reviewOptions]);
    setSortBy("newest");
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex flex-col bg-background ">
        <Header showBack={true} />
        <HeadingTitle title={"My Bookings"} />

        <div className="flex items-center justify-center pt-8 px-4">
          <Card className="p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Sign In Required
            </h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your booking history
            </p>
            <Link href={`/login?redirect=/tourist/bookings`}>
              {" "}
              <Button className="w-full bg-secondary cursor-pointer hover:bg-secondary/90">
                Sign In
              </Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </main>
    );
  }

  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  const filteredBookings = sortedBookings.filter((b) => {
    const statusMatch = selectedStatuses.includes(b.status as any);
    const reviewMatch = selectedReviewStatuses.some((option) =>
      option === "REVIEWED"
        ? b.reviewed === true
        : b.reviewed === false || b.reviewed === undefined,
    );
    const searchMatch = searchTerm
      ? [b.touristName, b.tourType, b.bookingId]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      : true;

    return statusMatch && reviewMatch && searchMatch;
  });

  const handleCancel = (bookingId: string) => {
    cancelBooking(bookingId);
    setCancellingId(null);
  };

  const handleViewReview = async (bookingId: string) => {
    setSelectedBookingForReview(bookingId);
    try {
      const review = await getBookingReview(bookingId);
      if (review) {
        setViewingReview({
          rating: review.rating,
          comment: review.comments,
          date: review.createdAt,
        });
        setViewReviewOpen(true);
      }
    } catch (error: any) {
      toast({
        title: "Unable to load review",
        description:
          error?.message || "Could not load your review for this booking.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveReview = (bookingId: string) => {
    setSelectedBookingForReview(bookingId);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (
    bookingId: string,
    review: any,
    reviewId?: string | null,
  ) => {
    try {
      await createReview(bookingId, {
        rating: review.rating,
        comments: review.comment,
      });

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, reviewed: true } : booking,
        ),
      );

      toast({
        title: "Review submitted",
        description: "Thanks for sharing your experience.",
      });
    } catch (error: any) {
      toast({
        title: "Unable to submit review",
        description:
          error?.message || "Could not submit your review.",
        variant: "destructive",
      });
    } finally {
      setReviewModalOpen(false);
      setSelectedBookingForReview(null);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header showBack={true} />

      <div className="flex-1 px-4 py-8">
        <div className="mx-auto flex items-center justify-center">
          {bookings.length === 0 ? (
            <Card className="p-8 text-center max-w-xl">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No Bookings Yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Start booking your Ayodhya tour experience today
              </p>
              <Link
                href={`/login?redirect=/tourist/bookings`}
                className="block"
              >
                <Button className="max-w-lg bg-secondary cursor-pointer hover:bg-secondary/90">
                  Explore Services
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <aside className="hidden lg:block sticky top-28 self-start">
                  <Card className="space-y-4">
                    <CardHeader>
                      <CardTitle className="text-xl">Filters</CardTitle>
                      <CardDescription>
                        Refine your booking list
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="booking-search"
                          className="text-sm font-semibold"
                        >
                          Search bookings
                        </Label>
                        <Input
                          id="booking-search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search tourist, type or booking ID"
                          className="bg-background"
                        />
                      </div>

                      <div className="rounded-3xl border border-border bg-background p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold">
                            Booking Status
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {selectedStatuses.length} selected
                          </span>
                        </div>
                        <div className="space-y-2">
                          {statusOptions.map((status) => (
                            <label
                              key={status}
                              className="flex items-center gap-3 rounded-2xl border border-border/70 px-3 py-2 cursor-pointer transition hover:border-primary"
                            >
                              <Checkbox
                                checked={selectedStatuses.includes(status)}
                                onCheckedChange={() => toggleStatus(status)}
                              />
                              <span className="text-sm font-medium capitalize">
                                {status.toLowerCase()}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-3xl border border-border bg-background p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold">Review Status</p>
                          <span className="text-xs text-muted-foreground">
                            {selectedReviewStatuses.length} selected
                          </span>
                        </div>
                        <div className="space-y-2">
                          {reviewOptions.map((status) => (
                            <label
                              key={status}
                              className="flex items-center gap-3 rounded-2xl border border-border/70 px-3 py-2 cursor-pointer transition hover:border-primary"
                            >
                              <Checkbox
                                checked={selectedReviewStatuses.includes(
                                  status,
                                )}
                                onCheckedChange={() =>
                                  toggleReviewStatus(status)
                                }
                              />
                              <span className="text-sm font-medium capitalize">
                                {status.toLowerCase()}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                        >
                          Reset filters
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {filteredBookings.length} results
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </aside>

                <div className="space-y-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-3xl font-semibold text-destructive">
                        My Bookings
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {filteredBookings.length} bookings match your filters
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <Select
                        value={sortBy}
                        onValueChange={(value: any) => setSortBy(value)}
                      >
                        <SelectTrigger className="w-32 bg-background shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest</SelectItem>
                          <SelectItem value="oldest">Oldest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="lg:hidden space-y-4 mb-6">
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMobileFiltersOpen(true)}
                        className="flex items-center gap-2 flex-1"
                      >
                        <Filter className="h-4 w-4" />
                        Filters
                      </Button>
                    </div>
                  </div>

                  <Dialog
                    open={mobileFiltersOpen}
                    onOpenChange={setMobileFiltersOpen}
                  >
                    <DialogContent className="max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Filters</DialogTitle>
                      </DialogHeader>
                      <Card className="border-0 space-y-4">
                        <CardContent className="space-y-6 pt-6">
                          <div className="space-y-3">
                            <Label
                              htmlFor="mobile-booking-search"
                              className="text-sm font-semibold"
                            >
                              Search bookings
                            </Label>
                            <Input
                              id="mobile-booking-search"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search tourist, type or booking ID"
                              className="bg-background"
                            />
                          </div>

                          <div className="rounded-3xl border border-border bg-background p-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-semibold">
                                Booking Status
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {selectedStatuses.length} selected
                              </span>
                            </div>
                            <div className="space-y-2">
                              {statusOptions.map((status) => (
                                <label
                                  key={status}
                                  className="flex items-center gap-3 rounded-2xl border border-border/70 px-3 py-2 cursor-pointer transition hover:border-primary"
                                >
                                  <Checkbox
                                    checked={selectedStatuses.includes(status)}
                                    onCheckedChange={() => toggleStatus(status)}
                                  />
                                  <span className="text-sm font-medium capitalize">
                                    {status.toLowerCase()}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-3xl border border-border bg-background p-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-semibold">
                                Review Status
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {selectedReviewStatuses.length} selected
                              </span>
                            </div>
                            <div className="space-y-2">
                              {reviewOptions.map((status) => (
                                <label
                                  key={status}
                                  className="flex items-center gap-3 rounded-2xl border border-border/70 px-3 py-2 cursor-pointer transition hover:border-primary"
                                >
                                  <Checkbox
                                    checked={selectedReviewStatuses.includes(
                                      status,
                                    )}
                                    onCheckedChange={() =>
                                      toggleReviewStatus(status)
                                    }
                                  />
                                  <span className="text-sm font-medium capitalize">
                                    {status.toLowerCase()}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearFilters}
                              className="flex-1"
                            >
                              Reset
                            </Button>
                            <Button
                              onClick={() => setMobileFiltersOpen(false)}
                              className="flex-1 bg-secondary hover:bg-secondary/90"
                            >
                              Apply Filters
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogContent>
                  </Dialog>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onCancel={handleCancel}
                        onLeaveReview={handleLeaveReview}
                        onViewReview={handleViewReview}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      <CancelBookingModal
        open={!!cancellingId}
        onOpenChange={(open) => !open && setCancellingId(null)}
        onConfirm={() => cancellingId && handleCancel(cancellingId)}
      />

      {/* View Review Modal */}
      <ViewReviewModal
        open={viewReviewOpen}
        onOpenChange={setViewReviewOpen}
        review={viewingReview}
        guideName={
          selectedBookingForReview
            ? bookings.find((b) => b.id === selectedBookingForReview)
                ?.touristName
            : undefined
        }
      />

      {selectedBookingForReview && (
        <ReviewModal
          open={reviewModalOpen}
          bookingId={selectedBookingForReview}
          onOpenChange={(open) => {
            if (!open) setSelectedBookingForReview(null);
            setReviewModalOpen(open);
          }}
          onSubmit={handleSubmitReview}
        />
      )}

      <Footer />
    </main>
  );
}
