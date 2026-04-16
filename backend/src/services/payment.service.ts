import { Payment } from "../models/Payment";
import { Booking } from "../models/Booking";
import { NotFound, BadRequest, Unauthorized } from "../utils/httpException";
import { NotificationService } from "./notification.service";

export class PaymentService {
  async createPayment(userId: string, bookingId: string) {
    console.log(`[PAYMENT] Creating payment - userId: ${userId}, bookingId: ${bookingId}`);
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new NotFound("Booking not found");
    }

    if (booking.userId.toString() !== userId) {
      throw new Unauthorized("Not authorized to create payment for this booking");
    }

    if (["REJECTED", "CANCELLED", "COMPLETED"].includes(booking.status)) {
      throw new BadRequest("Cannot create payment for this booking");
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ bookingId });

    if (existingPayment) {
      throw new BadRequest("Payment already exists for this booking");
    }

    const payment = await Payment.create({
      bookingId,
      userId,
      guideId: booking.guideId,
      driverId: booking.driverId,
      amount: booking.totalPrice,
    });

    const populatedPayment = await Payment.findById(payment._id).populate(
      "bookingId",
    );

    return populatedPayment;
  }

  async skipPayment(userId: string, bookingId: string) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new NotFound("Booking not found");
    }

    if (booking.userId.toString() !== userId) {
      throw new Unauthorized("Not authorized to skip payment for this booking");
    }

    if (booking.paymentStatus !== "PENDING") {
      throw new BadRequest("Payment is not in pending state");
    }

    // Keep payment status as PENDING, just mark that user chose to skip
    // Could add a field to track this, but for now, just return success
    return { message: "Payment skipped successfully" };
  }

  async processPayment(paymentId: string, data: any, userId: string) {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      throw new NotFound("Payment not found");
    }
    if (!["COMPLETED", "FAILED"].includes(data.status)) {
      throw new BadRequest("Invalid payment status");
    }
    if (payment.status === "COMPLETED") {
      throw new BadRequest("Payment already completed");
    }
    if (payment.userId.toString() !== userId) {
      throw new Unauthorized("Not your payment");
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: data.status,
        transactionId: data.transactionId,
        paymentMethod: data.paymentMethod,
        failureReason: data.failureReason,
        paidAt: data.status === "COMPLETED" ? new Date() : null,
      },
      { new: true },
    ).populate("bookingId");

    // Update booking payment status
    if (data.status === "COMPLETED") {
      console.log(`[PAYMENT] 💰 Payment Success for paymentId: ${paymentId}, bookingId: ${payment.bookingId}`);
      await Booking.findByIdAndUpdate(payment.bookingId, {
        paymentStatus: "COMPLETED",
      });

      // Send payment success notification (async - don't block response)
      try {
        await NotificationService.sendPaymentSuccess(paymentId);
      } catch (error) {
        console.warn("Notification send failed (non-blocking):", error);
      }
    }

    return updatedPayment;
  }

  async getPaymentsByUser(userId: string) {
    const payments = await Payment.find({ userId })
      .populate("bookingId")
      .sort({ createdAt: -1 });

    return payments;
  }

  async getPaymentByBooking(bookingId: string) {
    const payment = await Payment.findOne({ bookingId }).populate("bookingId");

    return payment;
  }

  async getPaymentsByGuide(guideId: string) {
    const payments = await Payment.find()
      .populate({
        path: "bookingId",
        match: { guideId },
      })
      .sort({ createdAt: -1 });

    return payments.filter((p) => p.bookingId !== null);
  }

  async getPaymentStats(guideId: string) {
    const payments = await Payment.find({
      status: "COMPLETED",
    }).populate({
      path: "bookingId",
      match: { guideId },
    });

    const filteredPayments = payments.filter((p) => p.bookingId !== null);
    const totalEarnings = filteredPayments.reduce(
      (sum: any, p: { amount: any }) => sum + p.amount,
      0,
    );
    const completedPayments = filteredPayments.length;

    return {
      totalEarnings,
      completedPayments,
      averagePayment:
        completedPayments > 0 ? totalEarnings / completedPayments : 0,
    };
  }

  async getGuideEarnings(guideId: string) {
    const payments = await Payment.find()
      .populate({
        path: "bookingId",
        match: { guideId },
      })
      .sort({ createdAt: -1 });

    const validPayments = payments.filter((p) => p.bookingId !== null);

    const totalEarnings = validPayments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = validPayments
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + p.amount, 0);

    const bookings = await Booking.find({ guideId });

    const bookingStats = {
      total: bookings.length,
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
    };

    // Calculate earnings by tour type
    const tourTypeEarnings: { [key: string]: { revenue: number; bookings: number } } = {};
    
    validPayments
      .filter((p) => p.status === "COMPLETED" && p.bookingId)
      .forEach((payment) => {
        const tourType = (payment.bookingId as any).tourType || "Other";
        if (!tourTypeEarnings[tourType]) {
          tourTypeEarnings[tourType] = { revenue: 0, bookings: 0 };
        }
        tourTypeEarnings[tourType].revenue += payment.amount;
        tourTypeEarnings[tourType].bookings += 1;
      });

    const revenueByTourType = Object.entries(tourTypeEarnings)
      .map(([type, data]) => ({
        type,
        revenue: data.revenue,
        bookings: data.bookings,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const recentTransactions = validPayments.slice(0, 5);

    return {
      totalEarnings,
      pendingAmount,
      bookingStats,
      revenueByTourType,
      recentTransactions,
    };
  }

  async getTotalRevenue() {
    const payments = await Payment.find({ status: "COMPLETED" });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);

    return { totalRevenue: total };
  }
  async getMonthlyRevenue() {
    const payments = await Payment.find({ status: "COMPLETED" });

    const map: any = {};

    payments.forEach((p) => {
      const month = new Date(p.createdAt).toISOString().slice(0, 7);
      map[month] = (map[month] || 0) + p.amount;
    });

    return map;
  }

  async getGuideMonthlyEarnings(guideId: string) {
    const payments = await Payment.find({ status: "COMPLETED" })
      .populate({
        path: "bookingId",
        match: { guideId },
      })
      .sort({ createdAt: -1 });

    const validPayments = payments.filter((p) => p.bookingId !== null);

    const monthlyData: { [key: string]: number } = {};

    validPayments.forEach((p) => {
      const month = new Date(p.paidAt || p.createdAt).toISOString().slice(0, 7); // Use paidAt if available
      monthlyData[month] = (monthlyData[month] || 0) + p.amount;
    });

    // Return last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      months.push({
        month: monthKey,
        revenue: monthlyData[monthKey] || 0,
      });
    }

    return months;
  }

  async getGuideWeeklyEarnings(guideId: string) {
    const payments = await Payment.find({ status: "COMPLETED" })
      .populate({
        path: "bookingId",
        match: { guideId },
      })
      .sort({ createdAt: -1 });

    const validPayments = payments.filter((p) => p.bookingId !== null);

    const weeklyData: { [key: string]: number } = {};

    validPayments.forEach((p) => {
      const date = new Date(p.paidAt || p.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().slice(0, 10);
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + p.amount;
    });

    // Return last 4 weeks
    const weeks = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - (i * 7));
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().slice(0, 10);
      weeks.push({
        week: `Week ${4 - i}`,
        revenue: weeklyData[weekKey] || 0,
      });
    }

    return weeks;
  }

  async getDriverEarnings(driverId: string) {
    const payments = await Payment.find()
      .populate({
        path: "bookingId",
        match: { driverId },
      })
      .sort({ createdAt: -1 });

    const validPayments = payments.filter((p) => p.bookingId !== null);

    const totalEarnings = validPayments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = validPayments
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + p.amount, 0);

    const bookings = await Booking.find({ driverId });

    const bookingStats = {
      total: bookings.length,
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
    };

    // Calculate earnings by tour type
    const tourTypeEarnings: { [key: string]: { revenue: number; bookings: number } } = {};
    
    validPayments
      .filter((p) => p.status === "COMPLETED" && p.bookingId)
      .forEach((payment) => {
        const tourType = (payment.bookingId as any).tourType || "Other";
        if (!tourTypeEarnings[tourType]) {
          tourTypeEarnings[tourType] = { revenue: 0, bookings: 0 };
        }
        tourTypeEarnings[tourType].revenue += payment.amount;
        tourTypeEarnings[tourType].bookings += 1;
      });

    const revenueByTourType = Object.entries(tourTypeEarnings)
      .map(([type, data]) => ({
        type,
        revenue: data.revenue,
        bookings: data.bookings,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const recentTransactions = validPayments.slice(0, 5);

    return {
      totalEarnings,
      pendingAmount,
      bookingStats,
      revenueByTourType,
      recentTransactions,
    };
  }

  async getDriverMonthlyEarnings(driverId: string) {
    const payments = await Payment.find({ status: "COMPLETED" })
      .populate({
        path: "bookingId",
        match: { driverId },
      })
      .sort({ createdAt: -1 });

    const validPayments = payments.filter((p) => p.bookingId !== null);

    const monthlyData: { [key: string]: number } = {};

    validPayments.forEach((p) => {
      const month = new Date(p.paidAt || p.createdAt).toISOString().slice(0, 7); // Use paidAt if available
      monthlyData[month] = (monthlyData[month] || 0) + p.amount;
    });

    // Return last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      months.push({
        month: monthKey,
        revenue: monthlyData[monthKey] || 0,
      });
    }

    return months;
  }

  async getDriverWeeklyEarnings(driverId: string) {
    const payments = await Payment.find({ status: "COMPLETED" })
      .populate({
        path: "bookingId",
        match: { driverId },
      })
      .sort({ createdAt: -1 });

    const validPayments = payments.filter((p) => p.bookingId !== null);

    const weeklyData: { [key: string]: number } = {};

    validPayments.forEach((p) => {
      const date = new Date(p.paidAt || p.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().slice(0, 10);
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + p.amount;
    });

    // Return last 4 weeks
    const weeks = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - (i * 7));
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().slice(0, 10);
      weeks.push({
        week: `Week ${4 - i}`,
        revenue: weeklyData[weekKey] || 0,
      });
    }

    return weeks;
  }
}

export const paymentService = new PaymentService();
