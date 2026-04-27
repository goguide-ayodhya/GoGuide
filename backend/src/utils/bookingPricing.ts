export type BookingPaymentMode = "FULL" | "PARTIAL" | "COD" | "REMAINING";

const GST_RATE = 0.05; // 5% GST
const PARTIAL_DISCOUNT_RATE = 0.05; // 5% discount for partial payments

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
  discountPercent?: number; // Optional override, defaults to 5% for partial
  gstPercent?: number; // Optional override, defaults to 5%
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
}): {
  discount: number;
  finalPrice: number;
  remainingAmount: number;
  partialDiscountApplied: boolean;
  gstAmount: number;
} {
  const { originalPrice, paidAmount, mode } = params;

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

  // FULL payment: no discount
  const pricing = calculateFinalPrice({
    totalPrice: originalPrice,
    discountPercent: 0, // No discount for full payment upfront
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
