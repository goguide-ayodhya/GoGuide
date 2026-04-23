export type BookingPaymentMode = "FULL" | "PARTIAL" | "COD" | "REMAINING";

const FULL_PAYMENT_DISCOUNT_RATE = 0.1;
const PARTIAL_PAYMENT_DISCOUNT_RATE = 0.05;

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeFullPaymentDiscount(originalPrice: number): {
  discount: number;
  finalPrice: number;
} {
  const discount = roundMoney(originalPrice * FULL_PAYMENT_DISCOUNT_RATE);
  return {
    discount,
    finalPrice: roundMoney(originalPrice - discount),
  };
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
} {
  const { originalPrice, paidAmount, mode } = params;
  if (mode === "COD") {
    const finalPrice = originalPrice;
    return {
      discount: 0,
      finalPrice,
      remainingAmount: roundMoney(finalPrice - paidAmount),
      partialDiscountApplied: false,
    };
  }

  if (mode === "PARTIAL") {
    // Apply a one-time partial discount of 5% on original price.
    const discount = roundMoney(originalPrice * PARTIAL_PAYMENT_DISCOUNT_RATE);
    const finalPrice = roundMoney(originalPrice - discount);
    return {
      discount,
      finalPrice,
      remainingAmount: roundMoney(finalPrice - paidAmount),
      partialDiscountApplied: true,
    };
  }

  // FULL
  const { discount, finalPrice } = computeFullPaymentDiscount(originalPrice);
  return {
    discount,
    finalPrice,
    remainingAmount: roundMoney(finalPrice - paidAmount),
    partialDiscountApplied: false,
  };
}

export function advanceAmountForPartial(finalPrice: number): number {
  return roundMoney(finalPrice * 0.3);
}
