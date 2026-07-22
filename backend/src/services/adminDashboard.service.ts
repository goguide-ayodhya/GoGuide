import { User } from "../models/User";
import { Guide } from "../models/Guide";
import { Booking } from "../models/Booking";
import { Payment } from "../models/Payment";
import { Notification } from "../models/Notification";
import { Review } from "../models/Review";
import { Driver } from "../models/Driver";
import { Ride } from "../models/Ride";
import { CabBooking } from "../models/CabBooking";
import { DriverCommissionPayment } from "../models/DriverCommissionPayment";
import { reviewService } from "./review.service";

export class DashboardService {
  // ---------------- PUBLIC STATS ----------------
  async getPublicStats() {
    const totalUsers = await User.countDocuments({
      isDeleted: false
    });

    const totalGuides = await Guide.countDocuments({
      verificationStatus: "VERIFIED",
      isDeleted: { $ne: true },
      isAvailable: true,
    });

    const totalBookings = await Booking.countDocuments();

    const totalReviews = await Review.countDocuments();

    // Get unique cities from guides
    const uniqueCities = await Guide.distinct("city", {
      verificationStatus: "VERIFIED",
      isDeleted: { $ne: true },
      isActive: true,
      city: { $exists: true, $ne: null }
    });

    return {
      bookings: totalBookings,
      guides: totalGuides,
      cities: uniqueCities.length,
      reviews: totalReviews,
    };
  }

  // ---------------- ADMIN DASHBOARD ----------------
  async getAdminDashboard(startDate?: Date, endDate?: Date) {
    const dateFilter = startDate && endDate ? {
      createdAt: { $gte: startDate, $lte: endDate }
    } : {};

    const totalUsers = await User.countDocuments({
      isDeleted: false,
      ...dateFilter
    });

    const totalGuides = await Guide.countDocuments({
      verificationStatus: "VERIFIED",
      isDeleted: { $ne: true },
      isAvailable: true,
    });

    const totalDrivers = await Driver.countDocuments({
      isDeleted: { $ne: true }
    });

    const totalBookings = await Booking.countDocuments(dateFilter);

    const unseenBookings = await Booking.countDocuments({
      isSeenByAdmin: false,
      ...dateFilter
    });
    const completedBookings = await Booking.countDocuments({
      status: "COMPLETED",
      ...dateFilter
    });

    const pendingBookings = await Booking.countDocuments({
      status: "PENDING",
      ...dateFilter
    });

    const revenueAgg = await Payment.aggregate([
      { $match: { status: "COMPLETED", ...dateFilter } },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    const activeGuides = await Guide.countDocuments({
      verificationStatus: "VERIFIED",
      isAvailable: true,
      isDeleted: { $ne: true },
      ...dateFilter
    });

    const weeklyBookings = await this.getWeeklyBookings();
    const monthlyRevenue = await this.getMonthlyRevenue();
    const recentBookings = await this.getRecentBookings();
    const upcomingBookingsPreview = await this.getUpcomingBookingsPreview(3);
    const recentReviewsPreview = await this.getRecentReviewsPreview(3);
    const topSoldPackagesPreview = await this.getTopSoldPackagesPreview(3);
    const topBookedGuidesPreview = await this.getTopBookedGuidesPreview(3);

    return {
      users: totalUsers,
      guides: totalGuides,
      activeGuides,
      totalDrivers,
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        pending: pendingBookings,
        unseen: unseenBookings,
      },
      revenue: totalRevenue,
      weeklyBookings,
      monthlyRevenue,
      recentBookings,
      upcomingBookingsPreview,
      recentReviewsPreview,
      topSoldPackagesPreview,
      topBookedGuidesPreview,
    };
  }

  async getRecentUsers(limit = 10) {
    const users = await User.find({ isDeleted: false })
      .select('name email phone createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);

    return users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      joinedAt: user.createdAt,
    }));
  }

  async getRecentGuides(limit = 10) {
    const guides = await Guide.find({
      verificationStatus: "VERIFIED",
      isDeleted: { $ne: true },
      isActive: true,
    })
      .populate('userId', 'name email phone')
      .select('specialities yearsOfExperience createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);

    return guides.map(guide => ({
      id: guide._id.toString(),
      name: (guide.userId as any)?.name || 'N/A',
      email: (guide.userId as any)?.email || 'N/A',
      phone: (guide.userId as any)?.phone || 'N/A',
      specialization: guide.specialities.join(', '),
      experience: guide.yearsOfExperience,
      joinedAt: guide.createdAt,
    }));
  }

  async getRecentAlerts(limit = 10) {
    const alerts = await Notification.find({})
      .populate('userId', 'name email')
      .select('title description type read createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);

    return alerts.map(alert => ({
      id: alert._id.toString(),
      title: alert.title,
      description: alert.description,
      type: alert.type,
      read: alert.read,
      userName: (alert.userId as any)?.name || 'System',
      userEmail: (alert.userId as any)?.email || '',
      createdAt: alert.createdAt,
    }));
  }

  async getPendingGuides(limit = 10) {
    const guides = await Guide.find({
      verificationStatus: "PENDING",
      isDeleted: { $ne: true },
      isActive: true,
    })
      .populate('userId', 'name email phone')
      .select('specialities yearsOfExperience bio createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);

    return guides.map(guide => ({
      id: guide._id.toString(),
      name: (guide.userId as any)?.name || 'N/A',
      email: (guide.userId as any)?.email || 'N/A',
      phone: (guide.userId as any)?.phone || 'N/A',
      specialization: guide.specialities.join(', '),
      bio: guide.bio || '',
      appliedAt: guide.createdAt,
    }));
  }

  async getUpcomingBookingsPreview(limit = 3) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const guideBookings = await Booking.find({
      bookingDate: { $gte: today },
      status: { $in: ["CONFIRMED", "ACCEPTED", "PENDING"] },
    })
      .sort({ bookingDate: 1 })
      .limit(limit)
      .lean();

    const cabBookings = await CabBooking.find({
      startDate: { $gte: today },
      status: { $in: ["CONFIRMED", "ACCEPTED", "PENDING"] },
    })
      .sort({ startDate: 1 })
      .limit(limit)
      .lean();

    const combined = [
      ...guideBookings.map((b: any) => ({
        id: b._id.toString(),
        touristName: b.touristName || "Tourist",
        type: b.bookingType === "PACKAGE" ? "Package" : "Guide",
        date: b.bookingDate,
        time: b.timeSlot || "N/A",
        status: b.status,
      })),
      ...cabBookings.map((c: any) => ({
        id: c._id.toString(),
        touristName: c.fullName || "Tourist",
        type: "Cab",
        date: c.startDate,
        time: c.pickupTime || "N/A",
        status: c.status,
      })),
    ];

    combined.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return combined.slice(0, limit);
  }

  async getRecentReviewsPreview(limit = 3) {
    const reviews = await Review.find({})
      .populate("userId", "name email avatar")
      .populate("guideId", "name")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const populatedReviews = await reviewService.populateBookingNamesForReviews(reviews);

    return populatedReviews.map((r: any) => ({
      id: r._id.toString(),
      userName: r.userId?.name || r.reviewerName || "Anonymous",
      rating: r.rating || 5,
      comments: r.comments || "No comment provided",
      createdAt: r.createdAt,
    }));
  }

  async getTopSoldPackagesPreview(limit = 3) {
    const { TourPackage } = await import("../models/Tour");

    const bookingCountsAgg = await Booking.aggregate([
      { $match: { packageId: { $exists: true, $ne: null }, status: { $ne: "CANCELLED" } } },
      { $group: { _id: "$packageId", bookingCount: { $sum: 1 } } },
      { $sort: { bookingCount: -1 } },
      { $limit: limit },
    ]);

    const bookingCountMap = new Map<string, number>();
    bookingCountsAgg.forEach((b: any) => {
      if (b._id) bookingCountMap.set(b._id.toString(), b.bookingCount);
    });

    let packages = await TourPackage.find({ isActive: true })
      .sort({ soldCount: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    if (!packages.length) {
      packages = await TourPackage.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    }

    return packages.map((pkg: any) => {
      const idStr = pkg._id.toString();
      const countFromBookings = bookingCountMap.get(idStr) || 0;
      const salesCount = Math.max(pkg.soldCount || 0, countFromBookings);

      return {
        id: idStr,
        title: pkg.title,
        price: pkg.price,
        type: pkg.type || "standard",
        salesCount,
        image: pkg.mainImage || (pkg.images && pkg.images[0]) || "",
        duration: `${pkg.duration || 1} ${pkg.durationType || "days"}`,
      };
    });
  }

  async getTopBookedGuidesPreview(limit = 3) {
    const guideCountsAgg = await Booking.aggregate([
      { $match: { guideId: { $exists: true, $ne: null }, status: { $ne: "CANCELLED" } } },
      { $group: { _id: "$guideId", bookingCount: { $sum: 1 } } },
      { $sort: { bookingCount: -1 } },
      { $limit: limit },
    ]);

    const guideCountMap = new Map<string, number>();
    guideCountsAgg.forEach((g: any) => {
      if (g._id) guideCountMap.set(g._id.toString(), g.bookingCount);
    });

    let topGuideIds = guideCountsAgg.map((g: any) => g._id);

    let guides: any[] = [];
    if (topGuideIds.length) {
      guides = await Guide.find({ _id: { $in: topGuideIds } })
        .populate("userId", "name email phone avatar")
        .lean();
    }

    if (guides.length < limit) {
      const fallbackGuides = await Guide.find({
        verificationStatus: "VERIFIED",
        isDeleted: { $ne: true },
        _id: { $nin: guides.map((g: any) => g._id) },
      })
        .populate("userId", "name email phone avatar")
        .sort({ rating: -1, createdAt: -1 })
        .limit(limit - guides.length)
        .lean();

      guides = [...guides, ...fallbackGuides];
    }

    return guides.slice(0, limit).map((guide: any) => {
      const idStr = guide._id.toString();
      const countFromBookings = guideCountMap.get(idStr) || 0;
      const totalBookings = Math.max(guide.totalTrips || 0, countFromBookings);

      return {
        id: idStr,
        name: (guide.userId as any)?.name || "Guide",
        avatar: (guide.userId as any)?.avatar || "",
        city: guide.city || "Ayodhya",
        rating: guide.rating || 5,
        totalBookings,
        experience: guide.yearsOfExperience || 1,
        specialities: guide.specialities || [],
      };
    });
  }

  private async getWeeklyBookings(days = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (days - 1));

    const bookings = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$bookingDate",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const countsByDate = bookings.reduce<Record<string, number>>((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return Array.from({ length: days }).map((_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      const key = date.toISOString().slice(0, 10);
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        bookings: countsByDate[key] || 0,
      };
    });
  }

  private async getMonthlyRevenue(months = 6) {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const revenue = await Payment.aggregate([
      {
        $match: {
          status: "COMPLETED",
          createdAt: { $gte: startMonth },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalRevenue: {
            $sum: {
              $ifNull: ["$amountPaid", "$amount"],
            },
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const revenueByMonth = revenue.reduce<Record<string, number>>((acc, item) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
      acc[key] = item.totalRevenue;
      return acc;
    }, {});

    return Array.from({ length: months }).map((_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (months - 1) + index, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return {
        month: date.toLocaleDateString("en-US", { month: "short" }),
        revenue: revenueByMonth[key] || 0,
      };
    });
  }

  private async getRecentBookings(limit = 5) {
    const bookings = await Booking.find({})
      .populate({
        path: "guideId",
        populate: { path: "userId" },
      })
      .populate({
        path: "driverId",
        populate: { path: "userId" },
      })
      .populate("userId")
      .sort({ createdAt: -1 })
      .limit(limit);

    return bookings.map((booking) => ({
      id: booking._id.toString(),
      touristName: booking.touristName,
      guideName:
        (booking.guideId as any)?.userId?.name ||
        (booking.driverId as any)?.userId?.name ||
        booking.guideName ||
        "N/A",
      tourType: booking.tourType,
      bookingType:
        booking.bookingType === "GUIDE"
          ? "Guide"
          : booking.bookingType === "DRIVER"
          ? "Driver"
          : booking.bookingType === "TOKEN"
          ? "Token"
          : booking.bookingType,
      status: this.formatStatus(booking.status),
    }));
  }

  private formatStatus(status: string) {
    const map: Record<string, string> = {
      PENDING: "Pending",
      ACCEPTED: "Confirmed",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
      REJECTED: "Cancelled",
    };

    return map[status] || status;
  }

  // ---------------- GUIDE DASHBOARD ----------------
  async getGuideDashboard(guideId: string) {
    const bookings = await Booking.find({ guideId });

    const completed = bookings.filter((b) => b.status === "COMPLETED").length;
    const pending = bookings.filter((b) => b.status === "PENDING").length;

    const payments = await Payment.find({ status: "COMPLETED" }).populate({
      path: "bookingId",
      match: { guideId },
    });

    const valid = payments.filter((p) => p.bookingId !== null);

    const earnings = valid.reduce(
      (sum, p) => sum + (p.amount ?? 0),
      0,  
    );

    return {
      bookings: {
        total: bookings.length,
        completed,
        pending,
      },
      earnings,
    };
  }

  // ---------------- USER DASHBOARD ----------------
  async getUserDashboard(userId: string) {
    const bookings = await Booking.find({ userId });

    return {
      totalBookings: bookings.length,
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
    };
  }

  // ---------------- SIDEBAR BADGE COUNTS ----------------
  async getSidebarCounts() {
    const packagesCount = await Booking.countDocuments({
      bookingType: "PACKAGE",
      $or: [
        { status: "PENDING" },
        { isRescheduled: true }
      ]
    });

    const guidesCount = await Booking.countDocuments({
      bookingType: "GUIDE",
      $or: [
        { status: "PENDING" },
        { isRescheduled: true }
      ]
    });

    const cabsCount = await CabBooking.countDocuments({
      $or: [
        { status: "PENDING" },
        { isRescheduled: true }
      ]
    });

    const unseenPaymentsCount = await Payment.countDocuments({ isSeenByAdmin: { $ne: true } });
    const pendingDriverCommissions = await DriverCommissionPayment.countDocuments({ status: "PENDING" });
    const paymentsCount = unseenPaymentsCount + pendingDriverCommissions;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const upcomingBookingsCount = await Booking.countDocuments({
      bookingDate: { $gte: today },
      status: { $in: ["CONFIRMED", "ACCEPTED"] },
    });

    const upcomingCabsCount = await CabBooking.countDocuments({
      startDate: { $gte: today },
      status: "CONFIRMED",
    });

    const upcomingCount = upcomingBookingsCount + upcomingCabsCount;

    return {
      packagesCount,
      guidesCount,
      cabsCount,
      paymentsCount,
      upcomingCount,
    };
  }
}

export const dashboardService = new DashboardService();
