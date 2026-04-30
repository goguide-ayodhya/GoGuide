import { Booking } from "../models/Booking";
import { Payment } from "../models/Payment";
import { Driver } from "../models/Driver";
import { Guide } from "../models/Guide";
import { User } from "../models/User";
import { Review } from "../models/Review";
import { NotFound, BadRequest } from "../utils/httpException";
import { calculateFinalPrice } from "../utils/bookingPricing";
import { paymentService } from "./payment.service";
import { NotificationService } from "./notification.service";
import { roundMoney } from "../utils/bookingPricing";
import { applyPlatformSplitToBooking } from "./bookingCommission.service";
import { CreateBookingInput } from "../validations/booking";
import { TourPackage } from "../models/Tour";

export class BookingService {
  async createBooking(userId: string, input: CreateBookingInput) {
    let entity: any;
    let assignedUserId: string | undefined;
    console.log(
      `[BOOKING] Creating booking - userId: ${userId}, bookingType: ${input.bookingType}`,
    );

    if (input.bookingType === "GUIDE") {
      const guide = await Guide.findById(input.guideId);
      if (!guide) {
        throw new NotFound("Guide not found");
      }
      if (!guide.isAvailable) {
        throw new BadRequest("Guide is not currently accepting bookings");
      }
      if (
        !guide.verificationStatus ||
        guide.verificationStatus !== "VERIFIED"
      ) {
        throw new BadRequest("Guide is not verified");
      }

      entity = guide;
      assignedUserId = guide.userId?.toString();
      console.log(`[BOOKING] Guide verified: ${guide._id}`);
    }

    if (input.bookingType === "DRIVER") {
      const driver = await Driver.findById(input.driverId);

      if (!driver) {
        throw new NotFound("Driver not found");
      }

      if (!driver.isAvailable) {
        throw new BadRequest("Driver is not available");
      }

      if (driver.verificationStatus !== "VERIFIED") {
        throw new BadRequest("Driver is not verified");
      }

      entity = driver;
      assignedUserId = driver.userId?.toString();
      console.log(`[BOOKING] Driver verified: ${driver._id}`);
    }

    if (input.bookingType === "PACKAGE") {
      if (!input.packageId) {
        throw new BadRequest("packageId is required for PACKAGE bookings");
      }

      const pkg = await TourPackage.findById(input.packageId);
      if (!pkg) {
        throw new NotFound("Package not found");
      }
      if (!pkg.isActive) {
        throw new BadRequest("Package is not available");
      }

      entity = pkg;
      // No assigned user for packages
      console.log(`[BOOKING] Package verified: ${pkg._id}`);
    }

    if (!entity) {
      throw new BadRequest("Invalid booking type or entity not found");
    }

    const totalPrice = input.totalPrice;
    if (totalPrice <= 0) {
      throw new BadRequest("Invalid price");
    }

    if (!input.totalPrice || input.totalPrice <= 0) {
      throw new BadRequest("Invalid price");
    }

    // Calculate pricing using centralized function
    // At booking creation, no payment mode is selected yet, so no discount applies
    const pricing = calculateFinalPrice({
      totalPrice,
      discountPercent: 0, // No discount at creation time
    });

    const booking = await Booking.create({
      ...input,
      userId,
      originalPrice: pricing.totalPrice,
      discount: pricing.discount,
      gstAmount: pricing.gstAmount,
      finalPrice: pricing.finalPrice,
      paidAmount: 0,
      remainingAmount: pricing.finalPrice,
      partialDiscountApplied: false,
      guideEarning: 0,
      adminCommission: 0,
    });

    console.log(
      `[BOOKING] Booking created successfully: ${booking._id}, bookingType: ${booking.bookingType}`,
    );

    if (assignedUserId) {
      console.log(
        `[BOOKING] Sending booking creation notification to assigned user ${assignedUserId}`,
      );
      try {
        await NotificationService.sendNotification(
          assignedUserId,
          "New Booking Assigned",
          `A new booking has been assigned to you. Booking ID: ${booking._id}`,
          {
            bookingId: booking._id.toString(),
            type: "booking_assigned",
          },
        );
      } catch (error) {
        console.warn("Notification send failed (non-blocking):", error);
      }
    } else {
      console.warn(
        `[BOOKING] No assigned guide/driver user found for booking ${booking._id}`,
      );
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: "guideId",
        populate: { path: "userId" },
      })
      .populate({
        path: "driverId",
        populate: { path: "userId" },
      })
      .populate("userId");

    return populatedBooking;
  }

  private async addReviewStatus(bookings: any[]) {
    if (!bookings.length) return bookings;

    const bookingIds = bookings.map((booking) => booking._id);
    const reviews = await Review.find({
      bookingId: { $in: bookingIds },
    }).select("bookingId");
    const reviewedBookingIds = new Set(
      reviews.map((review) => review.bookingId.toString()),
    );

    return bookings.map((booking) => ({
      ...booking.toObject(),
      reviewed: reviewedBookingIds.has(booking._id.toString()),
    }));
  }

  async getBookingsByGuide(guideId: string, filters?: { status?: string }) {
    const query: any = { guideId, bookingType: "GUIDE" };

    if (filters?.status) {
      query.status = filters.status;
    }

    console.log(
      `[BOOKING] Fetching guide bookings - guideId: ${guideId}, query:`,
      query,
    );

    const bookings = await Booking.find(query)
      .populate({
        path: "guideId",
        populate: { path: "userId" },
      })
      .populate("userId")
      .sort({ bookingDate: -1 });

    return this.addReviewStatus(bookings);
  }

  async getBookingsByDriver(driverId: string, filters?: { status?: string }) {
    const query: any = { driverId, bookingType: "DRIVER" };

    if (filters?.status) {
      query.status = filters.status;
    }

    console.log(
      `[BOOKING] Fetching driver bookings - driverId: ${driverId}, query:`,
      query,
    );

    const bookings = await Booking.find(query)
      .populate({
        path: "driverId",
        populate: { path: "userId" },
      })
      .populate("userId")
      .sort({ bookingDate: -1 });

    return this.addReviewStatus(bookings);
  }

  async getBookingsByUser(userId: string) {
    const bookings = await Booking.find({ userId })
      .populate({
        path: "guideId",
        populate: { path: "userId" },
      })
      .populate("userId")
      .sort({ bookingDate: -1 });

    return this.addReviewStatus(bookings);
  }

  async getAllBookings(filters?: {
    status?: string;
    paymentStatus?: string;
    dateRange?: string;
    search?: string;
  }) {
    const query: any = {};

    if (filters?.status && filters.status !== "all") {
      query.status = filters.status;
    }

    if (filters?.paymentStatus && filters.paymentStatus !== "all") {
      query.paymentStatus = filters.paymentStatus;
    }

    if (filters?.dateRange) {
      const now = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          break;
        case "thisWeek":
          const dayOfWeek = now.getDay();
          startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "thisMonth":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0); // All time
      }

      if (filters.dateRange !== "all") {
        query.bookingDate = { $gte: startDate };
      }
    }

    if (filters?.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { touristName: searchRegex },
        { guideName: searchRegex },
        { email: searchRegex },
        {
          _id: filters.search.match(/^[0-9a-fA-F]{24}$/)
            ? [{ _id: filters.search }]
            : [],
        },
      ].filter(Boolean);
    }

    const bookings = await Booking.find(query)
      .populate({
        path: "guideId",
        populate: { path: "userId" },
      })
      .populate({
        path: "driverId",
        populate: { path: "userId" },
      })
      .populate("userId")
      .sort({ bookingDate: -1 });

    return this.addReviewStatus(bookings);
  }

  async getBookingById(bookingId: string) {
    const booking = await Booking.findById(bookingId)
      .populate({
        path: "guideId",
        populate: { path: "userId" },
      })
      .populate({
        path: "driverId",
        populate: { path: "userId" },
      })
      .populate("userId");

    if (!booking) {
      throw new NotFound("Booking not found");
    }

    return booking;
  }

  async cancelBooking(
    bookingId: string,
    reason?: string,
    cancelledBy?: "GUIDE" | "TOURIST" | "DRIVER",
    actorUserId?: string,
  ) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new NotFound("Booking not found");
    }

    if (!reason) {
      throw new BadRequest("Cancellation reason is required");
    }

    if (["COMPLETED", "CANCELLED"].includes(booking.status)) {
      throw new BadRequest(
        `Cannot cancel a ${booking.status.toLowerCase()} booking`,
      );
    }

    if (actorUserId) {
      if (
        cancelledBy === "TOURIST" &&
        booking.userId.toString() !== actorUserId
      ) {
        throw new BadRequest("Only booking owner can cancel as tourist");
      }
      if (cancelledBy === "GUIDE") {
        const guide = await Guide.findOne({ userId: actorUserId });
        if (!guide || booking.guideId?.toString() !== guide._id.toString()) {
          throw new BadRequest("Only assigned guide can cancel this booking");
        }
      }
      if (cancelledBy === "DRIVER") {
        const driver = await Driver.findOne({ userId: actorUserId });
        if (!driver || booking.driverId?.toString() !== driver._id.toString()) {
          throw new BadRequest("Only assigned driver can cancel this booking");
        }
      }
    }

    booking.status = "CANCELLED";
    booking.paymentStatus = "REJECTED";
    booking.cancellationReason = reason;
    booking.cancelledBy = cancelledBy;
    booking.cancelledAt = new Date();
    await booking.save();

    let refundAmount = 0;
    if ((booking.paidAmount ?? 0) > 0 && actorUserId) {
      try {
        const refunds = await paymentService.createCancellationRefunds(
          actorUserId,
          booking._id.toString(),
          reason,
        );
        refundAmount = refunds.reduce((sum, r) => sum + r.amount, 0);
      } catch (error) {
        console.warn(
          `[BOOKING] cancellation refund failed for booking ${booking._id}:`,
          error,
        );
      }
    }

    // Track cancellation count for the user
    if (cancelledBy === "TOURIST") {
      await User.findByIdAndUpdate(booking.userId, {
        $inc: { cancellationCount: 1 },
      });

      // Check if user should be suspended
      const user = await User.findById(booking.userId);
      if (user && (user.cancellationCount || 0) >= 3) {
        await User.findByIdAndUpdate(booking.userId, { status: "SUSPENDED" });
      }
    }

    return { booking, refundAmount };
  }

  async adminAcceptBooking(bookingId: string) {
    const booking = await Booking.findById(bookingId);

    if (!booking) throw new NotFound("Booking not found");

    if (booking.bookingType !== "PACKAGE") {
      throw new BadRequest("Admin can only accept PACKAGE bookings");
    }

    booking.status = "ACCEPTED";
    booking.isSeenByAdmin = true;

    await booking.save();

    console.log(`[BOOKING] 📦 Package Booking Admin Accepted: ${bookingId}`);

    try {
      await paymentService.ensureInitialPayment(
        booking.userId.toString(),
        booking._id.toString(),
      );
    } catch (err) {
      console.error("[PAYMENT INIT FAILED]", err);
      throw new Error("Failed to initialize payment after booking acceptance");
    }

    try {
      await NotificationService.sendNotification(
        booking.userId.toString(),
        "Booking Confirmed",
        `Your package booking has been confirmed by admin. Booking ID: ${booking._id}`,
        {
          bookingId: booking._id.toString(),
          type: "booking_confirmed",
        },
      );
    } catch (error) {
      console.warn("Notification send failed (non-blocking):", error);
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: "guideId",
        populate: { path: "userId" },
      })
      .populate({
        path: "driverId",
        populate: { path: "userId" },
      })
      .populate("userId");

    return populatedBooking;
  }

  async acceptBooking(
    bookingId: string,
    actorId: string,
    bookingType: "GUIDE" | "DRIVER" | "TOKEN",
  ) {
    if (bookingType === "TOKEN") {
      throw new BadRequest("Token bookings cannot be accepted");
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) throw new NotFound("Booking not found");

    // Validate bookingType matches
    if (booking.bookingType !== bookingType) {
      throw new BadRequest(
        `Booking type mismatch. Expected ${booking.bookingType}, got ${bookingType}`,
      );
    }

    if (
      bookingType === "GUIDE"
        ? booking.guideId?.toString() !== actorId
        : booking.driverId?.toString() !== actorId
    ) {
      throw new BadRequest("Not your booking");
    }

    booking.status = "ACCEPTED";
    booking.isSeenByAdmin = false;

    await booking.save();

    console.log(
      `[BOOKING] 📦 Booking Accepted: ${bookingId}, bookingType: ${bookingType}`,
    );

    try {
      await paymentService.ensureInitialPayment(
        booking.userId.toString(),
        booking._id.toString(),
      );
    } catch (err) {
      console.error("[PAYMENT INIT FAILED]", err);
      throw new Error("Failed to initialize payment after booking acceptance");
    }

    try {
      await NotificationService.sendBookingStatusUpdate(
        bookingId.toString(),
        "ACCEPTED",
      );
    } catch (error) {
      console.warn("Notification send failed (non-blocking):", error);
    }

    return booking;
  }

  async rejectBooking(
    bookingId: string,
    actorId: string,
    bookingType: "GUIDE" | "DRIVER" | "TOKEN",
  ) {
    if (bookingType === "TOKEN") {
      throw new BadRequest("Token bookings cannot be rejected");
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) throw new NotFound("Booking not found");

    // Validate bookingType matches
    if (booking.bookingType !== bookingType) {
      throw new BadRequest(
        `Booking type mismatch. Expected ${booking.bookingType}, got ${bookingType}`,
      );
    }

    if (
      bookingType === "GUIDE"
        ? booking.guideId?.toString() !== actorId
        : booking.driverId?.toString() !== actorId
    ) {
      throw new BadRequest("Not your booking");
    }

    booking.status = "REJECTED";
    booking.isSeenByAdmin = false;

    await booking.save();

    console.log(
      `[BOOKING] ❌ Booking Rejected: ${bookingId}, bookingType: ${bookingType}`,
    );

    // Send notification to user (async - don't block response)
    try {
      await NotificationService.sendBookingStatusUpdate(
        bookingId.toString(),
        "REJECTED",
      );
    } catch (error) {
      console.warn("Notification send failed (non-blocking):", error);
    }

    return booking;
  }

  async completeBooking(
    bookingId: string,
    actorId: string,
    bookingType: "GUIDE" | "DRIVER" | "TOKEN",
  ) {
    if (bookingType === "TOKEN") {
      throw new BadRequest("Token bookings cannot be completed");
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) throw new NotFound("Booking not found");

    // Validate bookingType matches
    if (booking.bookingType !== bookingType) {
      throw new BadRequest(
        `Booking type mismatch. Expected ${booking.bookingType}, got ${bookingType}`,
      );
    }

    if (
      bookingType === "GUIDE"
        ? booking.guideId?.toString() !== actorId
        : booking.driverId?.toString() !== actorId
    ) {
      throw new BadRequest("Not your booking");
    }
    if (booking.status !== "ACCEPTED") {
      throw new BadRequest("Only accepted bookings can be completed");
    }
    // Prevent marking booking as completed until payment is successfully collected.
    // Allow completion for COD or free bookings.
    const finalPrice = booking.finalPrice ?? booking.totalPrice;

    if (booking.paymentStatus !== "COMPLETED") {
      throw new BadRequest("Payment not completed");
    }
    // await paymentService.syncPaymentStatus(bookingId);

    const isCod =
      booking.paymentType === "COD" || booking.paymentMethod === "COD";
    if (isCod) {
      booking.paidAmount = finalPrice;
      booking.remainingAmount = 0;
      booking.paymentStatus = "COMPLETED";
      applyPlatformSplitToBooking(booking);
    }

    if (!isCod && typeof finalPrice === "number" && finalPrice > 0) {
      // Reconciliation: check completed payment rows and correct booking paymentStatus if possible.
      const completedPayments = await Payment.find({
        bookingId: booking._id,
        status: "COMPLETED",
      }).lean();

      const sumCompleted = (completedPayments || []).reduce(
        (s: number, p: any) => {
          const line =
            p.amountPaid != null && p.amountPaid > 0
              ? p.amountPaid
              : (p.amount ?? 0);
          return s + Number(line || 0);
        },
        0,
      );

      if (sumCompleted >= finalPrice - 0.01) {
        // Payments cover the final price; update booking to reflect actual captured amount.
        booking.paidAmount = roundMoney(sumCompleted);
        booking.remainingAmount = roundMoney(
          Math.max(0, finalPrice - booking.paidAmount),
        );
        booking.paymentStatus = "COMPLETED";
        applyPlatformSplitToBooking(booking);
      } else {
        // If booking thought it was completed but payments don't match, correct booking and block completion.
        if (booking.paymentStatus === "COMPLETED") {
          booking.paidAmount = roundMoney(sumCompleted);
          booking.remainingAmount = roundMoney(
            Math.max(0, finalPrice - sumCompleted),
          );
          booking.paymentStatus =
            booking.paidAmount > 0 ? "PARTIAL" : "PENDING";
          applyPlatformSplitToBooking(booking);
          await booking.save();
          throw new BadRequest(
            `Booking payment inconsistent; corrected to ${booking.paymentStatus}. Cannot complete until payment is collected.`,
          );
        }

        throw new BadRequest(
          "Cannot complete booking until payment is successfully collected",
        );
      }
    }

    booking.status = "COMPLETED";
    if ((booking as any).packageId) {
      const { TourPackage } = await import("../models/Tour");

      await TourPackage.findByIdAndUpdate(booking.packageId, {
        $inc: { soldCount: 1 },
      });
    }
    await booking.save();

    // Send notification to user (async - don't block response)
    try {
      await NotificationService.sendBookingStatusUpdate(
        bookingId.toString(),
        "COMPLETED",
      );
    } catch (error) {
      console.warn("Notification send failed (non-blocking):", error);
    }

    return booking;
  }

  async createPackageBooking(userId: string, packageId: string) {
    const pkg = await TourPackage.findById(packageId);
    if (!pkg) throw new NotFound("Package not found");

    if (!pkg.isActive) {
      throw new BadRequest("Package not available");
    }

    const user = await User.findById(userId);
    if (!user) throw new NotFound("User not found");
    if (!user.name || !user.email || !user.phone) {
      throw new BadRequest("User profile must include name, email, and phone");
    }

    const meetingPoint =
      Array.isArray(pkg.locations) && pkg.locations.length > 0
        ? pkg.locations[0]
        : pkg.title || "Meeting point not specified";
    const dropoffLocation =
      Array.isArray(pkg.locations) && pkg.locations.length > 0
        ? pkg.locations[pkg.locations.length - 1]
        : pkg.title || "Dropoff location not specified";

    const booking = await Booking.create({
      userId,
      packageId,
      bookingType: "PACKAGE",

      touristName: user.name,
      email: user.email,
      phone: user.phone,

      groupSize: 1,
      bookingDate: new Date(),
      startTime: pkg.startTime || "03:00",

      tourType: pkg.title,
      meetingPoint,
      dropoffLocation,

      totalPrice: pkg.price,
      originalPrice: pkg.price,
      finalPrice: pkg.price,

      paidAmount: 0,
      remainingAmount: pkg.price,

      guideEarning: 0,
      adminCommission: 0,

      status: "PENDING",
      paymentStatus: "PENDING",
    });

    return booking;
  }

  async markAsSeenByAdmin(bookingId: string) {
    return Booking.findByIdAndUpdate(
      bookingId,
      { isSeenByAdmin: true },
      { new: true },
    );
  }
}

export const bookingService = new BookingService();
