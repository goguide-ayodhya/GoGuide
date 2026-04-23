/**
 * Consistent payment status copy across tourist, guide, and admin UIs.
 */
export type PaymentStatusFields = {
  paymentStatus?: string;
  paidAmount?: number;
  paymentType?: string;
};

export function getPaymentStatusLabel(b: PaymentStatusFields): string {
  if (b.paymentStatus === "FAILED") {
    return "FAILED";
  }
  if (b.paymentStatus === "COMPLETED") {
    return "COMPLETED";
  }
  const paid = b.paidAmount ?? 0;
  const remaining = (b as any).remainingAmount ?? 0;
  if (paid > 0 && remaining > 0.01) {
    return "PARTIAL";
  }
  if (paid > 0) {
    return "PARTIAL";
  }
  if (b.paymentType === "COD") {
    return "PENDING (COD)";
  }
  return "PENDING";
}

export function formatPaymentAmounts(booking: {
  paidAmount?: number;
  remainingAmount?: number;
  discount?: number;
  finalPrice?: number;
  originalPrice?: number;
  totalPrice?: number;
}) {
  const paid = booking.paidAmount ?? 0;
  const remaining =
    booking.remainingAmount ??
    Math.max(
      0,
      (booking.finalPrice ?? booking.totalPrice ?? 0) - paid,
    );
  const discount = booking.discount ?? 0;
  const finalPrice = booking.finalPrice ?? booking.totalPrice ?? 0;
  const original = booking.originalPrice ?? booking.totalPrice ?? finalPrice;

  return {
    paid,
    remaining,
    discountSaved: discount > 0 ? discount : null,
    finalPrice,
    originalPrice: original,
  };
}
