"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Search, Star, Trash2, Calendar, Shield, Flag, ThumbsUp, 
  Sparkles, AlertTriangle, Image as ImageIcon, MapPin, Tag, ArrowRight, Eye, Clock, User
} from "lucide-react"
import { 
  getAllReviewsApi, 
  getAdminReviewAnalyticsApi, 
  toggleFeaturedApi, 
  deleteReviewApi 
} from "@/lib/api/reviews"
import { useToast } from "@/hooks/use-toast"

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalReviews: 0,
    websiteReviewsCount: 0,
    guideReviewsCount: 0,
    averageRating: 4.8,
    reviewsThisMonth: 0,
    featuredReviewsCount: 0,
    reportedReviewsCount: 0
  })

  // Filters State
  const [searchQuery, setSearchQuery] = useState("")
  const [guideQuery, setGuideQuery] = useState("")
  const [reviewType, setReviewType] = useState<"all" | "website" | "guide">("all")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isFeaturedFilter, setIsFeaturedFilter] = useState(false)
  const [isReportedFilter, setIsReportedFilter] = useState(false)
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent")

  // Pagination State
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Dialog States
  const [selectedReview, setSelectedReview] = useState<any | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  
  // Expiry / Temporary Featured Dialog States
  const [featureReviewId, setFeatureReviewId] = useState<string | null>(null)
  const [featureReviewType, setFeatureReviewType] = useState<string>("guide")
  const [featuredUntilDate, setFeaturedUntilDate] = useState("")
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false)

  // Lightbox Image Preview
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null)
  
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      // Build query params
      const params: any = {
        page,
        limit,
        sort: sortOrder,
      }

      if (searchQuery) params.search = searchQuery
      if (guideQuery) params.guideSearch = guideQuery
      if (reviewType !== "all") params.type = reviewType
      if (ratingFilter !== "all") params.rating = Number(ratingFilter)
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      if (isFeaturedFilter) params.isFeatured = true
      if (isReportedFilter) params.isReported = true

      const [reviewsRes, statsRes] = await Promise.all([
        getAllReviewsApi(params).catch(() => null),
        getAdminReviewAnalyticsApi().catch(() => null)
      ])

      if (reviewsRes) {
        setReviews(reviewsRes.reviews || [])
        setTotalPages(reviewsRes.totalPages || 1)
        setTotalCount(reviewsRes.totalCount || 0)
      }

      if (statsRes) {
        setStats(statsRes)
      }
    } catch (error) {
      console.error("Failed to load reviews data", error)
      toast({ title: "Failed to load reviews", description: String(error) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [
    page, 
    limit, 
    reviewType, 
    ratingFilter, 
    startDate, 
    endDate, 
    isFeaturedFilter, 
    isReportedFilter, 
    sortOrder
  ])

  // Trigger search manually or on Enter key
  const handleSearchSubmit = () => {
    setPage(1)
    loadData()
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setGuideQuery("")
    setReviewType("all")
    setRatingFilter("all")
    setStartDate("")
    setEndDate("")
    setIsFeaturedFilter(false)
    setIsReportedFilter(false)
    setSortOrder("recent")
    setPage(1)
  }

  const handleDelete = async (reviewId: string, type: "website" | "guide") => {
    try {
      setLoading(true)
      await deleteReviewApi(reviewId, type)
      toast({ title: "Review deleted", description: "The review was permanently removed." })
      // Reload page data
      loadData()
    } catch (error: any) {
      console.error("Delete review error", error)
      toast({ title: "Failed to delete review", description: error?.message || String(error) })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFeaturedDirectly = async (review: any) => {
    try {
      setLoading(true)
      const newFeaturedState = !review.isActiveFeatured
      await toggleFeaturedApi(review._id, review.type, newFeaturedState)
      toast({ 
        title: newFeaturedState ? "Featured Review" : "Unfeatured Review", 
        description: `Review is ${newFeaturedState ? "now featured" : "no longer featured"}.` 
      })
      loadData()
    } catch (error: any) {
      toast({ title: "Failed to update featured", description: error.message || String(error) })
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleFeatured = (review: any) => {
    setFeatureReviewId(review._id)
    setFeatureReviewType(review.type)
    setFeaturedUntilDate(
      review.featuredUntil ? new Date(review.featuredUntil).toISOString().split("T")[0] : ""
    )
    setIsFeatureDialogOpen(true)
  }

  const handleSaveFeatureSchedule = async () => {
    if (!featureReviewId) return
    try {
      setLoading(true)
      await toggleFeaturedApi(
        featureReviewId, 
        featureReviewType, 
        true, 
        featuredUntilDate || undefined
      )
      setIsFeatureDialogOpen(false)
      toast({ 
        title: "Featured scheduled", 
        description: featuredUntilDate 
          ? `Review is featured until ${featuredUntilDate}` 
          : "Review is featured permanently." 
      })
      loadData()
    } catch (error: any) {
      toast({ title: "Failed to schedule featured", description: error.message || String(error) })
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? "fill-warning text-warning" 
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Reviews Hub</h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          Moderate traveler feedback, website experience reviews, and local guide ratings.
        </p>
      </div>

      {/* ─── 7 ANALYTICS CARDS ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
        
        {/* Total Reviews */}
        <Card className="border border-border/80 shadow-sm bg-card hover:shadow-md transition">
          <CardContent className="p-4 flex flex-col justify-between h-24">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Reviews</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-foreground">{stats.totalReviews}</span>
              <MessageSquareIcon className="w-5 h-5 text-indigo-500 shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Website Reviews */}
        <Card className="border border-border/80 shadow-sm bg-card hover:shadow-md transition">
          <CardContent className="p-4 flex flex-col justify-between h-24">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Website Reviews</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-foreground">{stats.websiteReviewsCount}</span>
              <Tag className="w-5 h-5 text-emerald-500 shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Guide Reviews */}
        <Card className="border border-border/80 shadow-sm bg-card hover:shadow-md transition">
          <CardContent className="p-4 flex flex-col justify-between h-24">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Guide Reviews</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-foreground">{stats.guideReviewsCount}</span>
              <Shield className="w-5 h-5 text-sky-500 shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Average Rating */}
        <Card className="border border-border/80 shadow-sm bg-card hover:shadow-md transition">
          <CardContent className="p-4 flex flex-col justify-between h-24">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Average Rating</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-foreground">{stats.averageRating}</span>
              <Star className="w-5 h-5 fill-warning text-warning shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Reviews This Month */}
        <Card className="border border-border/80 shadow-sm bg-card hover:shadow-md transition">
          <CardContent className="p-4 flex flex-col justify-between h-24">
            <span className="text-xs font-semibold text-muted-foreground uppercase">This Month</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-foreground">{stats.reviewsThisMonth}</span>
              <Calendar className="w-5 h-5 text-amber-500 shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Featured Reviews */}
        <Card className="border border-border/80 shadow-sm bg-card hover:shadow-md transition">
          <CardContent className="p-4 flex flex-col justify-between h-24">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Featured Reviews</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-foreground">{stats.featuredReviewsCount}</span>
              <Sparkles className="w-5 h-5 text-orange-500 shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Reported Reviews */}
        <Card className={`border shadow-sm transition hover:shadow-md ${stats.reportedReviewsCount > 0 ? "border-red-200 bg-red-50/10" : "border-border/80"}`}>
          <CardContent className="p-4 flex flex-col justify-between h-24">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Reported</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className={`text-2xl font-black ${stats.reportedReviewsCount > 0 ? "text-red-650" : "text-foreground"}`}>{stats.reportedReviewsCount}</span>
              <Flag className={`w-5 h-5 shrink-0 ${stats.reportedReviewsCount > 0 ? "text-red-500" : "text-slate-400"}`} />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ─── FILTERS & SEARCH TOOLBAR ─── */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Search query (Traveler/Comments) */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search traveler name or comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Guide Name search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search specific guide by name..."
                value={guideQuery}
                onChange={(e) => setGuideQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Review Type */}
            <div>
              <select
                value={reviewType}
                onChange={(e) => {
                  setReviewType(e.target.value as any)
                  setPage(1)
                }}
                className="w-full h-11 px-3 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Reviews Types</option>
                <option value="website">Website Reviews Only</option>
                <option value="guide">Guide Reviews Only</option>
              </select>
            </div>

            {/* Rating */}
            <div>
              <select
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value)
                  setPage(1)
                }}
                className="w-full h-11 px-3 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Star Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            {/* Date Range Start */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            {/* Date Range End */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            {/* Sort Order */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sorting</label>
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as any)
                  setPage(1)
                }}
                className="w-full h-11 px-3 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="recent">Recent First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex items-end gap-2">
              <Button onClick={handleSearchSubmit} className="flex-1">
                Apply Search
              </Button>
              <Button variant="outline" onClick={handleClearFilters} className="flex-1">
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-border/50">
            {/* Featured Switch */}
            <div className="flex items-center space-x-2">
              <Switch 
                id="filter-featured" 
                checked={isFeaturedFilter}
                onCheckedChange={(checked) => {
                  setIsFeaturedFilter(checked)
                  setPage(1)
                }}
              />
              <Label htmlFor="filter-featured" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 cursor-pointer">
                Featured reviews only
              </Label>
            </div>

            {/* Reported Switch */}
            <div className="flex items-center space-x-2">
              <Switch 
                id="filter-reported" 
                checked={isReportedFilter}
                onCheckedChange={(checked) => {
                  setIsReportedFilter(checked)
                  setPage(1)
                }}
              />
              <Label htmlFor="filter-reported" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 cursor-pointer">
                Reported reviews only
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── REVIEW CARD GRID ─── */}
      {reviews.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-card">
          <MessageSquareIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold text-foreground">No reviews found</h3>
          <p className="text-sm text-muted-foreground mt-1">Try adjustments to search queries or filter choices.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => {
            const hasImages = review.images && review.images.length > 0;
            const isWebsite = review.type === "website";

            return (
              <div 
                key={review._id} 
                className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md bg-card relative ${
                  review.isReported 
                    ? "border-red-500/35 bg-red-50/5" 
                    : "border-border"
                }`}
              >
                
                {/* Reported Alert banner */}
                {review.isReported && (
                  <div className="mb-4 p-3 rounded-xl bg-red-100/40 dark:bg-red-950/20 border border-red-200/50 flex items-start gap-2 text-xs text-red-650 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                    <div>
                      <p className="font-bold uppercase tracking-wider text-[10px]">Reported Abuse</p>
                      <p className="mt-0.5">{review.reportReason || "Inappropriate comment flagged."}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  
                  {/* Card Header Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Initials Avatar */}
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        {review.unifiedTravelerName ? review.unifiedTravelerName.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-foreground">{review.unifiedTravelerName || "Unknown"}</span>
                          <Shield className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          {review.city && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5" />
                              {review.city}
                            </span>
                          )}
                          <span>•</span>
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <Badge variant={isWebsite ? "default" : "secondary"} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5">
                        {isWebsite ? "Website Feedback" : "Guide Review"}
                      </Badge>
                      {review.bookingType && (
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {review.bookingType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stars & Title */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-xs font-bold text-foreground">({review.rating}/5)</span>
                    </div>
                    {review.title && (
                      <h4 className="text-sm font-bold text-foreground pt-1">{review.title}</h4>
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {review.comments}
                  </p>

                  {/* Link Guide name if guide review */}
                  {!isWebsite && review.unifiedGuideName && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-md">
                      <User className="w-3 h-3" />
                      Guide: {review.unifiedGuideName}
                    </div>
                  )}

                  {/* Review Images list */}
                  {hasImages && (
                    <div className="flex gap-2 pt-2">
                      {review.images.map((img: string, i: number) => {
                        const absoluteUrl = img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_BASE_URL?.replace("/api/", "")}${img}`;
                        return (
                          <div 
                            key={i} 
                            onClick={() => setLightboxImageUrl(absoluteUrl)}
                            className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border cursor-zoom-in hover:opacity-80 transition"
                          >
                            <img src={absoluteUrl} alt="Review Attachment" className="w-full h-full object-cover" />
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Display Expiration status if featured temporarily */}
                  {review.isActiveFeatured && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-lg w-fit">
                      <Clock className="w-3.5 h-3.5" />
                      Featured: {review.featuredUntil ? `Expires ${new Date(review.featuredUntil).toLocaleDateString()}` : "Permanent"}
                    </div>
                  )}

                </div>

                {/* Card Operations Footer */}
                <div className="flex items-center justify-between border-t border-border mt-6 pt-4">
                  {/* Helpful Indicator */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{review.helpfulCount || 0} helpful votes</span>
                  </div>

                  {/* Operational Buttons */}
                  <div className="flex items-center gap-2">
                    
                    {/* View full dialog details */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedReview(review)
                        setViewDialogOpen(true)
                      }}
                      className="h-9 px-3 text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Details
                    </Button>

                    {/* Toggle Featured direct */}
                    <Button
                      variant={review.isActiveFeatured ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleFeaturedDirectly(review)}
                      className={`h-9 px-3 text-xs ${review.isActiveFeatured ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}`}
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      {review.isActiveFeatured ? "Featured" : "Feature"}
                    </Button>

                    {/* Expiry Calendar Setup */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleScheduleFeatured(review)}
                      className="h-9 w-9 shrink-0 text-slate-500 hover:text-amber-500 hover:border-amber-500"
                      title="Set feature schedule expiration"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </Button>

                    {/* DeleteAlertDialog */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Review</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this review? This action cannot be undone and will update any linked guide ratings.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(review._id, review.type)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* ─── PAGINATION BOTTOM CONTROL ─── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-6 mt-4">
          <span className="text-xs text-muted-foreground">
            Showing Page <b>{page}</b> of <b>{totalPages}</b> (Total {totalCount} reviews)
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              className="text-xs"
            >
              Previous Page
            </Button>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              className="text-xs"
            >
              Next Page
            </Button>
          </div>
        </div>
      )}

      {/* ─── FEATURE SCHEDULE DIALOG ─── */}
      <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Schedule Featured Expiry
            </DialogTitle>
            <DialogDescription>
              Set an optional expiration date for featuring this review. Leave empty to feature permanently.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="featured-until-input">Feature Until Date</Label>
              <Input
                id="featured-until-input"
                type="date"
                value={featuredUntilDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setFeaturedUntilDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsFeatureDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFeatureSchedule} className="bg-amber-500 hover:bg-amber-600 text-white font-bold">
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── REVIEW DETAILS DIALOG ─── */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Full Review Details</DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4 py-3">
              
              {/* Type Badge & Rating */}
              <div className="flex justify-between items-center bg-muted/40 p-4 rounded-2xl">
                <div>
                  <Badge variant={selectedReview.type === "website" ? "default" : "secondary"} className="uppercase font-extrabold tracking-wider text-[9px] mb-1">
                    {selectedReview.type === "website" ? "Website" : "Guide"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{new Date(selectedReview.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {renderStars(selectedReview.rating)}
                  <span className="text-xs font-bold text-foreground">Rating: {selectedReview.rating}/5</span>
                </div>
              </div>

              {/* Author & City details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Traveler Name</p>
                  <p className="text-sm font-semibold text-foreground">{selectedReview.unifiedTravelerName || "Unknown"}</p>
                </div>
                {selectedReview.city && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Traveler City</p>
                    <p className="text-sm font-semibold text-foreground">{selectedReview.city}</p>
                  </div>
                )}
                {selectedReview.bookingType && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Booking Service</p>
                    <p className="text-sm font-semibold text-foreground">{selectedReview.bookingType}</p>
                  </div>
                )}
                {selectedReview.unifiedGuideName && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Guide Name</p>
                    <p className="text-sm font-semibold text-primary">{selectedReview.unifiedGuideName}</p>
                  </div>
                )}
              </div>

              {/* Content comments */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Review Comments</p>
                {selectedReview.title && (
                  <p className="text-sm font-extrabold text-foreground mb-1">{selectedReview.title}</p>
                )}
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                  {selectedReview.comments}
                </p>
              </div>

              {/* Expiry features status */}
              <div className="flex flex-wrap gap-3">
                <Badge variant={selectedReview.isActiveFeatured ? "default" : "outline"} className="text-[10px]">
                  Featured: {selectedReview.isActiveFeatured ? "Active" : "Disabled"}
                </Badge>
                {selectedReview.featuredUntil && (
                  <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600 bg-amber-50">
                    Expires: {new Date(selectedReview.featuredUntil).toLocaleDateString()}
                  </Badge>
                )}
                <Badge variant={selectedReview.isReported ? "destructive" : "outline"} className="text-[10px]">
                  Reported Abuse: {selectedReview.isReported ? "Yes" : "No"}
                </Badge>
              </div>

              {/* Reported reason details */}
              {selectedReview.isReported && (
                <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/15 text-xs text-red-650">
                  <span className="font-bold">Report Reason:</span> {selectedReview.reportReason || "Inappropriate language / spam flag."}
                </div>
              )}

              {/* Full Attached Images */}
              {selectedReview.images && selectedReview.images.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Attached Images ({selectedReview.images.length})</p>
                  <div className="flex gap-3 overflow-x-auto py-1">
                    {selectedReview.images.map((img: string, i: number) => {
                      const absoluteUrl = img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_BASE_URL?.replace("/api/", "")}${img}`;
                      return (
                        <a
                          key={i}
                          href={absoluteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative w-24 h-24 rounded-xl overflow-hidden border border-border hover:opacity-85 transition shrink-0"
                        >
                          <img src={absoluteUrl} alt="Attachment" className="w-full h-full object-cover" />
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── IMAGE LIGHTBOX DIALOG ─── */}
      <Dialog open={!!lightboxImageUrl} onOpenChange={() => setLightboxImageUrl(null)}>
        <DialogContent className="max-w-4xl p-1 bg-black/90 border-none flex items-center justify-center">
          {lightboxImageUrl && (
            <div className="relative max-h-[80vh] max-w-full flex items-center justify-center overflow-hidden">
              <img 
                src={lightboxImageUrl} 
                alt="Enlarged Attachment" 
                className="max-h-[75vh] max-w-full object-contain rounded-lg"
              />
              <a 
                href={lightboxImageUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm text-xs font-semibold uppercase transition"
              >
                Open Original
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}

function MessageSquareIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
