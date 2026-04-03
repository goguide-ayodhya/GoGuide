import { Payment } from "../models/Payment";
import { Booking } from "../models/Booking";
import { NotFound, BadRequest, Unauthorized } from "../utils/httpException";

export class PaymentService {
  async createPayment(userId: string, bookingId: string) {
    // Verify booking exists
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new NotFound("Booking not found");
    }

    if (booking.status !== "ACCEPTED") {
      throw new BadRequest("Booking not accepted yet");
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
      amount: booking.totalPrice,
    });

    const populatedPayment = await Payment.findById(payment._id).populate(
      "bookingId",
    );

    return populatedPayment;
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
      await Booking.findByIdAndUpdate(payment.bookingId, {
        paymentStatus: "COMPLETED",
      });
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

    const recentTransactions = validPayments.slice(0, 5);

    return {
      totalEarnings,
      pendingAmount,
      bookingStats,
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
}

export const paymentService = new PaymentService();
