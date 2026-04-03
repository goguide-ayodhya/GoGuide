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

    return {
      users: totalUsers,
      guides: totalGuides,
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        pending: pendingBookings,
        unseen: unseenBookings,
      },
      revenue: totalRevenue,
    };
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
