"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MessageSquare,
  Heart,
  X,
  Sparkles,
  User,
  ThumbsUp,
  Flag,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Shield,
  Loader2,
  Calendar,
  MapPin,
  Tag,
  ArrowRight
} from "lucide-react";
import {
  createWebsiteReviewApi,
  getWebsiteReviewsApi,
  getWebsiteStatsApi,
  getReviewsAdminApi,
  toggleHelpfulApi,
  reportReviewApi,
  uploadReviewImagesApi
} from "@/lib/api/reviews";
import { useAuth } from "@/contexts/AuthContext";

export default function HappyTravelers() {
  const { user, isLoggedIn } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ averageRating: 4.8, totalReviews: 5 });
  const [loading, setLoading] = useState(true);
  
  // Immersive Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalReviews, setModalReviews] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters for Modal
  const [filterType, setFilterType] = useState<"all" | "website" | "guide">("all");
  const [filterSort, setFilterSort] = useState<"latest" | "highest" | "featured">("latest");
  const [searchText, setSearchText] = useState("");
  
  // Write Review Modal States
  const [writeOpen, setWriteOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    comments: "",
    travelerName: "",
    city: "",
    bookingType: "Guide Booking",
    images: [] as string[]
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Report States
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportingReviewType, setReportingReviewType] = useState<"website" | "guide">("website");
  const [reportReason, setReportReason] = useState("");
  const [reportingSuccess, setReportingSuccess] = useState(false);

  // Pre-populate travelerName if user is logged in
  useEffect(() => {
    if (writeOpen && isLoggedIn && user) {
      setNewReview(prev => ({
        ...prev,
        travelerName: prev.travelerName || user.name || ""
      }));
    }
  }, [writeOpen, isLoggedIn, user]);

  // Load homepage reviews and stats
  const loadHomepageData = async () => {
    try {
      setLoading(true);
      const [reviewsRes, statsRes] = await Promise.all([
        getWebsiteReviewsApi(10).catch(() => null),
        getWebsiteStatsApi().catch(() => null)
      ]);
      
      if (reviewsRes && Array.isArray(reviewsRes) && reviewsRes.length > 0) {
        setReviews(reviewsRes);
      } else {
        setReviews([]);
      }

      if (statsRes) {
        setStats(statsRes);
      } else {
        setStats({ averageRating: 0, totalReviews: 0 });
      }
    } catch (e) {
      console.error(e);
      setReviews([]);
      setStats({ averageRating: 0, totalReviews: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomepageData();
  }, []);

  // Fetch paginated, filtered reviews inside immersive modal
  const fetchModalReviews = async (reset = false) => {
    setModalLoading(true);
    const nextPage = reset ? 1 : page;
    try {
      const params: any = {
        page: nextPage,
        limit: 6,
        type: filterType === "all" ? "" : filterType,
        sort: filterSort === "featured" ? "recent" : filterSort === "highest" ? "recent" : "recent", // default fallback, logic handled dynamically
      };
      
      // Map frontend filter logic to backend query params
      if (filterSort === "featured") params.isFeatured = true;
      if (filterSort === "highest") params.rating = 5;
      if (searchText) params.search = searchText;

      const res = await getReviewsAdminApi(params);
      if (res && res.reviews) {
        const formatted = res.reviews.map((r: any) => ({
          _id: r._id || r.id,
          rating: r.rating || 0,
          title: r.title || (r.type === 'guide' ? 'Guide Experience' : ''),
          comments: r.comments || r.comment || '',
          travelerName: r.unifiedTravelerName || r.travelerName || 'Traveler',
          profileImage: r.unifiedTravelerAvatar || r.profileImage || '',
          city: r.city || '',
          bookingType: r.bookingType || (r.type === 'guide' ? 'Guide Booking' : 'Feedback'),
          helpfulCount: r.helpfulCount || 0,
          helpfulUsers: r.helpfulUsers || [],
          images: r.images || [],
          createdAt: r.createdAt || new Date(),
          type: r.type || 'website',
          guideName: r.unifiedGuideName || ''
        }));

        if (reset) {
          setModalReviews(formatted);
        } else {
          setModalReviews(prev => [...prev, ...formatted]);
        }
        setTotalCount(res.totalCount);
        setHasMore(nextPage < res.totalPages);
        setPage(nextPage + 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setModalLoading(false);
    }
  };

  // Trigger modal fetch on filter change
  useEffect(() => {
    if (modalOpen) {
      fetchModalReviews(true);
    }
  }, [filterType, filterSort, searchText, modalOpen]);

  // Image Upload helper
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3); // limit to 3
      setSelectedFiles(files);
    }
  };

  // Submit Review Handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.travelerName || !newReview.comments) {
      setSubmitError("Name and comments are required.");
      return;
    }

    setSubmittingReview(true);
    setSubmitError(null);

    try {
      let uploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        setUploadingImages(true);
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append("images", file);
        });
        const uploadRes = await uploadReviewImagesApi(formData);
        if (uploadRes && uploadRes.success) {
          uploadedUrls = uploadRes.urls;
        }
        setUploadingImages(false);
      }

      const payload = {
        ...newReview,
        profileImage: isLoggedIn && user ? (user.avatar || user.profileImage || "") : "",
        images: uploadedUrls
      };

      const res = await createWebsiteReviewApi(payload);
      if (res) {
        setSubmitSuccess(true);
        setNewReview({
          rating: 5,
          title: "",
          comments: "",
          travelerName: "",
          city: "",
          bookingType: "Guide Booking",
          images: []
        });
        setSelectedFiles([]);
        // Refresh stats and home listing
        loadHomepageData();
        // Refresh modal list if open
        if (modalOpen) {
          fetchModalReviews(true);
        }
      }
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Toggle Helpful count
  const handleHelpfulClick = async (reviewId: string, type: "website" | "guide") => {
    try {
      const res = await toggleHelpfulApi(reviewId, type);
      if (res) {
        // Update review object inside modal state
        setModalReviews(prev =>
          prev.map(r => {
            if (r._id === reviewId) {
              return {
                ...r,
                helpfulCount: res.helpfulCount,
                userVoted: res.userVoted
              };
            }
            return r;
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Report
  const handleSubmitReport = async () => {
    if (!reportReason) return;
    try {
      const res = await reportReviewApi(reportingReviewId!, reportingReviewType, reportReason);
      if (res) {
        setReportingSuccess(true);
        setTimeout(() => {
          setReportingReviewId(null);
          setReportingSuccess(false);
          setReportReason("");
          // Refresh list to exclude reported item
          fetchModalReviews(true);
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderStars = (rating: number, size = 4) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-${size} h-${size} ${
              i < rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
            }`}
          />
        ))}
      </div>
    );
  };

  // Create two tracks of reviews to enable continuous infinite marquee loop
  const duplicatedReviews1 = [...reviews, ...reviews, ...reviews];
  const duplicatedReviews2 = [...reviews, ...reviews, ...reviews].reverse();

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Immersive Header Stats */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 relative z-10">
          <div className="text-center md:text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Testimonials
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Happy Travelers
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-xl">
              Discover authentic experiences and reviews shared by our tourist community in Ayodhya.
            </p>
          </div>

          {/* Stats Glass Counter */}
          <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-xl shrink-0">
            <div className="text-center border-r border-slate-200/50 dark:border-slate-800/50 pr-6">
              <div className="flex items-center justify-center gap-1.5 text-amber-500 mb-1">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                <span className="text-2xl font-black text-slate-800 dark:text-white">
                  {stats.averageRating}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Average Rating</p>
            </div>
            
            <div className="text-center border-r border-slate-200/50 dark:border-slate-800/50 pr-6">
              <div className="flex items-center justify-center gap-1.5 text-indigo-500 mb-1">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                <span className="text-2xl font-black text-slate-800 dark:text-white">
                  {stats.totalReviews}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Total Reviews</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-rose-500 mb-1 animate-pulse">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                <span className="text-2xl font-black text-slate-800 dark:text-white">
                  100%
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Happy Travelers</p>
            </div>
          </div>
        </div>

        {/* Marquees & Swipe section */}
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-white/5 backdrop-blur-md max-w-lg mx-auto py-16 relative z-10">
            <Sparkles className="w-12 h-12 text-indigo-500 mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No reviews yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
              Be the first happy traveler to share your experience with us! Click below to write a review.
            </p>
          </div>
        ) : (
          <>
            {/* ─── DESKTOP VIEW: Infinite Auto-scrolling Dual Marquee Tracks ─── */}
            <div className="hidden md:block relative marquee-container select-none overflow-hidden space-y-6 py-4">
              
              {/* Edge Blur Gradients */}
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />

              {/* Row 1: Left to Right */}
              <div className="flex overflow-hidden">
                <div className="animate-marquee gap-6 flex">
                  {duplicatedReviews1.map((item, idx) => (
                    <div
                      key={`r1-${item._id}-${idx}`}
                      className={`flex flex-col justify-between p-6 rounded-3xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-[1.03] hover:shadow-2xl shrink-0 ${
                        idx % 3 === 0 ? "w-[340px]" : idx % 3 === 1 ? "w-[390px]" : "w-[440px]"
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          {renderStars(item.rating, 4)}
                          {item.bookingType && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                              {item.bookingType}
                            </span>
                          )}
                        </div>
                        {item.title && (
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">
                            {item.title}
                          </h4>
                        )}
                        <p className="text-xs text-slate-550 dark:text-slate-300 leading-relaxed line-clamp-3">
                          “{item.comments}”
                        </p>
                        {/* Review Image Attachments */}
                        {item.images && item.images.length > 0 && (
                          <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                            {item.images.map((img: string, i: number) => (
                              <div
                                key={i}
                                className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200/20 dark:border-slate-800/50"
                              >
                                <img
                                  src={img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_BASE_URL?.replace("/api/", "")}${img}`}
                                  alt="Attachment"
                                  className="w-10 h-10 object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                        <div className="relative w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
                          {item.profileImage ? (
                            <img src={item.profileImage} alt={item.travelerName} className="w-8 h-8 object-cover rounded-full" />
                          ) : (
                            <User className="w-4 h-4 text-indigo-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-white">
                              {item.travelerName}
                            </span>
                            <Shield className="w-3 h-3 text-emerald-500 fill-emerald-500/20" />
                          </div>
                          {item.city && (
                            <p className="text-[10px] text-slate-400">{item.city}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 2: Right to Left */}
              <div className="flex overflow-hidden">
                <div className="animate-marquee-reverse gap-6 flex">
                  {duplicatedReviews2.map((item, idx) => (
                    <div
                      key={`r2-${item._id}-${idx}`}
                      className={`flex flex-col justify-between p-6 rounded-3xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-[1.03] hover:shadow-2xl shrink-0 ${
                        idx % 3 === 0 ? "w-[440px]" : idx % 3 === 1 ? "w-[340px]" : "w-[390px]"
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          {renderStars(item.rating, 4)}
                          {item.bookingType && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                              {item.bookingType}
                            </span>
                          )}
                        </div>
                        {item.title && (
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">
                            {item.title}
                          </h4>
                        )}
                        <p className="text-xs text-slate-550 dark:text-slate-300 leading-relaxed line-clamp-3">
                          “{item.comments}”
                        </p>
                        {/* Review Image Attachments */}
                        {item.images && item.images.length > 0 && (
                          <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                            {item.images.map((img: string, i: number) => (
                              <div
                                key={i}
                                className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200/20 dark:border-slate-800/50"
                              >
                                <img
                                  src={img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_BASE_URL?.replace("/api/", "")}${img}`}
                                  alt="Attachment"
                                  className="w-10 h-10 object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                        <div className="relative w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
                          {item.profileImage ? (
                            <img src={item.profileImage} alt={item.travelerName} className="w-8 h-8 object-cover rounded-full" />
                          ) : (
                            <User className="w-4 h-4 text-indigo-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-white">
                              {item.travelerName}
                            </span>
                            <Shield className="w-3 h-3 text-emerald-500 fill-emerald-500/20" />
                          </div>
                          {item.city && (
                            <p className="text-[10px] text-slate-400">{item.city}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ─── MOBILE VIEW: Horizontal Swipe Track with snap scrolling ─── */}
            <div className="md:hidden flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-4 -mx-4 px-4">
              {reviews.slice(0, 5).map((item) => (
                <div
                  key={`mob-${item._id}`}
                  className="snap-center shrink-0 w-[85vw] max-w-[340px] flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-xl"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      {renderStars(item.rating, 4.5)}
                      {item.bookingType && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {item.bookingType}
                        </span>
                      )}
                    </div>
                    {item.title && (
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">
                        {item.title}
                      </h4>
                    )}
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">
                      “{item.comments}”
                    </p>
                    {/* Review Image Attachments */}
                    {item.images && item.images.length > 0 && (
                      <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                        {item.images.map((img: string, i: number) => (
                          <div
                            key={i}
                            className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200/50 dark:border-slate-800/50"
                          >
                            <img
                              src={img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_BASE_URL?.replace("/api/", "")}${img}`}
                              alt="Attachment"
                              className="w-12 h-12 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="relative w-10 h-10 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center">
                      {item.profileImage ? (
                        <img src={item.profileImage} alt={item.travelerName} className="w-10 h-10 object-cover rounded-full" />
                      ) : (
                        <User className="w-5 h-5 text-indigo-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-800 dark:text-white">
                          {item.travelerName}
                        </span>
                        <Shield className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
                      </div>
                      {item.city && (
                        <p className="text-xs text-slate-400">{item.city}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* View All / Write Review CTA Buttons directly on home page */}
        <div className="flex flex-wrap justify-center gap-4 mt-12 relative z-10">
          <button
            onClick={() => setModalOpen(true)}
            className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 hover:scale-[1.02] transform transition duration-300 shadow-xl shadow-indigo-500/20 cursor-pointer"
          >
            View All Reviews
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => {
              setSubmitSuccess(false);
              setWriteOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-semibold text-slate-800 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 hover:scale-[1.02] transform transition duration-300 shadow-xl cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Write a Review
          </button>
        </div>

      </div>

      {/* ─── IMMERSIVE FULLSCREEN MODAL (BACKDROP BLUR) ─── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-slate-950/80 backdrop-blur-2xl text-slate-900 dark:text-slate-100 overflow-hidden"
          >
            <motion.div
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.95 }}
              className="w-full h-full md:max-w-5xl md:h-[90vh] bg-white dark:bg-slate-900 md:rounded-[2rem] flex flex-col shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-6 right-6 w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 z-50 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Body Header */}
              <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mr-12">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      Traveler Reviews
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                        {totalCount} total
                      </span>
                    </h3>
                    <p className="text-sm text-slate-400">Read what visitors are saying about their trips.</p>
                  </div>
                  
                  {/* Write a Review Button */}
                  <button
                    onClick={() => {
                      setSubmitSuccess(false);
                      setWriteOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    Write a Review
                  </button>
                </div>

                {/* Filters Toolbar */}
                <div className="flex flex-wrap items-center gap-4 mt-6">
                  {/* Filter Types */}
                  <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 shrink-0">
                    {[
                      { id: "all", label: "All Reviews" },
                      { id: "website", label: "Website" },
                      { id: "guide", label: "Guides" }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => {
                          setFilterType(btn.id as any);
                          setPage(1);
                        }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          filterType === btn.id
                            ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Filter Sort */}
                  <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 shrink-0">
                    {[
                      { id: "latest", label: "Latest" },
                      { id: "featured", label: "Featured Only" },
                      { id: "highest", label: "5-Stars" }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => {
                          setFilterSort(btn.id as any);
                          setPage(1);
                        }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          filterSort === btn.id
                            ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Search text input */}
                  <div className="relative flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Search comments or traveler name..."
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 transition"
                    />
                    {searchText && (
                      <button
                        onClick={() => {
                          setSearchText("");
                          setPage(1);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Reviews Scrollable Container */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin dark:bg-slate-900/50">
                {modalReviews.length === 0 && !modalLoading ? (
                  <div className="text-center py-20 text-slate-400">
                    <MessageSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                    <p className="font-semibold text-lg">No reviews found</p>
                    <p className="text-sm">Try adjustment of filters or search queries.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {modalReviews.map((review) => (
                      <motion.div
                        key={review._id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20 overflow-hidden shrink-0">
                                {review.profileImage ? (
                                  <img
                                    src={review.profileImage.startsWith("http") ? review.profileImage : `${process.env.NEXT_PUBLIC_BASE_URL?.replace("/api/", "")}${review.profileImage}`}
                                    alt={review.travelerName}
                                    className="w-10 h-10 object-cover rounded-full"
                                  />
                                ) : (
                                  <span className="font-bold text-slate-600 dark:text-slate-350 text-sm">
                                    {review.travelerName.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                                    {review.travelerName}
                                  </h4>
                                  <Shield className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                  {review.city && (
                                    <span className="flex items-center gap-0.5">
                                      <MapPin className="w-2.5 h-2.5" />
                                      {review.city}
                                    </span>
                                  )}
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              {renderStars(review.rating, 3.5)}
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 uppercase">
                                <Tag className="w-2.5 h-2.5" />
                                {review.bookingType}
                              </span>
                            </div>
                          </div>

                          {review.title && (
                            <h5 className="text-sm font-extrabold text-slate-850 dark:text-white">
                              {review.title}
                            </h5>
                          )}
                          <p className="text-xs text-slate-550 dark:text-slate-300 leading-relaxed">
                            {review.comments}
                          </p>

                          {/* Guide Name badge if guide review */}
                          {review.type === 'guide' && review.guideName && (
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/5 px-2 py-0.5 rounded-md inline-block">
                              Guide: {review.guideName}
                            </p>
                          )}

                          {/* Review Image Attachments */}
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                              {review.images.map((img: string, i: number) => (
                                <a
                                  key={i}
                                  href={img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_BASE_URL?.replace("/api/", "")}${img}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-200 hover:opacity-80 transition"
                                >
                                  <img src={img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_BASE_URL?.replace("/api/", "")}${img}`} alt="Attachment" className="w-14 h-14 object-cover" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Footer Operations (Helpful & Report) */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-805">
                          <button
                            onClick={() => handleHelpfulClick(review._id, review.type)}
                            className={`flex items-center gap-1.5 text-[11px] font-bold transition-all px-3 py-1.5 rounded-lg border ${
                              review.userVoted
                                ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${review.userVoted ? "fill-indigo-600" : ""}`} />
                            Helpful ({review.helpfulCount})
                          </button>

                          <button
                            onClick={() => {
                              setReportingReviewId(review._id);
                              setReportingReviewType(review.type);
                            }}
                            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            Report
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Loading spinner */}
                {modalLoading && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
                  </div>
                )}

                {/* Load More Button */}
                {hasMore && !modalLoading && (
                  <div className="flex justify-center pt-6">
                    <button
                      onClick={() => fetchModalReviews()}
                      className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs transition"
                    >
                      Load More Reviews
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── WRITE WEBSITE REVIEW SLIDE-OVER FORM ─── */}
      <AnimatePresence>
        {writeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 text-slate-900 dark:text-slate-100"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              {/* Close */}
              <button
                onClick={() => setWriteOpen(false)}
                className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Write website feedback
                </h4>
                <p className="text-xs text-slate-400">Submit review anonymously, no signup required.</p>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto">
                {submitSuccess ? (
                  <div className="text-center py-8 space-y-4">
                    <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
                    <h5 className="text-lg font-bold">Feedback Submitted!</h5>
                    <p className="text-sm text-slate-400">Thank you for sharing your experience. Your review helps us improve GoGuide.</p>
                    <button
                      onClick={() => setWriteOpen(false)}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow transition"
                    >
                      Close Form
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    {submitError && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-200 rounded-xl text-xs font-semibold">
                        {submitError}
                      </div>
                    )}

                    {/* Interactive Star Rating */}
                    <div className="text-center py-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                      <p className="text-xs font-bold text-slate-500 mb-2">Overall Rating</p>
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className="transition transform active:scale-95"
                          >
                            <Star
                              className={`w-9 h-9 transition-colors ${
                                star <= newReview.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Traveler Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Your Name *</label>
                      <input
                        type="text"
                        value={newReview.travelerName}
                        onChange={(e) => setNewReview({ ...newReview, travelerName: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* City */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Your City</label>
                        <input
                          type="text"
                          value={newReview.city}
                          onChange={(e) => setNewReview({ ...newReview, city: e.target.value })}
                          placeholder="e.g. Mumbai"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                      </div>

                      {/* Booking Type */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Service Used</label>
                        <select
                          value={newReview.bookingType}
                          onChange={(e) => setNewReview({ ...newReview, bookingType: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                          <option value="Guide Booking">Guide Booking</option>
                          <option value="Cab Ride">Cab Ride</option>
                          <option value="Tour Package">Tour Package</option>
                          <option value="General Feedback">General Feedback</option>
                        </select>
                      </div>
                    </div>

                    {/* Review Title */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Review Title</label>
                      <input
                        type="text"
                        value={newReview.title}
                        onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                        placeholder="Summarize your experience..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>

                    {/* Comments */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Detailed Feedback *</label>
                      <textarea
                        value={newReview.comments}
                        onChange={(e) => setNewReview({ ...newReview, comments: e.target.value })}
                        placeholder="What did you like or dislike? Write honestly..."
                        rows={3}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                      />
                    </div>

                    {/* File Drop Area */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Upload photos (Max 3)</label>
                      <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Click or drag images to upload</p>
                      </div>
                      {selectedFiles.length > 0 && (
                        <div className="flex gap-2 mt-3 items-center text-xs text-indigo-500 font-semibold">
                          <ImageIcon className="w-4 h-4 shrink-0" />
                          <span>{selectedFiles.length} file(s) selected</span>
                        </div>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-bold text-sm rounded-xl shadow transition duration-200 flex items-center justify-center gap-2"
                    >
                      {submittingReview ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting Review...
                        </>
                      ) : (
                        "Submit Feedback"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── ABUSE REPORT MODAL DIALOG ─── */}
      <AnimatePresence>
        {reportingReviewId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm text-slate-900 dark:text-slate-100"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 relative border dark:border-slate-800"
            >
              {reportingSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h5 className="text-lg font-bold">Report Submitted</h5>
                  <p className="text-xs text-slate-400">Admin will review this content shortly.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Flag className="w-5 h-5 text-red-500" />
                      Report Review
                    </h5>
                    <p className="text-xs text-slate-400 mt-1">Please provide a reason why you consider this review inappropriate.</p>
                  </div>

                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="e.g. Profanity, spam, offensive language, duplicate post..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none text-slate-800 dark:text-white"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => setReportingReviewId(null)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs transition text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitReport}
                      disabled={!reportReason}
                      className="flex-1 py-2.5 bg-red-650 hover:bg-red-600 text-white rounded-xl font-bold text-xs transition shadow-lg shadow-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Submit Report
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
