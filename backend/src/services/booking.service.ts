import { Booking } from "../models/Booking";
import { Driver } from "../models/Driver";
import { Guide } from "../models/Guide";
import { User } from "../models/User";
import { Payment } from "../models/Payment";
import { Review } from "../models/Review";
import { NotFound, BadRequest } from "../utils/httpException";
import { CreateBookingInput } from "../validations/booking";
import { paymentService } from "./payment.service";
import { NotificationService } from "./notification.service";

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

    if (!entity) {
      throw new BadRequest("Invalid booking type or entity not found");
    }

    const booking = await Booking.create({
      ...input,
      userId,
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
    const reviews = await Review.find({ bookingId: { $in: bookingIds } }).select(
      "bookingId",
    );
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

    console.log(`[BOOKING] Fetching guide bookings - guideId: ${guideId}, query:`, query);

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

    console.log(`[BOOKING] Fetching driver bookings - driverId: ${driverId}, query:`, query);

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

  async getAllBookings() {
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

  async cancelBooking(bookingId: string, reason?: string, cancelledBy?: "GUIDE" | "TOURIST" | "DRIVER") {
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

    booking.status = "CANCELLED";
    booking.cancellationReason = reason;
    booking.cancelledBy = cancelledBy;
    booking.cancelledAt = new Date();
    await booking.save();

    // Track cancellation count for the user
    if (cancelledBy === "TOURIST") {
      await User.findByIdAndUpdate(booking.userId, { $inc: { cancellationCount: 1 } });
      
      // Check if user should be suspended
      const user = await User.findById(booking.userId);
      if (user && (user.cancellationCount || 0) + 1 >= 3) {
        await User.findByIdAndUpdate(booking.userId, { status: "SUSPENDED" });
      }
    }

    return booking;
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

    const existingPayment = await Payment.findOne({ bookingId });

    if (!existingPayment) {
      await paymentService.createPayment(
        booking.userId.toString(),
        booking._id.toString(),
      );
    }

    // Send notification to user (async - don't block response)
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
    booking.status = "COMPLETED";
    await booking.save();

    console.log(
      `[BOOKING] ✅ Booking Completed: ${bookingId}, bookingType: ${bookingType}`,
    );

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
  async markAsSeenByAdmin(bookingId: string) {
    return Booking.findByIdAndUpdate(
      bookingId,
      { isSeenByAdmin: true },
      { new: true },
    );
  }
}

export const bookingService = new BookingService();
