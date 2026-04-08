import { Booking } from "../models/Booking";
import { Driver } from "../models/Driver";
import { Guide } from "../models/Guide";
import { Payment } from "../models/Payment";
import { Review } from "../models/Review";
import { NotFound, BadRequest } from "../utils/httpException";
import { CreateBookingInput } from "../validations/booking";
import { paymentService } from "./payment.service";

export class BookingService {
  async createBooking(userId: string, input: CreateBookingInput) {
    let entity: any;
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
    }

    if (!entity) {
      throw new BadRequest("Invalid booking type or entity not found");
    }

    const booking = await Booking.create({
      ...input,
      userId,
    });

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
    const query: any = { guideId };

    if (filters?.status) {
      query.status = filters.status;
    }

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
    const query: any = { driverId };

    if (filters?.status) {
      query.status = filters.status;
    }

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

  async getBookingById(bookingId: string) {
    const booking = await Booking.findById(bookingId)
      .populate({
        path: "guideId",
        populate: { path: "userId" },
      })
      .populate("userId");

    if (!booking) {
      throw new NotFound("Booking not found");
    }

    return booking;
  }

  async cancelBooking(bookingId: string, reason?: string) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new NotFound("Booking not found");
    }

    if (["COMPLETED", "CANCELLED"].includes(booking.status)) {
      throw new BadRequest(
        `Cannot cancel a ${booking.status.toLowerCase()} booking`,
      );
    }
    booking.status = "CANCELLED";
    await booking.save();
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

    const existingPayment = await Payment.findOne({ bookingId });

    if (!existingPayment) {
      await paymentService.createPayment(
        booking.userId.toString(),
        booking._id.toString(),
      );
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
