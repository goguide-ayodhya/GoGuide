/**
 * Self-check script for payment business rules (no DB).
 * Run: npx ts-node --transpile-only scripts/payment-scenarios.selfcheck.ts
 */
import { strict as assert } from "assert";

function wouldRejectCodComplete(booking: {
  paymentType?: string;
  paymentStatus?: string;
}): string | null {
  if (booking.paymentStatus === "COMPLETED") {
    return "already_completed";
  }
  if (booking.paymentType !== "COD") {
    return "not_cod";
  }
  return null;
}

function wouldRejectDuplicateRazorpay(
  existingCompletedPaymentId: string | null,
  incomingPaymentId: string,
): boolean {
  return (
    existingCompletedPaymentId !== null &&
    existingCompletedPaymentId === incomingPaymentId
  );
}

function wouldRejectOverpay(paidAfter: number, finalPrice: number): boolean {
  return paidAfter > finalPrice + 0.01;
}

// —— COD completion ——
assert.strictEqual(
  wouldRejectCodComplete({ paymentType: "COD", paymentStatus: "PENDING" }),
  null,
);
assert.strictEqual(
  wouldRejectCodComplete({ paymentType: "COD", paymentStatus: "COMPLETED" }),
  "already_completed",
);
assert.strictEqual(
  wouldRejectCodComplete({ paymentType: "FULL", paymentStatus: "PENDING" }),
  "not_cod",
);

// —— Duplicate Razorpay id ——
assert.strictEqual(wouldRejectDuplicateRazorpay("pay_1", "pay_1"), true);
assert.strictEqual(wouldRejectDuplicateRazorpay(null, "pay_1"), false);

// —— Overpay ——
assert.strictEqual(wouldRejectOverpay(1000, 500), true);
assert.strictEqual(wouldRejectOverpay(500, 500), false);

console.log("payment-scenarios.selfcheck: all assertions passed.");
