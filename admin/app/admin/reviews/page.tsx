"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Search, Star, Trash2, Eye } from "lucide-react"
import { getAllReviewsApi, deleteReviewApi } from "@/lib/api/reviews"
import { useToast } from "@/hooks/use-toast"

type Review = {
  id: string
  guideName: string
  guideId?: string
  touristName: string
  rating: number
  comment: string
  date: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const filteredReviews = reviews.filter(review => 
    review.guideName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.touristName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.comment.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (reviewId: string) => {
    try {
      setLoading(true)
      await deleteReviewApi(reviewId)
      setReviews(prev => prev.filter(r => r.id !== reviewId))
      if (selectedReview?.id === reviewId) {
        setViewDialogOpen(false)
        setSelectedReview(null)
      }
      toast({ title: "Review deleted", description: "The review was removed." })
    } catch (error: any) {
      console.error("Delete review error", error)
      toast({ title: "Failed to delete review", description: error?.message || String(error) })
    } finally {
      setLoading(false)
    }
  }

  const handleViewReview = (review: Review) => {
    setSelectedReview(review)
    setViewDialogOpen(true)
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getAllReviewsApi()
        const formatted = (data || []).map((r: any) => ({
          id: r._id || r.id || r.reviewId || String(r._id || r.id),
          guideName: r.guideName || (r.guide && (r.guide.name || r.guide.fullName)) || r.guideId || "Unknown",
          guideId: r.guideId || (r.guide && r.guide._id) || "",
          touristName: r.touristName || r.userName || (r.user && (r.user.name || r.user.fullName)) || r.userId || "Unknown",
          rating: r.rating || r.stars || 0,
          comment: r.comments || r.comment || r.body || "",
          date: r.createdAt ? String(r.createdAt).split("T")[0] : r.date || "",
        }))
        setReviews(formatted)
      } catch (error) {
        console.error("Failed to load reviews", error)
        toast({ title: "Failed to load reviews", description: String(error) })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const renderStars = (rating: number, size: "sm" | "lg" = "sm") => {
    const sizeClass = size === "lg" ? "w-5 h-5" : "w-4 h-4"
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reviews</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage guide reviews from tourists.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Star className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Reviews</p>
                <p className="text-xl font-semibold text-foreground">{reviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Star className="w-5 h-5 fill-warning text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Average Rating</p>
                <p className="text-xl font-semibold text-foreground">{averageRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reviews by guide, tourist or comment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reviews List - Mobile Cards & Desktop Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">All Reviews</CardTitle>
          <CardDescription>{filteredReviews.length} reviews found</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reviews found.
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="block lg:hidden space-y-4">
                {filteredReviews.map((review) => (
                  <div 
                    key={review.id} 
                    className="p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="space-y-3">
                      {/* Guide Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-medium text-primary">
                              {review.guideName.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{review.guideName}</p>
                            <p className="text-xs text-muted-foreground">{review.guideId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                          <Badge variant="secondary" className="text-xs ml-1">
                            {review.rating}
                          </Badge>
                        </div>
                      </div>

                      {/* Tourist Name */}
                      <div className="text-sm">
                        <span className="text-muted-foreground">From: </span>
                        <span className="text-foreground">{review.touristName}</span>
                      </div>

                      {/* Comment Preview */}
                      <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>

                      {/* Date */}
                      <p className="text-xs text-muted-foreground">{review.date}</p>

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-border">
                        <Button 
                          variant="outline"
                          className="h-11 min-w-[44px] flex-1"
                          onClick={() => handleViewReview(review)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline"
                              className="h-11 min-w-[44px] flex-1 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="mx-4 sm:mx-auto max-w-[calc(100vw-2rem)] sm:max-w-lg">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Review</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this review? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                              <AlertDialogCancel className="h-11 min-w-[44px]">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(review.id)}
                                className="h-11 min-w-[44px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden lg:block overflow-x-auto -mx-6 px-6">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">Guide</th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">Tourist</th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">Rating</th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">Comment</th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">Date</th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.map((review) => (
                      <tr key={review.id} className="border-b border-border last:border-0">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {review.guideName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{review.guideName}</p>
                              <p className="text-xs text-muted-foreground">{review.guideId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-foreground">{review.touristName}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating)}
                            <Badge variant="secondary" className="text-xs">
                              {review.rating}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground max-w-[250px] truncate">
                          {review.comment}
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">{review.date}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-11 w-11"
                              onClick={() => handleViewReview(review)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-11 w-11 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Review</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this review? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="h-11 min-w-[44px]">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(review.id)}
                                    className="h-11 min-w-[44px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Review Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="mx-4 sm:mx-auto max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              Full review information.
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              {/* Guide Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-lg font-medium text-primary">
                    {selectedReview.guideName.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{selectedReview.guideName}</p>
                  <p className="text-sm text-muted-foreground">{selectedReview.guideId}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50">
                <span className="text-sm font-medium text-foreground">Rating</span>
                <div className="flex items-center gap-2">
                  {renderStars(selectedReview.rating, "lg")}
                  <Badge variant="secondary" className="text-sm">
                    {selectedReview.rating}/5
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Tourist Name</p>
                  <p className="text-sm text-foreground">{selectedReview.touristName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Date</p>
                  <p className="text-sm text-foreground">{selectedReview.date}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Comment</p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedReview.comment}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="h-11 min-w-[44px] flex-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Review
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="mx-4 sm:mx-auto max-w-[calc(100vw-2rem)] sm:max-w-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Review</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this review? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="h-11 min-w-[44px]">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(selectedReview.id)}
                        className="h-11 min-w-[44px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button 
                  variant="outline"
                  className="h-11 min-w-[44px] flex-1"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
