import { CabBooking, ICabBooking } from "../models/CabBooking";
import { CabLocation } from "../models/CabLocation";
import { CabCategory } from "../models/CabCategory";
import { CabRoutePricing } from "../models/CabRoutePricing";
import { AdminSettings } from "../models/AdminSettings";

// Utility function to parse date and time string into a Date object
export const parseDateTime = (dateVal: string | Date, timeStr: string): Date => {
  const date = new Date(dateVal);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  let hours = 0;
  let minutes = 0;

  const cleanTime = timeStr.trim().toLowerCase();
  const ampmMatch = cleanTime.match(/^(\d+):(\d+)\s*(am|pm)$/);
  if (ampmMatch) {
    hours = parseInt(ampmMatch[1], 10);
    minutes = parseInt(ampmMatch[2], 10);
    const ampm = ampmMatch[3];
    if (ampm === "pm" && hours < 12) {
      hours += 12;
    } else if (ampm === "am" && hours === 12) {
      hours = 0;
    }
  } else {
    const normalMatch = cleanTime.match(/^(\d+):(\d+)$/);
    if (normalMatch) {
      hours = parseInt(normalMatch[1], 10);
      minutes = parseInt(normalMatch[2], 10);
    }
  }

  return new Date(year, month, day, hours, minutes);
};

export class CabBookingService {
  async createBooking(data: Partial<ICabBooking>): Promise<ICabBooking> {
    const booking = await CabBooking.create(data);
    try {
      if (booking.userId) {
        const { NotificationService } = require("./notification.service");
        await NotificationService.sendNotification(
          booking.userId.toString(),
          "Cab Booking Created",
          `Your cab booking has been successfully created. Booking ID: ${booking._id}`,
          {
            type: "CAB_BOOKING_CREATED",
            bookingId: booking._id.toString(),
          }
        );
      }
    } catch (notifyErr) {
      console.warn("[CAB_BOOKING] Failed to send creation notification (non-blocking):", notifyErr);
    }
    return booking;
  }

  async getBookingsByUser(userId: string): Promise<ICabBooking[]> {
    return await CabBooking.find({ userId }).sort({ createdAt: -1 });
  }

  async getAllBookings(): Promise<ICabBooking[]> {
    return await CabBooking.find({})
      .populate("userId", "name email phone")
      .sort({ updatedAt: -1 });
  }

  async getBookingById(id: string): Promise<ICabBooking | null> {
    return await CabBooking.findById(id).populate("userId", "name email phone");
  }

  async updateStatus(id: string, status: string): Promise<ICabBooking | null> {
    const existing = await CabBooking.findById(id);
    if (!existing) {
      throw new Error("Cab booking not found");
    }

    if (status === "COMPLETED" && existing.paymentStatus !== "COMPLETED") {
      throw new Error("Cannot mark cab booking as completed until payment is completed.");
    }

    const updateData: any = { status };
    if (status === "CONFIRMED" || status === "CANCELLED" || status === "COMPLETED") {
      updateData.isRescheduled = false;
    }
    const updated = await CabBooking.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("userId", "name email phone");

    if (updated) {
      try {
        if (updated.userId) {
          const { NotificationService } = require("./notification.service");
          const statusMsgs: Record<string, { title: string; body: string }> = {
            CONFIRMED: {
              title: "Cab Booking Confirmed ✅",
              body: `Your cab booking (ID: ${updated._id}) has been confirmed.`,
            },
            CANCELLED: {
              title: "Cab Booking Cancelled ❌",
              body: `Your cab booking (ID: ${updated._id}) has been cancelled.`,
            },
            COMPLETED: {
              title: "Cab Booking Completed 🎉",
              body: `Your cab booking (ID: ${updated._id}) has been successfully completed.`,
            },
          };
          const msg = statusMsgs[status];
          if (msg) {
            await NotificationService.sendNotification(
              (updated.userId._id || updated.userId).toString(),
              msg.title,
              msg.body,
              {
                type: `CAB_BOOKING_${status}`,
                bookingId: updated._id.toString(),
              }
            );
          }
        }
      } catch (notifyErr) {
        console.warn("[CAB_BOOKING] Failed to send status update notification (non-blocking):", notifyErr);
      }
    }

    return updated;
  }

  // ──────────────────────────────────────────────
  // CAB LOCATIONS
  // ──────────────────────────────────────────────
  async getLocations(onlyActive = false) {
    const query = onlyActive ? { isActive: true } : {};
    return await CabLocation.find(query).sort({ name: 1 });
  }

  async createLocation(data: { name: string; type: "pickup" | "dropoff" | "both"; isActive?: boolean }) {
    return await CabLocation.create(data);
  }

  async updateLocation(id: string, data: any) {
    return await CabLocation.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteLocation(id: string) {
    return await CabLocation.findByIdAndDelete(id);
  }

  // ──────────────────────────────────────────────
  // CAB CATEGORIES
  // ──────────────────────────────────────────────
  async getCategories(onlyActive = false) {
    const query = onlyActive ? { isActive: true } : {};
    return await CabCategory.find(query).sort({ name: 1 });
  }

  async createCategory(data: { name: string; isActive?: boolean }) {
    return await CabCategory.create(data);
  }

  async updateCategory(id: string, data: any) {
    return await CabCategory.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteCategory(id: string) {
    return await CabCategory.findByIdAndDelete(id);
  }

  // ──────────────────────────────────────────────
  // ROUTE PRICING
  // ──────────────────────────────────────────────
  async getPrices() {
    return await CabRoutePricing.find({})
      .populate("pickupLocation", "name isActive type")
      .populate("dropLocation", "name isActive type")
      .populate("carCategory", "name isActive")
      .sort({ createdAt: -1 });
  }

  async createPrice(data: { pickupLocation: string; dropLocation: string; carCategory: string; basePrice: number; notes?: string; isActive?: boolean }) {
    return await CabRoutePricing.create(data);
  }

  async updatePrice(id: string, data: any) {
    return await CabRoutePricing.findByIdAndUpdate(id, data, { new: true });
  }

  async deletePrice(id: string) {
    return await CabRoutePricing.findByIdAndDelete(id);
  }

  // ──────────────────────────────────────────────
  // TAX CONFIG
  // ──────────────────────────────────────────────
  async getTaxPercent(): Promise<number> {
    const settings = await AdminSettings.findOne({});
    return settings?.cabBookingTaxPercent ?? 5;
  }

  async updateTaxPercent(taxPercent: number, adminId: string) {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = await AdminSettings.create({
        driverCommissionPercent: 20,
        cabBookingTaxPercent: taxPercent,
        lastUpdatedBy: adminId,
        lastUpdatedAt: new Date(),
      });
    } else {
      settings.cabBookingTaxPercent = taxPercent;
      settings.lastUpdatedBy = adminId;
      settings.lastUpdatedAt = new Date();
      await settings.save();
    }
    return settings.cabBookingTaxPercent;
  }

  // ──────────────────────────────────────────────
  // ADDITIONAL CHARGES CONFIG
  // ──────────────────────────────────────────────
  async getAdditionalCharges() {
    const settings = await AdminSettings.findOne({});
    return {
      wheelchairCharge: settings?.cabWheelchairCharge ?? 0,
      medicalSupportCharge: settings?.cabMedicalSupportCharge ?? 0,
    };
  }

  async updateAdditionalCharges(wheelchairCharge: number, medicalSupportCharge: number, adminId: string) {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = await AdminSettings.create({
        driverCommissionPercent: 20,
        cabBookingTaxPercent: 5,
        cabWheelchairCharge: wheelchairCharge,
        cabMedicalSupportCharge: medicalSupportCharge,
        lastUpdatedBy: adminId,
        lastUpdatedAt: new Date(),
      });
    } else {
      settings.cabWheelchairCharge = wheelchairCharge;
      settings.cabMedicalSupportCharge = medicalSupportCharge;
      settings.lastUpdatedBy = adminId;
      settings.lastUpdatedAt = new Date();
      await settings.save();
    }
    return {
      wheelchairCharge: settings.cabWheelchairCharge,
      medicalSupportCharge: settings.cabMedicalSupportCharge,
    };
  }

  // ──────────────────────────────────────────────
  // DYNAMIC PRICING CALCULATION
  // ──────────────────────────────────────────────
  async calculatePrice(
    pickupLocationId: string,
    dropLocationId: string,
    carCategoryId: string,
    wheelchair = false,
    medicalSupport = false
  ) {
    const pricing = await CabRoutePricing.findOne({
      pickupLocation: pickupLocationId,
      dropLocation: dropLocationId,
      carCategory: carCategoryId,
      isActive: true,
    });

    if (!pricing) {
      throw new Error("No active pricing route configured for selected locations and vehicle category.");
    }

    const settings = await AdminSettings.findOne({});
    const taxPercent = settings?.cabBookingTaxPercent ?? 5;
    const wheelchairRate = settings?.cabWheelchairCharge ?? 0;
    const medicalRate = settings?.cabMedicalSupportCharge ?? 0;

    const price = pricing.basePrice;
    const tax = Math.round(price * (taxPercent / 100) * 100) / 100;
    const wheelchairCharge = wheelchair ? wheelchairRate : 0;
    const medicalSupportCharge = medicalSupport ? medicalRate : 0;
    const totalAmount = price + tax + wheelchairCharge + medicalSupportCharge;

    return {
      price,
      tax,
      wheelchairCharge,
      medicalSupportCharge,
      totalAmount,
      taxPercent,
      notes: pricing.notes,
    };
  }

  // ──────────────────────────────────────────────
  // RESCHEDULE BOOKING
  // ──────────────────────────────────────────────
  async rescheduleBooking(bookingId: string, startDate: Date, pickupTime: string, userId: string, isAdmin = false) {
    const booking = await CabBooking.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (!isAdmin && booking.userId?.toString() !== userId) {
      throw new Error("Not authorized to reschedule this booking");
    }

    const now = new Date();

    // 1. Validate that the current booking pickup time is more than 1 hour away
    const currentPickupDateTime = parseDateTime(booking.startDate, booking.pickupTime);
    if (!isAdmin && currentPickupDateTime.getTime() - now.getTime() < 60 * 60 * 1000) {
      throw new Error("Cab bookings cannot be cancelled or rescheduled within 1 hour of pickup time.");
    }

    // 2. Validate that the new pickup time is at least 1 hour in advance from the current time
    const newPickupDateTime = parseDateTime(startDate, pickupTime);
    if (newPickupDateTime.getTime() - now.getTime() < 60 * 60 * 1000) {
      throw new Error("Cab bookings must be rescheduled to a time at least 1 hour in advance.");
    }

    booking.startDate = startDate;
    booking.pickupTime = pickupTime;
    booking.status = "PENDING";
    booking.isRescheduled = true;
    const updated = await booking.save();

    try {
      if (updated.userId) {
        const { NotificationService } = require("./notification.service");
        const formattedDate = new Date(startDate).toDateString();
        await NotificationService.sendNotification(
          updated.userId.toString(),
          "Cab Booking Rescheduled 📅",
          `Your cab booking (ID: ${updated._id}) has been rescheduled to ${formattedDate} at ${pickupTime}.`,
          {
            type: "CAB_BOOKING_RESCHEDULED",
            bookingId: updated._id.toString(),
            startDate: startDate.toString(),
            pickupTime: pickupTime,
          }
        );
      }
    } catch (notifyErr) {
      console.warn("[CAB_BOOKING] Failed to send rescheduling notification (non-blocking):", notifyErr);
    }

    return updated;
  }
}

export const cabBookingService = new CabBookingService();
