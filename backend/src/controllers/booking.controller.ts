import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { bookingService } from "../services/booking.service";

export class BookingController {
  async createBooking(req: AuthRequest, res: Response) {
    try {
      const booking = await bookingService.createBooking(req.userId!, req.body);

      res.status(201).json({
        success: true,
        message: "Booking created successfully",
        data: booking,
      });
    } catch (error) {
      throw error;
    }
  }

  async getMyBookings(req: AuthRequest, res: Response) {
    try {
      const bookings = await bookingService.getBookingsByUser(req.userId!);

      res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: bookings,
      });
    } catch (error) {
      throw error;
    }
  }

  async getGuideBookings(req: AuthRequest, res: Response) {
    try {
      const guideId = req.userId!;
      const { status } = req.query;

      const bookings = await bookingService.getBookingsByGuide(guideId, {
        status: status as string,
      });

      res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: bookings,
      });
    } catch (error) {
      throw error;
    }
  }

  async getBookingById(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.params;
      const booking = await bookingService.getBookingById(bookingId);

      res.status(200).json({
        success: true,
        message: "Booking retrieved successfully",
        data: booking,
      });
    } catch (error) {
      throw error;
    }
  }
  async cancelBooking(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.params;
      const booking = await bookingService.cancelBooking(
        bookingId,
        req.body.reason,
      );

      res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        data: booking,
      });
    } catch (error) {
      throw error;
    }
  }
  async acceptBooking(req: AuthRequest, res: Response) {
    const booking = await bookingService.acceptBooking(
      req.params.bookingId,
      req.userId!,
    );
    res.json(booking);
  }

  async rejectBooking(req: AuthRequest, res: Response) {
    const booking = await bookingService.rejectBooking(
      req.params.bookingId,
      req.userId!,
    );
    res.json(booking);
  }

  async completeBooking(req: AuthRequest, res: Response) {
    const booking = await bookingService.completeBooking(
      req.params.bookingId,
      req.userId!,
    );
    res.json(booking);
  }

  async markSeen(req: AuthRequest, res: Response) {
    const booking = await bookingService.markAsSeenByAdmin(
      req.params.bookingId,
    );
    res.json(booking);
  }
}

export const bookingController = new BookingController();
