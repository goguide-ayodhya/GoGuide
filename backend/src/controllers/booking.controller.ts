import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { bookingService } from "../services/booking.service";
import { Guide } from "../models/Guide";
import { Driver } from "../models/Driver";
import { User } from "../models/User";
import { HttpException, Unauthorized } from "../utils/httpException";

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
      const bookings = await bookingService.getBookingsByGuide(
        guide._id.toString(),
        {
          status: status as string,
        },
      );

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

  async getAllBookings(req: AuthRequest, res: Response) {
    try {
      const { status, paymentStatus, dateRange, search } = req.query;
      const filters = {
        status: status as string,
        paymentStatus: paymentStatus as string,
        dateRange: dateRange as string,
        search: search as string,
      };
      const bookings = await bookingService.getAllBookings(filters);
      res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: bookings,
      });
    } catch (error) {
      throw error;
    }
  }

  async getDriverBookings(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { status } = req.query;

      console.log("getDriverBookings called for userId:", userId);

      // Find the driver document by userId
      const driver = await Driver.findOne({ userId });
      console.log("Found driver:", driver);

      if (!driver) {
        console.log("Driver profile not found for userId:", userId);
        return res.status(200).json({
          success: true,
          message: "Driver profile not found",
          data: [],
        });
      }

      console.log("Querying bookings for driverId:", driver._id.toString());
      const bookings = await bookingService.getBookingsByDriver(
        driver._id.toString(),
        {
          status: status as string,
        },
      );

      console.log("Found bookings:", bookings.length);
      res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: bookings,
      });
    } catch (error) {
      console.log("Error in getDriverBookings:", error);
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
      const userId = req.userId!;

      // Get user to determine role
      const user = await User.findById(userId);
      if (!user) {
        throw new Unauthorized("User not found");
      }

      const cancelledBy =
        user.role === "GUIDE" ||
        user.role === "TOURIST" ||
        user.role === "DRIVER"
          ? (user.role as "GUIDE" | "TOURIST" | "DRIVER")
          : undefined;

      const booking = await bookingService.cancelBooking(
        bookingId,
        req.body.reason,
        cancelledBy,
        userId,
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

      console.log(
        "[BOOKING] acceptBooking - userId:",
        userId,
        "bookingId:",
        bookingId,
      );

      const booking = await bookingService.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      console.log("[BOOKING] Found booking, type:", booking.bookingType);

      let actorId: string;
      // Validate bookingType and get appropriate actor
      if (booking.bookingType === "GUIDE") {
        const guide = await Guide.findOne({ userId });
        if (!guide) {
          console.error(
            "[BOOKING] Guide profile not found for userId:",
            userId,
          );
          return res.status(404).json({
            success: false,
            message:
              "Guide profile not found. Please complete your guide profile setup.",
          });
        }
        actorId = guide._id.toString();
        console.log("[BOOKING] Found guide:", guide._id);
      } else if (booking.bookingType === "DRIVER") {
        const driver = await Driver.findOne({ userId });
        if (!driver) {
          console.error(
            "[BOOKING] Driver profile not found for userId:",
            userId,
          );
          return res.status(404).json({
            success: false,
            message:
              "Driver profile not found. Please complete your driver profile setup.",
          });
        }
        actorId = driver._id.toString();
        console.log("[BOOKING] Found driver:", driver._id);
      } else {
        console.error("[BOOKING] Invalid booking type:", booking.bookingType);
        return res.status(400).json({
          success: false,
          message: `Invalid booking type: ${booking.bookingType}`,
        });
      }

      const updatedBooking = await bookingService.acceptBooking(
        bookingId,
        actorId,
        booking.bookingType,
      );

      res.status(200).json({
        success: true,
        message: "Booking accepted successfully",
        data: updatedBooking,
      });
    } catch (error) {
      throw error;
    }
  }

  async rejectBooking(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { bookingId } = req.params;

      const booking = await bookingService.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      let actorId: string;
      // Validate bookingType and get appropriate actor
      if (booking.bookingType === "GUIDE") {
        const guide = await Guide.findOne({ userId });
        if (!guide) {
          console.error(
            "[BOOKING] Guide profile not found for userId:",
            userId,
          );
          return res.status(404).json({
            success: false,
            message:
              "Guide profile not found. Please complete your guide profile setup.",
          });
        }
        actorId = guide._id.toString();
        console.log("[BOOKING] Found guide for rejection:", guide._id);
      } else if (booking.bookingType === "DRIVER") {
        const driver = await Driver.findOne({ userId });
        if (!driver) {
          console.error(
            "[BOOKING] Driver profile not found for userId:",
            userId,
          );
          return res.status(404).json({
            success: false,
            message:
              "Driver profile not found. Please complete your driver profile setup.",
          });
        }
        actorId = driver._id.toString();
        console.log("[BOOKING] Found driver for rejection:", driver._id);
      } else {
        console.error(
          "[BOOKING] Invalid booking type for rejection:",
          booking.bookingType,
        );
        return res.status(400).json({
          success: false,
          message: `Invalid booking type: ${booking.bookingType}`,
        });
      }

      const updatedBooking = await bookingService.rejectBooking(
        bookingId,
        actorId,
        booking.bookingType,
      );

      res.status(200).json({
        success: true,
        message: "Booking rejected successfully",
        data: updatedBooking,
      });
    } catch (error) {
      throw error;
    }
  }

  async completeBooking(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { bookingId } = req.params;

      const booking = await bookingService.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      let actorId: string;
      // Validate bookingType and get appropriate actor
      if (booking.bookingType === "GUIDE") {
        const guide = await Guide.findOne({ userId });
        if (!guide) {
          console.error(
            "[BOOKING] Guide profile not found for userId:",
            userId,
          );
          return res.status(404).json({
            success: false,
            message:
              "Guide profile not found. Please complete your guide profile setup.",
          });
        }
        actorId = guide._id.toString();
      } else if (booking.bookingType === "DRIVER") {
        const driver = await Driver.findOne({ userId });
        if (!driver) {
          console.error(
            "[BOOKING] Driver profile not found for userId:",
            userId,
          );
          return res.status(404).json({
            success: false,
            message:
              "Driver profile not found. Please complete your driver profile setup.",
          });
        }
        actorId = driver._id.toString();
      } else {
        console.error(
          "[BOOKING] Invalid booking type for completion:",
          booking.bookingType,
        );
        return res.status(400).json({
          success: false,
          message: `Invalid booking type: ${booking.bookingType}`,
        });
      }

      const updatedBooking = await bookingService.completeBooking(
        bookingId,
        actorId,
        booking.bookingType,
      );

      res.status(200).json({
        success: true,
        message: "Booking completed successfully",
        data: updatedBooking,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          errors: error.errors,
        });
      }
      console.error("Error completing booking:", error);
      return res.status(500).json({
        success: false,
        message: "Unable to complete booking at this time.",
      });
    }
  }

  async createPackageBooking(req: AuthRequest, res: Response) {
    const { packageId } = req.params;

    const booking = await bookingService.createPackageBooking(
      req.userId!,
      packageId,
    );

    res.status(201).json({
      success: true,
      data: booking,
    });
  }

  async markSeen(req: AuthRequest, res: Response) {
    const booking = await bookingService.markAsSeenByAdmin(
      req.params.bookingId,
    );
    res.json(booking);
  }
}

export const bookingController = new BookingController();
