import { IBooking } from "../models/Booking";
import { computePlatformSplit } from "../utils/platformEarnings";

/**
 * Sets guideEarning / adminCommission when payment is fully settled (GUIDE bookings only).
 * Clears to 0 when payment is not complete or booking is not a guide tour.
 */
export function applyPlatformSplitToBooking(booking: IBooking): void {
  if (booking.bookingType !== "GUIDE" || !booking.guideId) {
    booking.guideEarning = 0;
    booking.adminCommission = 0;
    return;
  }

  if (booking.paymentStatus !== "COMPLETED") {
    booking.guideEarning = 0;
    booking.adminCommission = 0;
    return;
  }

  const originalPrice = booking.originalPrice ?? booking.totalPrice ?? 0;
  const discount = booking.discount ?? 0;
  
  const { guideEarning, adminCommission } = computePlatformSplit(originalPrice, discount);
  booking.guideEarning = guideEarning;
  booking.adminCommission = adminCommission;
}
