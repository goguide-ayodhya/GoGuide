import { Booking } from "../models/Booking";
import { Guide } from "../models/Guide";
import { Payment } from "../models/Payment";
import { NotFound, BadRequest } from "../utils/httpException";
import {
  CreateBookingInput,
  UpdateBookingStatusInput,
} from "../validations/booking";
import { paymentService } from "./payment.service";

export class BookingService {
  async createBooking(userId: string, input: CreateBookingInput) {
    // Verify guide exists
    const guide = await Guide.findById(input.guideId);

    if (!guide) {
      throw new NotFound("Guide not found");
    }

    // Check guide availability
    if (!guide.isAvailable) {
      throw new BadRequest("Guide is not currently accepting bookings");
    }

    // Check guide isn't verified
    if (!guide.verificationStatus || guide.verificationStatus !== "VERIFIED") {
      throw new BadRequest("Guide is not verified");
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
      .populate("userId");

    return populatedBooking;
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

    return bookings;
  }

  async getBookingsByUser(userId: string) {
    const bookings = await Booking.find({ userId })
      .populate({
        path: "guideId",
        populate: { path: "userId" },
      })
      .populate("userId")
      .sort({ bookingDate: -1 });

    return bookings;
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

  async acceptBooking(bookingId: string, guideId: string) {
    const booking = await Booking.findById(bookingId);

    if (!booking) throw new NotFound("Booking not found");

    if (booking.guideId.toString() !== guideId) {
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

  async rejectBooking(bookingId: string, guideId: string) {
    const booking = await Booking.findById(bookingId);

    if (!booking) throw new NotFound("Booking not found");

    if (booking.guideId.toString() !== guideId) {
      throw new BadRequest("Not your booking");
    }

    booking.status = "REJECTED";
    booking.isSeenByAdmin = false;

    await booking.save();

    return booking;
  }
  async completeBooking(bookingId: string, guideId: string) {
    const booking = await Booking.findById(bookingId);

    if (!booking) throw new NotFound("Booking not found");

    if (booking.guideId.toString() !== guideId) {
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
