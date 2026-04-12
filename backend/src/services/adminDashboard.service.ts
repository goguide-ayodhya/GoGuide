import { User } from "../models/User";
import { Guide } from "../models/Guide";
import { Booking } from "../models/Booking";
import { Payment } from "../models/Payment";

export class DashboardService {
  // ---------------- ADMIN DASHBOARD ----------------
  async getAdminDashboard() {
    const totalUsers = await User.countDocuments({ isDeleted: false });

    const totalGuides = await Guide.countDocuments({
      verificationStatus: "VERIFIED",
    });

    const totalBookings = await Booking.countDocuments();

    const unseenBookings = await Booking.countDocuments({
      isSeenByAdmin: false,
    });
    const completedBookings = await Booking.countDocuments({
      status: "COMPLETED",
    });

    const pendingBookings = await Booking.countDocuments({
      status: "PENDING",
    });

    const revenueAgg = await Payment.aggregate([
      { $match: { status: "COMPLETED" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    const activeGuides = await Guide.countDocuments({
      verificationStatus: "VERIFIED",
      isAvailable: true,
    });

    const weeklyBookings = await this.getWeeklyBookings();
    const monthlyRevenue = await this.getMonthlyRevenue();
    const recentBookings = await this.getRecentBookings();

    return {
      users: totalUsers,
      guides: totalGuides,
      activeGuides,
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
    };
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
          totalRevenue: { $sum: "$amount" },
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
        booking.guideId?.userId?.name ||
        booking.driverId?.userId?.name ||
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

    const earnings = valid.reduce((sum, p) => sum + p.amount, 0);

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
}

export const dashboardService = new DashboardService();
