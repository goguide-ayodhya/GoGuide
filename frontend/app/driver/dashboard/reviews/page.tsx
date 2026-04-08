"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDriver } from "@/contexts/DriverContext";
import { useReview } from "@/contexts/ReviewContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Star, Filter, Search } from "lucide-react";

export default function ReviewsPage() {
  const { myDriver } = useDriver();
  const { reviews, getDriverReview } = useReview();
  const [filteredReviews, setFilteredReviews] = useState(reviews || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    if (myDriver?.id) {
      getDriverReview(myDriver.id).catch((error) => {
        console.error("Failed to load driver reviews", error);
      });
    }
  }, [myDriver?.id, getDriverReview]);

  useEffect(() => {
    if (!reviews) return;

    let filtered = [...reviews];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.comments.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Rating filter
    if (ratingFilter !== "all") {
      filtered = filtered.filter(review => review.rating === parseInt(ratingFilter));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
  }, [reviews, searchTerm, ratingFilter, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Driver Reviews</h1>
          <p className="text-muted-foreground mt-2">
            See all reviews left by tourists for your driver profile.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/driver/dashboard/profile">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft size={16} /> Back to Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Rating</SelectItem>
                <SelectItem value="lowest">Lowest Rating</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setRatingFilter("all");
                setSortBy("newest");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle>Review History</CardTitle>
          <CardDescription>
            {myDriver?.name
              ? `Showing ${filteredReviews.length} review${filteredReviews.length !== 1 ? 's' : ''} for ${myDriver.name}`
              : "Sign in as a driver to see your reviews."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReviews && filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border border-border p-4 bg-background"
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Booking ID</p>
                      <p className="font-medium text-foreground">
                        {review.bookingId}
                      </p>
                    </div>
                    <div className="flex gap-1 text-yellow-400">
                      {[...Array(5)].map((_, index) => (
                        <span key={index}>
                          {index < review.rating ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-foreground leading-relaxed mb-3">
                    {review.comments}
                  </p>

                  <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:justify-between">
                    <span>Review Date: {new Date(review.createdAt).toLocaleDateString()}</span>
                    <span>Review Count: {filteredReviews.length}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  {reviews && reviews.length > 0
                    ? "No reviews match your current filters."
                    : "You don't have any reviews yet. Complete more rides to receive feedback."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
