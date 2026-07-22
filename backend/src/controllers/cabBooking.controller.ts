import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { cabBookingService, parseDateTime } from "../services/cabBooking.service";
import { CabLocation } from "../models/CabLocation";
import { CabCategory } from "../models/CabCategory";
import { CabBooking } from "../models/CabBooking";
import { sendEmail } from "../config/email.config";
import { generateStatusEmail } from "../utils/emailTemplates";

const sendCabBookingConfirmationEmail = async (booking: any) => {
  try {
    const userEmail = booking.userId?.email || booking.touristEmail;
    if (!userEmail) {
      console.warn("No user email found to send cab booking confirmation");
      return;
    }

    const formattedDate = new Date(booking.startDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const subject = `GoGuide - Cab Booking Confirmation [${booking.bookingId || booking._id}]`;
    const html = generateStatusEmail({
      title: "Cab Booking Confirmed!",
      titleColor: "#16a34a",
      messageParagraphs: [
        `Dear ${booking.fullName},`,
        `Your cab booking request has been successfully confirmed. Here are your booking details:`,
        `<strong>Booking ID:</strong> ${booking.bookingId || booking._id}`,
        `<strong>Pickup Location:</strong> ${booking.pickupLocation}`,
        `<strong>Drop Location:</strong> ${booking.dropoffLocation}`,
        `<strong>Car Category:</strong> ${booking.vehicleType}`,
        `<strong>Pickup Date & Time:</strong> ${formattedDate} at ${booking.pickupTime}`,
        `<strong>Amount:</strong> ₹${booking.totalAmount} (Base Price: ₹${booking.price} + Tax: ₹${booking.tax} + Wheelchair Charge: ₹${booking.wheelchairCharge || 0} + Medical Support: ₹${booking.medicalSupportCharge || 0})`,
        `Thank you for booking with GoGuide! If you have any questions, feel free to contact us.`
      ],
      actionText: "View My Bookings",
      actionUrl: `${process.env.CORS_ORIGIN || "http://localhost:3000"}/tourist/bookings`,
      actionColor: "#16a34a",
    });

    await sendEmail({
      to: userEmail,
      subject,
      html,
    });
  } catch (err) {
    console.error("Failed to send booking confirmation email:", err);
  }
};

export class CabBookingController {
  // Create Booking with dynamic pricing, validations, and backend authority
  async createBooking(req: AuthRequest, res: Response) {
    try {
      const {
        fullName,
        phone,
        numPeople,
        specialAssistance,
        startDate,
        numDays,
        pickupLocationId,
        dropoffLocationId,
        carCategoryId,
        pickupTime,
      } = req.body;

      if (
        !fullName ||
        !phone ||
        !numPeople ||
        !startDate ||
        !pickupLocationId ||
        !dropoffLocationId ||
        !carCategoryId ||
        !pickupTime
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are required.",
        });
      }

      // 1. Minimum Advance Booking Time validation
      const pickupDateTime = parseDateTime(startDate, pickupTime);
      const now = new Date();
      if (pickupDateTime.getTime() - now.getTime() < 60 * 60 * 1000) {
        return res.status(400).json({
          success: false,
          message: "Cab bookings must be made at least 1 hour in advance.",
        });
      }

      // 2. Fetch configured locations and categories
      const pickupEntity = await CabLocation.findById(pickupLocationId);
      const dropEntity = await CabLocation.findById(dropoffLocationId);
      const categoryEntity = await CabCategory.findById(carCategoryId);

      if (!pickupEntity || !dropEntity || !categoryEntity) {
        return res.status(400).json({
          success: false,
          message: "Selected pickup, drop location, or vehicle category is invalid or inactive.",
        });
      }

      // 3. Backend Price Calculation (Never trust frontend values)
      const calculation = await cabBookingService.calculatePrice(
        pickupLocationId,
        dropoffLocationId,
        carCategoryId,
        !!specialAssistance?.wheelchair,
        !!specialAssistance?.medicalSupport
      );

      const bookingData = {
        userId: req.userId ? (req.userId as any) : undefined,
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
        numDays: Number(numDays) || 1,
        pickupLocation: pickupEntity.name,
        dropoffLocation: dropEntity.name,
        vehicleType: categoryEntity.name,
        status: "PENDING" as const,

        // New fields
        pickupLocationId,
        dropoffLocationId,
        carCategoryId,
        pickupTime,
        price: calculation.price,
        tax: calculation.tax,
        wheelchairCharge: calculation.wheelchairCharge,
        medicalSupportCharge: calculation.medicalSupportCharge,
        totalAmount: calculation.totalAmount,
        paymentStatus: "PENDING" as const,
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

  // Get current user's bookings
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

  // Admin get all bookings
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

  // Update booking status (and trigger confirmation email)
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
      if (
        req.user?.role !== "ADMIN" &&
        (booking.userId?.toString() !== req.userId || status !== "CANCELLED")
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this booking status.",
        });
      }

      // Cancel Eligibility check (1 hour restriction)
      if (status === "CANCELLED" && req.user?.role !== "ADMIN") {
        const pickupDateTime = parseDateTime(booking.startDate, booking.pickupTime);
        const now = new Date();
        if (pickupDateTime.getTime() - now.getTime() < 60 * 60 * 1000) {
          return res.status(400).json({
            success: false,
            message: "Cab bookings cannot be cancelled or rescheduled within 1 hour of pickup time.",
          });
        }
      }

      const updated = await cabBookingService.updateStatus(bookingId, status);

      // Trigger Email Notification on CONFIRMED
      if (status === "CONFIRMED" && updated) {
        await sendCabBookingConfirmationEmail(updated);
      }

      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update booking status",
      });
    }
  }

  // Reschedule Booking with strictly calculated window validation
  async rescheduleBooking(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.params;
      const { startDate, pickupTime } = req.body;

      if (!startDate || !pickupTime) {
        return res.status(400).json({
          success: false,
          message: "startDate and pickupTime are required to reschedule.",
        });
      }

      const isAdmin = req.user?.role === "ADMIN";
      const updated = await cabBookingService.rescheduleBooking(
        bookingId,
        new Date(startDate),
        pickupTime,
        req.userId!,
        isAdmin
      );

      res.status(200).json({ success: true, message: "Booking rescheduled successfully.", data: updated });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to reschedule booking",
      });
    }
  }

  // LIVE Pricing calculation request
  async getLivePrice(req: AuthRequest, res: Response) {
    try {
      const { pickupLocationId, dropLocationId, carCategoryId, wheelchair, medicalSupport } = req.query;

      if (!pickupLocationId || !dropLocationId || !carCategoryId) {
        return res.status(400).json({
          success: false,
          message: "pickupLocationId, dropLocationId, and carCategoryId are required.",
        });
      }

      const pricing = await cabBookingService.calculatePrice(
        pickupLocationId as string,
        dropLocationId as string,
        carCategoryId as string,
        wheelchair === "true",
        medicalSupport === "true"
      );

      res.status(200).json({ success: true, data: pricing });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to calculate route price",
      });
    }
  }

  // ──────────────────────────────────────────────
  // CAB LOCATIONS ADMIN APIs
  // ──────────────────────────────────────────────
  async getLocations(req: AuthRequest, res: Response) {
    try {
      const onlyActive = req.user?.role !== "ADMIN";
      const locations = await cabBookingService.getLocations(onlyActive);
      res.status(200).json({ success: true, data: locations });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async createLocation(req: AuthRequest, res: Response) {
    try {
      const location = await cabBookingService.createLocation(req.body);
      res.status(201).json({ success: true, data: location });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateLocation(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const location = await cabBookingService.updateLocation(id, req.body);
      res.status(200).json({ success: true, data: location });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteLocation(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await cabBookingService.deleteLocation(id);
      res.status(200).json({ success: true, message: "Location deleted successfully." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ──────────────────────────────────────────────
  // CAB CATEGORIES ADMIN APIs
  // ──────────────────────────────────────────────
  async getCategories(req: AuthRequest, res: Response) {
    try {
      const onlyActive = req.user?.role !== "ADMIN";
      const categories = await cabBookingService.getCategories(onlyActive);
      res.status(200).json({ success: true, data: categories });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async createCategory(req: AuthRequest, res: Response) {
    try {
      const category = await cabBookingService.createCategory(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateCategory(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const category = await cabBookingService.updateCategory(id, req.body);
      res.status(200).json({ success: true, data: category });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteCategory(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await cabBookingService.deleteCategory(id);
      res.status(200).json({ success: true, message: "Category deleted successfully." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ──────────────────────────────────────────────
  // ROUTE PRICING ADMIN APIs
  // ──────────────────────────────────────────────
  async getPrices(req: AuthRequest, res: Response) {
    try {
      const prices = await cabBookingService.getPrices();
      res.status(200).json({ success: true, data: prices });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async createPrice(req: AuthRequest, res: Response) {
    try {
      const price = await cabBookingService.createPrice(req.body);
      res.status(201).json({ success: true, data: price });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updatePrice(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const price = await cabBookingService.updatePrice(id, req.body);
      res.status(200).json({ success: true, data: price });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deletePrice(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await cabBookingService.deletePrice(id);
      res.status(200).json({ success: true, message: "Pricing configuration deleted successfully." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ──────────────────────────────────────────────
  // TAX CONFIG ADMIN APIs
  // ──────────────────────────────────────────────
  async getTax(req: AuthRequest, res: Response) {
    try {
      const tax = await cabBookingService.getTaxPercent();
      res.status(200).json({ success: true, data: tax });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateTax(req: AuthRequest, res: Response) {
    try {
      const { taxPercent } = req.body;
      if (taxPercent === undefined || taxPercent === null || typeof taxPercent !== "number") {
        return res.status(400).json({ success: false, message: "taxPercent must be a number." });
      }
      const updatedTax = await cabBookingService.updateTaxPercent(taxPercent, req.userId!);
      res.status(200).json({ success: true, data: updatedTax });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ──────────────────────────────────────────────
  // ADDITIONAL CHARGES ADMIN APIs
  // ──────────────────────────────────────────────
  async getAdditionalCharges(req: AuthRequest, res: Response) {
    try {
      const charges = await cabBookingService.getAdditionalCharges();
      res.status(200).json({ success: true, data: charges });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateAdditionalCharges(req: AuthRequest, res: Response) {
    try {
      const { wheelchairCharge, medicalSupportCharge } = req.body;
      if (
        wheelchairCharge === undefined ||
        medicalSupportCharge === undefined ||
        typeof wheelchairCharge !== "number" ||
        typeof medicalSupportCharge !== "number"
      ) {
        return res.status(400).json({
          success: false,
          message: "wheelchairCharge and medicalSupportCharge must be numbers.",
        });
      }
      const updated = await cabBookingService.updateAdditionalCharges(
        wheelchairCharge,
        medicalSupportCharge,
        req.userId!
      );
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Confirm payment & mark completed by admin
  async confirmPayment(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.params;
      const booking = await CabBooking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      booking.paymentStatus = "COMPLETED";
      booking.status = "CONFIRMED";
      booking.isRescheduled = false;
      await booking.save();

      res.status(200).json({
        success: true,
        message: "Payment confirmed successfully. Admin can mark as completed when ride finishes.",
        data: booking,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Failed to confirm payment" });
    }
  }
}

export const cabBookingController = new CabBookingController();
