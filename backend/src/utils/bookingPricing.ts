import { PRICING_CONFIG } from "../config/pricing";

export type BookingPaymentMode = "FULL" | "PARTIAL" | "COD" | "REMAINING" | "CARD";

const GST_RATE = PRICING_CONFIG.GST_RATE; // 0% GST
export const PARTIAL_DISCOUNT_RATE = 0.05; // 5% discount for partial payments

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * CENTRALIZED PRICING FUNCTION
 * Calculate final price with discount and GST applied correctly
 * finalPrice = totalPrice - discount + GST
 * GST is applied AFTER discount
 */
export function calculateFinalPrice(params: {
  totalPrice: number;
  discountPercent?: number; // Optional override, defaults to 0% for partial
  gstPercent?: number; // Optional override, defaults to 0%
  paymentMode?: BookingPaymentMode;
}): {
  totalPrice: number;
  discount: number;
  gstAmount: number;
  finalPrice: number;
} {
  const { totalPrice, paymentMode } = params;
  const discountPercent = params.discountPercent ?? (paymentMode === "PARTIAL" ? PARTIAL_DISCOUNT_RATE : 0);
  const gstPercent = params.gstPercent ?? GST_RATE;

  // Round total price to 2 decimal places
  const roundedTotalPrice = roundMoney(totalPrice);

  // Calculate discount
  const discount = roundMoney(roundedTotalPrice * discountPercent);

  // Calculate price after discount
  const priceAfterDiscount = roundMoney(roundedTotalPrice - discount);

  // Calculate GST on price after discount
  const gstAmount = roundMoney(priceAfterDiscount * gstPercent);

  // Final price = price after discount + GST
  const finalPrice = roundMoney(priceAfterDiscount + gstAmount);

  return {
    totalPrice: roundedTotalPrice,
    discount,
    gstAmount,
    finalPrice,
  };
}

export function computeGst(amount: number): number {
  return roundMoney(amount * GST_RATE);
}

/**
 * Applies payment mode to pricing fields. `originalPrice` is the quoted list price (booking.totalPrice at creation).
 */
export function applyPaymentModePricing(params: {
  originalPrice: number;
  paidAmount: number;
  mode: BookingPaymentMode;
  partialDiscountApplied: boolean;
  fullPaymentDiscountEligible?: boolean; // For GUIDE bookings: only apply full-payment discount if true
}): {
  discount: number;
  finalPrice: number;
  remainingAmount: number;
  partialDiscountApplied: boolean;
  gstAmount: number;
} {
  const { originalPrice, paidAmount, mode, fullPaymentDiscountEligible = true } = params;

  if (mode === "COD") {
    // COD: no discount, but GST still applies
    const pricing = calculateFinalPrice({
      totalPrice: originalPrice,
      discountPercent: 0, // No discount for COD
      paymentMode: mode,
    });
    return {
      discount: pricing.discount,
      finalPrice: pricing.finalPrice,
      remainingAmount: roundMoney(pricing.finalPrice - paidAmount),
      partialDiscountApplied: false,
      gstAmount: pricing.gstAmount,
    };
  }

  if (mode === "PARTIAL") {
    // Partial payment: 5% discount applies
    const pricing = calculateFinalPrice({
      totalPrice: originalPrice,
      paymentMode: mode, // Uses default 5% discount
    });
    return {
      discount: pricing.discount,
      finalPrice: pricing.finalPrice,
      remainingAmount: roundMoney(pricing.finalPrice - paidAmount),
      partialDiscountApplied: true,
      gstAmount: pricing.gstAmount,
    };
  }

  // FULL payment: 10% discount (only if eligible for GUIDE bookings)
  let discountPercent = 0;
  if (fullPaymentDiscountEligible) {
    discountPercent = PRICING_CONFIG.FULL_PAYMENT_DISCOUNT_RATE;
  }
  
  const pricing = calculateFinalPrice({
    totalPrice: originalPrice,
    discountPercent,
    paymentMode: mode,
  });
  return {
    discount: pricing.discount,
    finalPrice: pricing.finalPrice,
    remainingAmount: roundMoney(pricing.finalPrice - paidAmount),
    partialDiscountApplied: false,
    gstAmount: pricing.gstAmount,
  };
}

export function advanceAmountForPartial(finalPrice: number): number {
  return roundMoney(finalPrice * 0.3);
}

/**
 * Check if current time is within 1 hour before tour start time.
 * Returns true if discount should be disabled, false otherwise.
 */
export function isWithinOneHourBeforeTourStart(
  bookingDate: Date | string,
  startTime: string
): boolean {
  try {
    // Convert bookingDate to Date if it's a string
    const dateObj =
      typeof bookingDate === "string" ? new Date(bookingDate) : bookingDate;

    // Parse startTime - handle both "HH:mm" and "HH:mm AM/PM" formats
    let hours = 0;
    let minutes = 0;

    const timeStr = startTime.trim().toUpperCase();
    const isAfternoon = timeStr.includes("PM");
    const isMorning = timeStr.includes("AM");
    const cleanTime = timeStr.replace(/\s*(AM|PM)\s*$/i, "").trim();

    // Parse HH:mm
    const timeParts = cleanTime.split(":");
    if (timeParts.length >= 2) {
      hours = parseInt(timeParts[0], 10);
      minutes = parseInt(timeParts[1], 10);

      // Convert to 24-hour format
      if (isAfternoon && hours !== 12) {
        hours += 12;
      } else if (isMorning && hours === 12) {
        hours = 0;
      }
    }

    // Create tour start datetime
    const tourStart = new Date(dateObj);
    tourStart.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const oneHourBefore = new Date(tourStart.getTime() - 60 * 60 * 1000);

    const isWithin = now >= oneHourBefore;

    console.log("🕐 TOUR START TIME CHECK:", {
      tourStartDatetime: tourStart.toISOString(),
      oneHourBefore: oneHourBefore.toISOString(),
      currentTime: now.toISOString(),
      isWithinOneHour: isWithin,
    });

    return isWithin;
  } catch (error) {
    console.error("⚠️ Error checking tour start time:", error);
    return false;
  }
}
