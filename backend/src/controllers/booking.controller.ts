import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { bookingService } from "../services/booking.service";
import { Guide } from "../models/Guide";

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
      const userId = req.userId!;
      const { status } = req.query;

      console.log("getGuideBookings called for userId:", userId);

      // Find the guide document by userId
      const guide = await Guide.findOne({ userId });
      console.log("Found guide:", guide);

      if (!guide) {
        console.log("Guide profile not found for userId:", userId);
        return res.status(200).json({
          success: true,
          message: "Guide profile not found",
          data: [],
        });
      }

      console.log("Querying bookings for guideId:", guide._id.toString());
      const bookings = await bookingService.getBookingsByGuide(guide._id.toString(), {
        status: status as string,
      });

      console.log("Found bookings:", bookings.length);
      res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: bookings,
      });
    } catch (error) {
      console.log("Error in getGuideBookings:", error);
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
    try {
      const userId = req.userId!;
      const { bookingId } = req.params;

      // Find the guide document by userId
      const guide = await Guide.findOne({ userId });
      if (!guide) {
        return res.status(404).json({
          success: false,
          message: "Guide profile not found",
        });
      }

      const booking = await bookingService.acceptBooking(
        bookingId,
        guide._id.toString(),
      );

      res.status(200).json({
        success: true,
        message: "Booking accepted successfully",
        data: booking,
      });
    } catch (error) {
      throw error;
    }
  }

  async rejectBooking(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { bookingId } = req.params;

      // Find the guide document by userId
      const guide = await Guide.findOne({ userId });
      if (!guide) {
        return res.status(404).json({
          success: false,
          message: "Guide profile not found",
        });
      }

      const booking = await bookingService.rejectBooking(
        bookingId,
        guide._id.toString(),
      );

      res.status(200).json({
        success: true,
        message: "Booking rejected successfully",
        data: booking,
      });
    } catch (error) {
      throw error;
    }
  }

  async completeBooking(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { bookingId } = req.params;

      // Find the guide document by userId
      const guide = await Guide.findOne({ userId });
      if (!guide) {
        return res.status(404).json({
          success: false,
          message: "Guide profile not found",
        });
      }

      const booking = await bookingService.completeBooking(
        bookingId,
        guide._id.toString(),
      );

      res.status(200).json({
        success: true,
        message: "Booking completed successfully",
        data: booking,
      });
    } catch (error) {
      throw error;
    }
  }

  async markSeen(req: AuthRequest, res: Response) {
    const booking = await bookingService.markAsSeenByAdmin(
      req.params.bookingId,
    );
    res.json(booking);
  }
}

export const bookingController = new BookingController();
