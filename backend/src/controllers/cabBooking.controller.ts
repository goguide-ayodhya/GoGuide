import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { cabBookingService } from "../services/cabBooking.service";

export class CabBookingController {
  async createBooking(req: AuthRequest, res: Response) {
    try {
      const {
        fullName,
        phone,
        numPeople,
        specialAssistance,
        startDate,
        numDays,
        pickupLocation,
        dropoffLocation,
        vehicleType,
        acPreference,
      } = req.body;

      if (!fullName || !phone || !numPeople || !startDate || !numDays || !pickupLocation || !dropoffLocation || !vehicleType || !acPreference) {
        return res.status(400).json({
          success: false,
          message: "All fields are required.",
        });
      }

      const bookingData = {
        userId: req.userId ? req.userId : undefined,
        fullName,
        phone,
        numPeople: Number(numPeople),
        specialAssistance: {
          wheelchair: !!specialAssistance?.wheelchair,
          medicalSupport: !!specialAssistance?.medicalSupport,
          elderlyCare: !!specialAssistance?.elderlyCare,
          childCare: !!specialAssistance?.childCare,
        },
        startDate: new Date(startDate),
        numDays: Number(numDays),
        pickupLocation,
        dropoffLocation,
        vehicleType,
        acPreference,
        status: "PENDING" as const,
      };

      const booking = await cabBookingService.createBooking(bookingData);
      res.status(201).json({ success: true, data: booking });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create cab booking",
      });
    }
  }

  async getMyBookings(req: AuthRequest, res: Response) {
    try {
      const bookings = await cabBookingService.getBookingsByUser(req.userId!);
      res.status(200).json({ success: true, data: bookings });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve your cab bookings",
      });
    }
  }

  async getAllBookings(req: AuthRequest, res: Response) {
    try {
      const bookings = await cabBookingService.getAllBookings();
      res.status(200).json({ success: true, data: bookings });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve cab bookings",
      });
    }
  }

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.params;
      const { status } = req.body;

      if (!["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      const booking = await cabBookingService.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      // Authorization check
      if (req.user?.role !== "ADMIN" && (booking.userId?.toString() !== req.userId || status !== "CANCELLED")) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this booking status.",
        });
      }

      const updated = await cabBookingService.updateStatus(bookingId, status);
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update booking status",
      });
    }
  }
}

export const cabBookingController = new CabBookingController();
