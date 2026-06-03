import { Payment, IPayment } from "../models/Payment";
import { Booking, IBooking, PaymentType } from "../models/Booking";
import { User } from "../models/User";
import { Guide } from "../models/Guide";
import { Driver } from "../models/Driver";
import { NotFound, BadRequest, Unauthorized } from "../utils/httpException";
import { NotificationService } from "./notification.service";
import {
  advanceAmountForPartial,
  applyPaymentModePricing,
  calculateFinalPrice,
  roundMoney,
  PARTIAL_DISCOUNT_RATE,
} from "../utils/bookingPricing";
import {
  createRazorpayOrder,
  getRazorpayClient,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "./razorpay.service";
import { applyPlatformSplitToBooking } from "./bookingCommission.service";
import { PaymentWebhookEvent } from "../models/PaymentWebhookEvent";
import { Refund } from "../models/Refund";
import { financialAuditService } from "./financialAudit.service";
import { FinancialAuditLog } from "../models/FinancialAuditLog";
import mongoose from "mongoose";
import { Session } from "inspector/promises";

import { PRICING_CONFIG } from "../config/pricing";

function effectiveLineAmount(p: IPayment): number {
  return roundMoney(p.amount || 0);
}

function getProviderShareForPayment(p: any): number {
  const lineAmt = effectiveLineAmount(p);
  if (!p.bookingId || typeof p.bookingId === "string") {
    // If booking is not populated, fallback to estimated proportion based on PRICING_CONFIG
    // We assume the payment amount includes GST (roughly +0%). So base = lineAmt / (1 + PRICING_CONFIG.GST_RATE).
    const base = lineAmt / (1 + PRICING_CONFIG.GST_RATE);
    return base * PRICING_CONFIG.GUIDE_PAYOUT_RATE;
  }
  
  const booking = p.bookingId;
  const finalPrice = booking.finalPrice || booking.totalPrice;
  if (!finalPrice) return 0;
  
  if (booking.guideEarning && booking.guideEarning > 0) {
    return (lineAmt / finalPrice) * booking.guideEarning;
  }
  
  const gst = booking.gstAmount || 0;
  const basePrice = finalPrice - gst;
  const ratio = basePrice / finalPrice;
  return lineAmt * ratio * PRICING_CONFIG.GUIDE_PAYOUT_RATE;
}

type RazorpayPaymentEntity = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status?: string;
  error_description?: string;
};

type RazorpayRefundEntity = {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  status?: string;
  notes?: Record<string, string>;
};

export class PaymentService {
  [x: string]: any;
  private async getActorRole(userId: string): Promise<string | undefined> {
    const user = await User.findById(userId).select("role").lean();
    return user?.role;
  }

  private async applySuccessfulCharge(
    payment: IPayment,
    razorpayPaymentId: string,
    meta?: { source?: "checkout" | "webhook" },
  ) {
    const session = await mongoose.startSession();
    let bookingIdForAudit = payment.bookingId.toString();
    let paymentIdForAudit = payment._id.toString();
    let lineAmountForAudit = 0;
    try {
      await session.withTransaction(async () => {
        const freshPayment = await Payment.findById(payment._id).session(
          session,
        );
        if (!freshPayment) {
          throw new NotFound("Payment not found");
        }

        // Idempotent success path: same payment already settled.
        if (
          freshPayment.status === "COMPLETED" &&
          freshPayment.razorpayPaymentId === razorpayPaymentId
        ) {
          return;
        }

        if (freshPayment.status === "COMPLETED") {
          throw new BadRequest(
            "Payment already completed with another transaction",
          );
        }

        const booking = await Booking.findById(freshPayment.bookingId).session(
          session,
        );
        if (!booking) {
          throw new NotFound("Booking not found");
        }

        const lineAmount = effectiveLineAmount(freshPayment);
        lineAmountForAudit = lineAmount;
        const finalPrice = booking.finalPrice ?? booking.totalPrice;
        const paidBefore = booking.paidAmount ?? 0;
        if (paidBefore + lineAmount > finalPrice + 0.01) {
          throw new BadRequest("This payment would overpay the booking");
        }

        freshPayment.status = "COMPLETED";
        freshPayment.transactionId = razorpayPaymentId;
        freshPayment.razorpayPaymentId = razorpayPaymentId;
        freshPayment.paymentMethod = "RAZORPAY";
        freshPayment.paidAt = new Date();
        freshPayment.failureReason = undefined;
        await freshPayment.save({ session });

        const paidAfter = roundMoney(paidBefore + lineAmount);
        const remainingAfter = roundMoney(finalPrice - paidAfter);

        booking.paidAmount = paidAfter;
        booking.remainingAmount = Math.max(0, remainingAfter);
        booking.paymentStatus =
          remainingAfter <= 0.01
            ? "COMPLETED"
            : paidAfter > 0
              ? "PARTIAL"
              : "PENDING";
        applyPlatformSplitToBooking(booking);
        await booking.save({ session });

        bookingIdForAudit = booking._id.toString();
        paymentIdForAudit = freshPayment._id.toString();
      });
    } finally {
      await session.endSession();
    }

    try {
      await NotificationService.sendPaymentSuccess(payment._id.toString());
    } catch (error) {
      console.warn(
        `Notification send failed (non-blocking, ${meta?.source ?? "unknown"}):`,
        error,
      );
    }

    await financialAuditService.log({
      action: "PAYMENT_COMPLETED",
      bookingId: bookingIdForAudit,
      paymentId: paymentIdForAudit,
      metadata: {
        razorpayPaymentId,
        source: meta?.source ?? "unknown",
        amount: lineAmountForAudit,
      },
    });

    return Payment.findById(payment._id).session(session).populate("bookingId");
  }

  private async handleRefundWebhook(
    refundEntity: RazorpayRefundEntity,
    ok: boolean,
  ) {
    const payment = await Payment.findOne({
      razorpayPaymentId: refundEntity.payment_id,
      status: "COMPLETED",
    });
    if (!payment) {
      throw new NotFound("Payment for refund webhook not found");
    }

    let refund = await Refund.findOne({ razorpayRefundId: refundEntity.id });
    if (!refund) {
      refund = await Refund.create({
        paymentId: payment._id,
        bookingId: payment.bookingId,
        userId: payment.userId,
        amount: roundMoney(Number(refundEntity.amount) / 100),
        status: ok ? "PROCESSED" : "FAILED",
        razorpayRefundId: refundEntity.id,
        razorpayPaymentId: refundEntity.payment_id,
        processedAt: ok ? new Date() : undefined,
        failureReason: ok ? undefined : "Refund failed at gateway",
      });
    } else if (refund.status !== "PROCESSED" || !ok) {
      refund.status = ok ? "PROCESSED" : "FAILED";
      refund.processedAt = ok ? new Date() : refund.processedAt;
      if (!ok) {
        refund.failureReason =
          refund.failureReason || "Refund failed at gateway";
      }
      await refund.save();
    }

    if (!ok) {
      await financialAuditService.log({
        action: "REFUND_FAILED",
        bookingId: payment.bookingId.toString(),
        paymentId: payment._id.toString(),
        refundId: refund._id.toString(),
        metadata: {
          razorpayRefundId: refundEntity.id,
          razorpayPaymentId: refundEntity.payment_id,
        },
      });
      return { handled: true, refundFailed: true };
    }

    const refundedAmount = roundMoney(Number(refundEntity.amount) / 100);
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const freshPayment = await Payment.findById(payment._id).session(
          session,
        );
        if (!freshPayment) {
          throw new NotFound("Payment not found");
        }

        const alreadyRefunded = roundMoney(freshPayment.refundedAmount ?? 0);
        const newRefunded = roundMoney(alreadyRefunded + refundedAmount);
        const chargedAmount = roundMoney(effectiveLineAmount(freshPayment));
        if (newRefunded > chargedAmount + 0.01) {
          throw new BadRequest("Refund exceeds captured amount");
        }

        freshPayment.refundedAmount = newRefunded;
        freshPayment.lastRefundedAt = new Date();
        await freshPayment.save({ session });

        const booking = await Booking.findById(freshPayment.bookingId).session(
          session,
        );
        if (booking) {
          const finalPrice = booking.finalPrice ?? booking.totalPrice;
          const paidAmount = roundMoney(
            Math.max(0, (booking.paidAmount ?? 0) - refundedAmount),
          );
          booking.paidAmount = paidAmount;
          booking.remainingAmount = roundMoney(
            Math.max(0, finalPrice - paidAmount),
          );
          booking.paymentStatus =
            booking.remainingAmount <= 0.01
              ? "COMPLETED"
              : paidAmount > 0
                ? "PARTIAL"
                : "PENDING";
          applyPlatformSplitToBooking(booking);
          await booking.save({ session });
        }
      });
    } finally {
      await session.endSession();
    }

    await financialAuditService.log({
      action: "REFUND_PROCESSED",
      bookingId: payment.bookingId.toString(),
      paymentId: payment._id.toString(),
      refundId: refund._id.toString(),
      metadata: {
        amount: refundedAmount,
        razorpayRefundId: refundEntity.id,
      },
    });

    return { handled: true, refundProcessed: true };
  }

  async processRazorpayWebhookEvent(
    event: any,
    rawBody: Buffer,
    signature: string,
  ) {
    // Verify webhook signature first
    const isValidSignature = verifyWebhookSignature(rawBody, signature);
    if (!isValidSignature) {
      throw new BadRequest("Invalid webhook signature");
    }

    const eventId = event?.id;
    const eventType = event?.event as string | undefined;
    const paymentEntity = event?.payload?.payment?.entity as
      | RazorpayPaymentEntity
      | undefined;

    if (!eventId || !eventType) {
      throw new BadRequest("Invalid webhook event");
    }

    try {
      const already = await PaymentWebhookEvent.findOne({ eventId: event.id });
      if (already) return;

      await PaymentWebhookEvent.create({
        eventId: event.id,
        eventType: event.event,
        paymentId: event.payload?.payment?.entity?.id,
        orderId: event.payload?.payment?.entity?.order_id,
      });
    } catch (err: any) {
      // Duplicate event replay: safely ignore.
      if (err?.code === 11000) {
        return {
          handled: true,
          duplicate: true,
          eventId: event.id,
          eventType: event.event,
        };
      }
      throw err;
    }

    if (
      ![
        "payment.captured",
        "payment.failed",
        "refund.processed",
        "refund.failed",
      ].includes(eventType)
    ) {
      return {
        handled: false,
        ignored: true,
        eventId: event.id,
        eventType: event.event,
      };
    }

    if (eventType === "refund.processed" || eventType === "refund.failed") {
      const refundEntity = event?.payload?.refund?.entity as
        | RazorpayRefundEntity
        | undefined;
      if (!refundEntity?.payment_id || !refundEntity?.id) {
        throw new BadRequest("Webhook refund payload is incomplete");
      }
      if ((refundEntity.currency || "").toUpperCase() !== "INR") {
        throw new BadRequest("Invalid refund currency");
      }
      return this.handleRefundWebhook(
        refundEntity,
        eventType === "refund.processed",
      );
    }

    if (!paymentEntity?.order_id) {
      throw new BadRequest("Webhook payment payload missing order_id");
    }

    const payment = await Payment.findOne({
      razorpayOrderId: paymentEntity.order_id,
    });
    if (!payment) {
      throw new NotFound("Payment row not found for webhook order");
    }

    if (eventType === "payment.failed") {
      if (payment.status === "COMPLETED") {
        return { handled: true, ignored: true, reason: "already_completed" };
      }
      payment.status = "FAILED";
      payment.failureReason =
        paymentEntity.error_description || "Razorpay payment failed";
      await payment.save();
      await financialAuditService.log({
        action: "PAYMENT_FAILED",
        bookingId: payment.bookingId.toString(),
        paymentId: payment._id.toString(),
        metadata: {
          source: "webhook",
          reason: payment.failureReason,
          razorpayPaymentId: paymentEntity.id,
        },
      });
      return { handled: true, failed: true, paymentId: payment._id.toString() };
    }

    const expectedPaise = Math.round(payment.amount * 100);
    if (Number(paymentEntity.amount) !== expectedPaise) {
      throw new BadRequest("Captured amount mismatch with expected amount");
    }

    if ((paymentEntity.currency || "").toUpperCase() !== "INR") {
      throw new BadRequest("Invalid captured currency");
    }

    const settled = await this.applySuccessfulCharge(
      payment,
      paymentEntity.id,
      {
        source: "webhook",
      },
    );
    return { handled: true, completed: true, data: settled };
  }

  async createPayment(userId: string, bookingId: string) {
    return this.ensureInitialPayment(userId, bookingId);
  }

  async ensureInitialPayment(userId: string, bookingId: string) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new NotFound("Booking not found");
    }

    if (booking.userId.toString() !== userId) {
      throw new Unauthorized(
        "Not authorized to create payment for this booking",
      );
    }

    if (["REJECTED", "CANCELLED", "COMPLETED"].includes(booking.status)) {
      throw new BadRequest("Cannot create payment for this booking");
    }

    const existingInitial = await Payment.findOne({
      bookingId,
      paymentKind: "INITIAL",
    });

    if (existingInitial) {
      return existingInitial.populate("bookingId");
    }

    const legacy = await Payment.findOne({ bookingId });
    if (legacy) {
      return legacy.populate("bookingId");
    }

    const initialRemainingAmount = roundMoney(
      booking.remainingAmount ?? booking.finalPrice ?? booking.totalPrice,
    );

    const payment = await Payment.create({
      bookingId,
      userId,
      guideId: booking.guideId,
      driverId: booking.driverId,

      amount: initialRemainingAmount,

      paymentKind: "INITIAL",
      status: "PENDING",
    });

    return Payment.findById(payment._id).populate("bookingId");
  }

  /**
   * Tourist selects FULL / PARTIAL / COD. Updates discount + finalPrice rules.
   */
  async setBookingPaymentMode(
    userId: string,
    bookingId: string,
    paymentType: PaymentType,
  ) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new NotFound("Booking not found");
    }

    if (booking.userId.toString() !== userId) {
      throw new Unauthorized("Not authorized");
    }

    if (booking.status !== "ACCEPTED") {
      throw new BadRequest(
        "Payment mode can only be set for accepted bookings",
      );
    }

    // If booking already has a partial payment, do not allow re-selecting FULL/PARTIAL modes.
    if (
      booking.paymentStatus === "PARTIAL" &&
      (paymentType === "FULL" || paymentType === "PARTIAL")
    ) {
      throw new BadRequest(
        "Cannot change payment mode after partial payment. Pay remaining amount instead.",
      );
    }

    const originalPrice = booking.originalPrice ?? booking.totalPrice;
    const paidAmount = booking.paidAmount ?? 0;

    if (!originalPrice || isNaN(originalPrice) || originalPrice <= 0) {
      console.log("Invalid originalPrice for payment mode setting");
      throw new BadRequest(
        "Booking has invalid pricing data - original price is missing or invalid",
      );
    }

    let pricing;
    if (booking.bookingType === "PACKAGE") {
      // CRITICAL FIX: For packages, apply payment mode discount ON TOP of package discount
      // Package discount is set during booking creation and should be preserved
      // Additional payment mode discounts (FULL/PARTIAL) apply on the package-discounted price
      const packageDiscountedPrice = roundMoney(originalPrice - (booking.discount || 0));
      
      console.log("📦 PACKAGE PAYMENT MODE PRICING:", {
        bookingId,
        originalPrice,
        packageDiscount: booking.discount,
        packageDiscountedPrice,
        paidAmount,
        paymentType,
      });
      
      // Apply payment mode discount on the package-discounted price
      if (paymentType === "FULL") {
        // FULL payment: 10% discount on package-discounted price
        const fullPaymentDiscountPercent = PRICING_CONFIG.FULL_PAYMENT_DISCOUNT_RATE;
        const fullPaymentDiscount = roundMoney(packageDiscountedPrice * fullPaymentDiscountPercent);
        const priceAfterFullDiscount = roundMoney(packageDiscountedPrice - fullPaymentDiscount);
        const gstAmount = roundMoney(priceAfterFullDiscount * PRICING_CONFIG.GST_RATE);
        const finalPrice = roundMoney(priceAfterFullDiscount + gstAmount);
        
        pricing = {
          totalPrice: originalPrice,
          discount: roundMoney(booking.discount + fullPaymentDiscount), // Total discount = package + FULL payment
          gstAmount,
          finalPrice,
          remainingAmount: roundMoney(finalPrice - paidAmount),
          partialDiscountApplied: false,
        };
        
        console.log("📦 PACKAGE FULL PAYMENT PRICING:", {
          packageDiscountedPrice,
          fullPaymentDiscountPercent,
          fullPaymentDiscount,
          priceAfterFullDiscount,
          gstAmount,
          finalPrice,
          totalDiscount: pricing.discount,
        });
      } else if (paymentType === "PARTIAL") {
        // PARTIAL payment: 5% discount on package-discounted price
        const partialDiscountPercent = PARTIAL_DISCOUNT_RATE;
        const partialDiscount = roundMoney(packageDiscountedPrice * partialDiscountPercent);
        const priceAfterPartialDiscount = roundMoney(packageDiscountedPrice - partialDiscount);
        const gstAmount = roundMoney(priceAfterPartialDiscount * PRICING_CONFIG.GST_RATE);
        const finalPrice = roundMoney(priceAfterPartialDiscount + gstAmount);
        
        pricing = {
          totalPrice: originalPrice,
          discount: roundMoney(booking.discount + partialDiscount), // Total discount = package + PARTIAL
          gstAmount,
          finalPrice,
          remainingAmount: roundMoney(finalPrice - paidAmount),
          partialDiscountApplied: true,
        };
        
        console.log("📦 PACKAGE PARTIAL PAYMENT PRICING:", {
          packageDiscountedPrice,
          partialDiscountPercent,
          partialDiscount,
          priceAfterPartialDiscount,
          gstAmount,
          finalPrice,
          totalDiscount: pricing.discount,
        });
      } else {
        // COD: No additional discount, only package discount
        const gstAmount = roundMoney(packageDiscountedPrice * PRICING_CONFIG.GST_RATE);
        const finalPrice = roundMoney(packageDiscountedPrice + gstAmount);
        
        pricing = {
          totalPrice: originalPrice,
          discount: booking.discount || 0, // Only package discount
          gstAmount,
          finalPrice,
          remainingAmount: roundMoney(finalPrice - paidAmount),
          partialDiscountApplied: false,
        };
        
        console.log("📦 PACKAGE COD PRICING:", {
          packageDiscountedPrice,
          gstAmount,
          finalPrice,
          totalDiscount: pricing.discount,
        });
      }
      
      console.log("📦 PACKAGE PAYMENT MODE FINAL PRICING:", {
        totalPrice: pricing.totalPrice,
        discount: pricing.discount,
        gstAmount: pricing.gstAmount,
        finalPrice: pricing.finalPrice,
        remainingAmount: pricing.remainingAmount,
      });
    } else {
      pricing = applyPaymentModePricing({
        originalPrice,
        paidAmount,
        mode: paymentType,
        partialDiscountApplied: booking.partialDiscountApplied ?? false,
      });
    }

    booking.originalPrice = originalPrice;
    booking.discount = pricing.discount;
    booking.gstAmount = pricing.gstAmount;
    booking.finalPrice = pricing.finalPrice;
    booking.remainingAmount = pricing.remainingAmount;
    booking.partialDiscountApplied = pricing.partialDiscountApplied;
    booking.paymentType = paymentType;

    if (paymentType === "COD") {
      booking.paymentMethod = "COD";
    } else {
      booking.paymentMethod = "RAZORPAY";
    }

    await booking.save();

    return booking;
  }

  /**
   * Creates a Razorpay order and attaches it to the correct Payment row.
   */
  async createRazorpayOrderForBooking(
    userId: string,
    bookingId: string,
    opts?: { paymentStage?: "ADVANCE" | "FULL" },
  ) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      console.log("Booking not found:", bookingId);
      throw new NotFound("Booking not found");
    }

    if (!booking.userId) {
      throw new BadRequest("Booking is invalid - no user associated");
    }

    if (booking.userId.toString() !== userId) {
      throw new Unauthorized("Not authorized to access this booking");
    }

    if (booking.status !== "ACCEPTED") {
      throw new BadRequest(
        "Booking must be accepted before payment can be initiated",
      );
    }

    // Ensure booking has pricing data
    if (typeof booking.totalPrice !== "number" || booking.totalPrice < 0) {
      throw new BadRequest("Booking has invalid total price");
    }

    if (booking.totalPrice === 0) {
      throw new BadRequest("Cannot process payment for free booking");
    }

    if (booking.paymentType === "COD") {
      throw new BadRequest("Cash on delivery does not use Razorpay");
    }

    if (!booking.paymentType) {
      throw new BadRequest("Select a payment option first");
    }

    const finalPrice = booking.finalPrice ?? booking.totalPrice;
    const paidAmount = booking.paidAmount ?? 0;

    console.log("💰 BOOKING PRICING CONTEXT:", {
      bookingId,
      bookingType: booking.bookingType,
      packageId: booking.packageId,
      originalPrice: booking.originalPrice,
      totalPrice: booking.totalPrice,
      finalPrice,
      paidAmount,
      discount: booking.discount,
      gstAmount: booking.gstAmount,
      paymentType: booking.paymentType,
      paymentStatus: booking.paymentStatus,
      remainingAmount: booking.remainingAmount,
    });
    
    // Additional logging for package bookings to track discount flow
    if (booking.bookingType === "PACKAGE") {
      console.log("📦 PACKAGE BOOKING PAYMENT CONTEXT:", {
        bookingId,
        packageId: booking.packageId,
        originalPrice: booking.originalPrice,
        discount: booking.discount,
        discountPercent: (booking.originalPrice && booking.originalPrice > 0) ? (booking.discount / booking.originalPrice) : 0,
        finalPrice,
        remainingAmount: booking.remainingAmount,
      });
    }

    if (!finalPrice || isNaN(finalPrice) || finalPrice <= 0) {
      throw new BadRequest(
        "Invalid booking final price - payment mode may not be set correctly. Final price must be greater than 0.",
      );
    }

    if (finalPrice < 1) {
      throw new BadRequest("Minimum booking amount is ₹1");
    }

    if (isNaN(paidAmount) || paidAmount < 0) {
      throw new BadRequest("Invalid paid amount");
    }

    const remaining = roundMoney(finalPrice - paidAmount);

    console.log("💰 PAYMENT CALCULATION:", {
      finalPrice,
      paidAmount,
      remaining,
      paymentType: booking.paymentType,
    });

    if (remaining <= 0) {
      throw new BadRequest("Nothing left to pay online");
    }

    if (remaining < 1) {
      console.log("Remaining amount too small:", remaining);
      throw new BadRequest("Minimum payment amount is ₹1");
    }

    let paymentStage = opts?.paymentStage;
    let paymentType: "FULL" | "ADVANCE" | "REMAINING" = "FULL";
    let chargeAmount = remaining;

    if (booking.paymentType === "PARTIAL") {
      if (paidAmount < 0.01) {
        paymentStage = "ADVANCE";
        paymentType = "ADVANCE";
        chargeAmount = Math.min(remaining, advanceAmountForPartial(finalPrice));
        console.log("💰 PARTIAL PAYMENT - ADVANCE STAGE:", {
          finalPrice,
          advanceAmount: advanceAmountForPartial(finalPrice),
          chargeAmount,
        });
      } else {
        paymentStage = "FULL";
        paymentType = "REMAINING";
        chargeAmount = remaining;
        console.log("💰 PARTIAL PAYMENT - REMAINING STAGE:", {
          paidAmount,
          remaining,
          chargeAmount,
        });
      }
    } else {
      paymentStage = "FULL";
      paymentType = "FULL";
      chargeAmount = remaining;
      console.log("💰 FULL PAYMENT:", {
        finalPrice,
        chargeAmount,
      });
    }

    if (opts?.paymentStage && booking.paymentType === "FULL") {
      paymentStage = "FULL";
    }

    console.log("💰 FINAL CHARGE DETAILS:", {
      paymentStage,
      paymentType,
      chargeAmount,
      chargeAmountPaise: Math.round(chargeAmount * 100),
    });

    if (chargeAmount <= 0) {
      console.log("Invalid chargeAmount <=0");
      throw new BadRequest("Invalid charge amount");
    }

    if (isNaN(chargeAmount)) {
      console.log("chargeAmount is NaN");
      throw new BadRequest("Charge amount is not a valid number");
    }

    // CRITICAL FIX: Invalidate ALL stale pending orders BEFORE searching to prevent reuse
    // This ensures we never reuse a payment with an outdated amount
    await this.invalidateStalePendingOrders(bookingId);

    // Log payment creation context for debugging
    console.log("💰 PAYMENT CREATION CONTEXT:", {
      bookingId,
      bookingFinalPrice: finalPrice,
      bookingPaidAmount: paidAmount,
      bookingRemainingAmount: remaining,
      calculatedChargeAmount: chargeAmount,
      paymentStage,
      paymentType,
    });

    // Check for duplicate pending with razorpayOrderId and EXACT amount match
    const duplicatePending = await Payment.findOne({
      bookingId,
      status: "PENDING",
      paymentKind: "CHARGE",
      paymentStage,
      razorpayOrderId: { $exists: true, $ne: null },
    });

    if (duplicatePending) {
      // CRITICAL: Require EXACT amount match - no tolerance for differences
      // This prevents reusing payments with stale amounts
      const amountDiff = Math.abs(duplicatePending.amount - chargeAmount);
      if (amountDiff > 0.001) {
        // Amount changed even slightly - invalidate this payment
        console.log("🔄 Amount mismatch detected, invalidating stale payment:", {
          paymentId: duplicatePending._id,
          oldAmount: duplicatePending.amount,
          newAmount: chargeAmount,
          difference: amountDiff,
        });
        await Payment.findByIdAndUpdate(duplicatePending._id, {
          status: "FAILED",
          failureReason: "Amount changed, invalidated",
        });
      } else {
        // Exact match - safe to reuse, but still sync amount to be safe
        const keyId = process.env.RAZORPAY_KEY_ID;
        if (!keyId) {
          throw new BadRequest("Razorpay is not configured");
        }
        console.log("♻️ Reusing existing Razorpay order with exact amount match:", {
          paymentId: duplicatePending._id,
          amount: chargeAmount,
          orderId: duplicatePending.razorpayOrderId,
        });
        // CRITICAL: Even with exact match, sync amount to ensure consistency
        const updated = await Payment.findByIdAndUpdate(
          duplicatePending._id,
          {
            amount: chargeAmount,
            type: paymentType,
            paymentStage,
          },
          { new: true },
        );
        return {
          payment: updated || duplicatePending,
          orderId: duplicatePending.razorpayOrderId,
          amount: chargeAmount,
          currency: "INR",
          keyId,
          paymentStage,
        };
      }
    }

    // CRITICAL FIX: Check for PENDING payment without razorpayOrderId with EXACT amount match
    // This is the payment updated by retryFailedPayment() - reuse it instead of creating new
    const pendingWithoutOrderId = await Payment.findOne({
      bookingId,
      status: "PENDING",
      paymentKind: "CHARGE",
      paymentStage,
      razorpayOrderId: { $exists: false },
    });

    // If still no pending doc to attach order to, create one
    let paymentDoc = pendingWithoutOrderId;

    if (pendingWithoutOrderId) {
      const amountDiff = Math.abs(pendingWithoutOrderId.amount - chargeAmount);
      if (amountDiff > 0.001) {
        // Amount mismatch - invalidate this payment
        console.log("🔄 Amount mismatch in PENDING without razorpayOrderId, invalidating:", {
          paymentId: pendingWithoutOrderId._id,
          oldAmount: pendingWithoutOrderId.amount,
          newAmount: chargeAmount,
          difference: amountDiff,
        });
        await Payment.findByIdAndUpdate(pendingWithoutOrderId._id, {
          status: "FAILED",
          failureReason: "Amount changed, invalidated",
        });
        paymentDoc = null;
      } else {
        // Exact match - reuse this payment (updated by retryFailedPayment)
        console.log("♻️ Reusing PENDING payment without razorpayOrderId (updated by retry):", {
          paymentId: pendingWithoutOrderId._id,
          amount: chargeAmount,
        });
        // CRITICAL: Even when reusing, ensure amount is synced to latest chargeAmount
        // This prevents any edge cases where amount might be slightly off
        paymentDoc = await Payment.findByIdAndUpdate(
          pendingWithoutOrderId._id,
          {
            amount: chargeAmount,
            type: paymentType,
            paymentStage,
          },
          { new: true },
        );
      }
    }
    if (!paymentDoc) {
      try {
        paymentDoc = await Payment.create({
          bookingId,
          userId: booking.userId,
          guideId: booking.guideId || undefined,
          driverId: booking.driverId || undefined,
          amount: chargeAmount,
          type: paymentType,
          paymentKind: "CHARGE",
          paymentStage,
          status: "PENDING",
        });
        console.log("🆕 Created fresh payment document:", {
          paymentId: paymentDoc._id,
          amount: chargeAmount,
        });
      } catch (err: any) {
        if (err?.code === 11000) {
          paymentDoc = await Payment.findOne({ bookingId, status: "PENDING" });
          // console.log("♻️ Found existing payment after duplicate key error:", {
          //   paymentId: paymentDoc._id,
          //   oldAmount: paymentDoc.amount,
          //   newAmount: chargeAmount,
          // });
          
          // CRITICAL FIX: When reusing payment after duplicate key error,
          // ALWAYS update the amount to match the current chargeAmount
          // This prevents stale amounts from persisting
          if (paymentDoc) {
            const amountDiff = Math.abs(paymentDoc.amount - chargeAmount);
            if (amountDiff > 0.001) {
              console.log("🔄 Updating stale payment amount after duplicate key recovery:", {
                paymentId: paymentDoc._id,
                oldAmount: paymentDoc.amount,
                newAmount: chargeAmount,
                difference: amountDiff,
              });
              paymentDoc = await Payment.findByIdAndUpdate(
                paymentDoc._id,
                {
                  amount: chargeAmount,
                  type: paymentType,
                  paymentStage,
                  $unset: { razorpayOrderId: "" }, // Clear stale razorpayOrderId
                },
                { new: true },
              );
            }
          }
        } else {
          throw err;
        }
      }
    }

    // At this point we have a paymentDoc to attach an order to.
    if (!paymentDoc) {
      throw new BadRequest("Failed to create or find payment document");
    }
    const receipt = `bk_${bookingId}_${paymentDoc._id}`.slice(0, 40);
    console.log("🔄 RAZORPAY ORDER CREATION:", {
      bookingId,
      chargeAmount,
      chargeAmountPaise: Math.round(chargeAmount * 100),
      receipt,
      paymentDocId: paymentDoc!._id,
    });
    const { order, amountPaise } = await createRazorpayOrder(
      chargeAmount,
      receipt,
    );

    console.log("✅ RAZORPAY ORDER CREATED:", {
      orderId: order.id,
      orderAmountPaise: amountPaise,
      orderAmountRupees: amountPaise / 100,
      expectedChargeAmount: chargeAmount,
      amountMatch: amountPaise === Math.round(chargeAmount * 100),
    });

    // Atomically set razorpayOrderId only if not already set (claim)
    try {
      const updated = await Payment.findOneAndUpdate(
        {
          _id: paymentDoc!._id,
          $or: [
            { razorpayOrderId: { $exists: false } },
            { razorpayOrderId: null },
          ],
        },
        { $set: { razorpayOrderId: order.id } },
        { new: true },
      );
      if (!updated) {
        // Another process claimed it; return that one
        const existing = await Payment.findById(paymentDoc!._id);
        const keyId = process.env.RAZORPAY_KEY_ID;
        if (!keyId) throw new BadRequest("Razorpay is not configured");
        return {
          payment: existing,
          orderId: existing?.razorpayOrderId,
          amount: chargeAmount,
          currency: "INR",
          keyId,
          paymentStage,
        };
      }

      const keyId = process.env.RAZORPAY_KEY_ID;
      if (!keyId) throw new BadRequest("Razorpay is not configured");

      return {
        payment: updated,
        orderId: order.id,
        amount: chargeAmount,
        currency: "INR",
        keyId,
        paymentStage,
      };
    } catch (err: any) {
      if (err?.code === 11000) {
        const existing = await Payment.findOne({
          bookingId,
          status: "PENDING",
        });
        const keyId = process.env.RAZORPAY_KEY_ID;
        return {
          payment: existing,
          orderId: existing?.razorpayOrderId,
          amount: chargeAmount,
          currency: "INR",
          keyId,
          paymentStage,
        };
      }
      throw err;
    }
  }

  private async invalidateStalePendingOrders(bookingId: string) {
    // Invalidate ALL PENDING payments with razorpayOrderId and CLEAR the razorpayOrderId field
    // This prevents stale order reuse and ensures clean retry flow
    await Payment.updateMany(
      {
        bookingId,
        status: "PENDING",
        razorpayOrderId: { $exists: true, $ne: null },
      },
      {
        status: "FAILED",
        failureReason: "Superseded by a new checkout attempt",
        $unset: { razorpayOrderId: "" }, // Clear stale razorpayOrderId
      },
    );

    // Also invalidate FAILED payments with razorpayOrderId to prevent any confusion
    // This is critical for retry flow - old failed payments should not have active razorpayOrderId
    await Payment.updateMany(
      {
        bookingId,
        status: "FAILED",
        razorpayOrderId: { $exists: true, $ne: null },
      },
      {
        $unset: { razorpayOrderId: "" }, // Clear stale razorpayOrderId from failed payments
      },
    );
  }

  async skipPayment(userId: string, bookingId: string) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFound("Booking not found");
    }

    if (booking.userId.toString() !== userId) {
      throw new Unauthorized("Not authorized to skip payment for this booking");
    }

    if (booking.paymentStatus !== "PENDING") {
      throw new BadRequest("Payment is not in pending state");
    }

    return { message: "Payment skipped successfully" };
  }

  /**
   * Completes a Razorpay payment after signature verification (production path).
   * Uses transactions for atomic payment completion.
   */
  async verifyAndCompleteRazorpayPayment(
    userId: string,
    paymentId: string,
    payload: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payment = await Payment.findById(paymentId).session(session);

      if (!payment) {
        throw new NotFound("Payment not found");
      }

      if (payment.userId.toString() !== userId) {
        throw new Unauthorized("Not your payment");
      }

      if (
        !payment.razorpayOrderId ||
        payment.razorpayOrderId !== payload.razorpay_order_id
      ) {
        throw new BadRequest("Order mismatch for this payment");
      }

      const ok = verifyPaymentSignature(
        payload.razorpay_order_id,
        payload.razorpay_payment_id,
        payload.razorpay_signature,
      );

      if (!ok) {
        throw new BadRequest("Invalid Razorpay signature");
      }

      // Check idempotency: if already completed, return it
      const existingPaid = await Payment.findOne({
        razorpayPaymentId: payload.razorpay_payment_id,
        status: "COMPLETED",
      })
        .session(session)
        .populate("bookingId");

      if (existingPaid) {
        await session.commitTransaction();
        session.endSession();
        return existingPaid;
      }

      const razorpay = getRazorpayClient();
      const rpPayment = await razorpay.payments.fetch(
        payload.razorpay_payment_id,
      );

      if (rpPayment.order_id !== payload.razorpay_order_id) {
        throw new BadRequest("Razorpay payment does not belong to this order");
      }

      // CRITICAL FIX: Fetch the actual Razorpay order to get the true amount
      // This prevents mismatches when payment.amount in DB is stale
      const rpOrder = await razorpay.orders.fetch(payload.razorpay_order_id);
      const orderAmountPaise = Number(rpOrder.amount);
      const orderAmountRupees = orderAmountPaise / 100;

      // CRITICAL FIX: Use DB payment amount as the source of truth, NOT Razorpay order amount
      // The DB payment amount matches the booking finalPrice exactly
      // The Razorpay order amount might have rounding differences
      const expectedPaise = Math.round(payment.amount * 100);
      
      console.log("🔍 PAYMENT VERIFICATION AUDIT:", {
        paymentId,
        razorpayPaymentId: payload.razorpay_payment_id,
        razorpayOrderId: payload.razorpay_order_id,
        // Razorpay order amount (source of truth)
        orderAmountPaise,
        orderAmountRupees,
        // Payment amount from DB (might be stale)
        dbPaymentAmount: payment.amount,
        dbPaymentAmountPaise: Math.round(payment.amount * 100),
        // Razorpay payment amount (what was actually captured)
        razorpayPaymentAmount: Number(rpPayment.amount),
        razorpayPaymentAmountRupees: Number(rpPayment.amount) / 100,
        // Validation
        orderMatchPayment: orderAmountPaise === Number(rpPayment.amount),
        dbMatchOrder: Math.round(payment.amount * 100) === orderAmountPaise,
        paymentStatus: rpPayment.status,
        paymentMethod: rpPayment.method,
      });
      
      // Additional logging for package bookings
      const packageBooking = await Booking.findById(payment.bookingId).session(session);
      if (packageBooking && packageBooking.bookingType === "PACKAGE") {
        console.log("📦 PACKAGE PAYMENT VERIFICATION:", {
          bookingId: packageBooking._id,
          packageId: packageBooking.packageId,
          originalPrice: packageBooking.originalPrice,
          discount: packageBooking.discount,
          finalPrice: packageBooking.finalPrice,
          paymentAmount: payment.amount,
          razorpayOrderAmount: orderAmountRupees,
          amountMatch: Math.abs(payment.amount - orderAmountRupees) < 0.01,
        });
      }

      // Verify Razorpay payment amount matches DB payment amount (not order amount)
      // This allows for minor rounding differences in Razorpay order creation
      const razorpayPaymentAmountPaise = Number(rpPayment.amount);
      const amountDiffPaise = Math.abs(razorpayPaymentAmountPaise - expectedPaise);
      
      if (amountDiffPaise > 1) {
        console.log("❌ RAZORPAY PAYMENT/DB AMOUNT MISMATCH:", {
          expectedPaise,
          razorpayPaymentAmountPaise,
          difference: amountDiffPaise,
        });
        throw new BadRequest("Razorpay payment amount does not match expected amount");
      }

      // Log warning if DB payment amount differs from order amount (non-blocking)
      const dbAmountPaise = Math.round(payment.amount * 100);
      if (dbAmountPaise !== orderAmountPaise) {
        console.log("⚠️ DB payment amount differs from Razorpay order amount:", {
          dbAmount: dbAmountPaise,
          orderAmount: orderAmountPaise,
          difference: orderAmountPaise - dbAmountPaise,
          note: "Using DB payment amount as source of truth",
        });
        // CRITICAL FIX: Do NOT update payment amount - DB amount is source of truth
        // The paise conversion fix in razorpay.service.ts should prevent this mismatch
      }

      // Process payment within transaction
      const freshPayment = await Payment.findById(payment._id).session(session);
      if (!freshPayment) {
        throw new NotFound("Payment not found");
      }

      // Idempotent success path
      if (
        freshPayment.status === "COMPLETED" &&
        freshPayment.razorpayPaymentId === payload.razorpay_payment_id
      ) {
        await session.commitTransaction();
        session.endSession();
        return Payment.findById(payment._id)
          .session(session)
          .populate("bookingId");
      }

      if (freshPayment.status === "COMPLETED") {
        throw new BadRequest(
          "Payment already completed with another transaction",
        );
      }

      const booking = await Booking.findById(freshPayment.bookingId).session(
        session,
      );
      if (!booking) {
        throw new NotFound("Booking not found");
      }

      const lineAmount = effectiveLineAmount(freshPayment);
      const finalPrice = booking.finalPrice ?? booking.totalPrice;
      const paidBefore = booking.paidAmount ?? 0;

      if (paidBefore + lineAmount > finalPrice + 0.01) {
        throw new BadRequest("This payment would overpay the booking");
      }

      freshPayment.status = "COMPLETED";
      freshPayment.transactionId = payload.razorpay_payment_id;
      freshPayment.razorpayPaymentId = payload.razorpay_payment_id;
      freshPayment.paymentMethod = "RAZORPAY";
      freshPayment.paidAt = new Date();
      freshPayment.failureReason = undefined;
      await freshPayment.save({ session });

      const paidAfter = roundMoney(paidBefore + lineAmount);
      const remainingAfter = roundMoney(finalPrice - paidAfter);

      booking.paidAmount = paidAfter;
      booking.remainingAmount = Math.max(0, remainingAfter);
      booking.paymentStatus =
        remainingAfter <= 0.01
          ? "COMPLETED"
          : paidAfter > 0
            ? "PARTIAL"
            : "PENDING";
      applyPlatformSplitToBooking(booking);
      await booking.save({ session });

      await financialAuditService.log({
        action: "PAYMENT_COMPLETED",
        bookingId: booking._id.toString(),
        paymentId: freshPayment._id.toString(),
        metadata: {
          razorpayPaymentId: payload.razorpay_payment_id,
          source: "checkout",
          amount: lineAmount,
        },
      });

      await session.commitTransaction();
      session.endSession();

      try {
        await NotificationService.sendPaymentSuccess(
          freshPayment._id.toString(),
        );
      } catch (error) {
        console.warn("Notification send failed (non-blocking):", error);
      }

      return Payment.findById(freshPayment._id).populate("bookingId");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async createRefund(
    userId: string,
    paymentId: string,
    data: any,
    sessionOverride?: any,
  ) {
    const session = sessionOverride || (await mongoose.startSession());
    const isExternalSession = !!sessionOverride;

    if (!isExternalSession) {
      session.startTransaction();
    }

    try {
      // 1. Get payment with session
      const payment = await Payment.findById(paymentId).session(session);
      if (!payment) throw new NotFound("Payment not found");

      // 2. Ownership check
      if (payment.userId.toString() !== userId) {
        throw new Unauthorized("Not your payment");
      }

      // 3. Payment must be COMPLETED
      if (payment.status !== "COMPLETED") {
        throw new BadRequest("Cannot refund incomplete payment");
      }

      // 4. Prevent over-refund
      const alreadyRefunded = roundMoney(payment.refundedAmount || 0);
      const chargedAmount = roundMoney(effectiveLineAmount(payment));
      const maxRefundable = roundMoney(chargedAmount - alreadyRefunded);

      if (maxRefundable <= 0) {
        throw new BadRequest("Payment already fully refunded");
      }

      const refundAmount = roundMoney(Math.min(data.amount, maxRefundable));

      // 5. Get booking with session
      const booking = await Booking.findById(payment.bookingId).session(
        session,
      );
      if (!booking) throw new NotFound("Booking not found");

      if (booking.status === "COMPLETED") {
        throw new BadRequest("Cannot refund completed booking");
      }

      // 6. Create refund document
      const refund = await Refund.create(
        [
          {
            paymentId: payment._id,
            bookingId: booking._id,
            userId,
            amount: refundAmount,
            reason: data.reason,
            status: "PROCESSED",
            processedAt: new Date(),
          },
        ],
        { session },
      );

      // 7. Update payment - increment refunded amount
      payment.refundedAmount = roundMoney(alreadyRefunded + refundAmount);
      payment.lastRefundedAt = new Date();

      if (payment.refundedAmount >= chargedAmount - 0.01) {
        payment.status = "REFUNDED";
      }

      await payment.save({ session });

      // 8. Update booking - decrement paid amount
      const finalPrice = booking.finalPrice ?? booking.totalPrice;
      const paidBefore = roundMoney(booking.paidAmount || 0);
      const paidAfter = roundMoney(Math.max(0, paidBefore - refundAmount));

      booking.paidAmount = paidAfter;
      booking.remainingAmount = roundMoney(Math.max(0, finalPrice - paidAfter));
      booking.paymentStatus =
        booking.remainingAmount <= 0.01
          ? "COMPLETED"
          : paidAfter > 0.01
            ? "PARTIAL"
            : "PENDING";

      if (paidAfter <= 0.01) {
        booking.paymentStatus = "PENDING";
      }

      applyPlatformSplitToBooking(booking);
      await booking.save({ session });

      // 9. Audit log
      await financialAuditService.log({
        action: "REFUND_CREATED",
        actorUserId: userId,
        bookingId: booking._id.toString(),
        paymentId: payment._id.toString(),
        refundId: refund[0]._id.toString(),
        metadata: {
          amount: refundAmount,
        },
      });

      if (!isExternalSession) {
        await session.commitTransaction();
        session.endSession();
      }

      return refund[0];
    } catch (error) {
      if (!isExternalSession) {
        await session.abortTransaction();
        session.endSession();
      }
      throw error;
    }
  }

  async getRefundsForPayment(actorUserId: string, paymentId: string) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new NotFound("Payment not found");
    }
    const actorRole = await this.getActorRole(actorUserId);
    const isOwner = payment.userId.toString() === actorUserId;
    const isAdmin = actorRole === "ADMIN";
    if (!isOwner && !isAdmin) {
      throw new Unauthorized("Not allowed to view refunds for this payment");
    }
    return Refund.find({ paymentId }).sort({ createdAt: -1 });
  }

  async getRefundsByBooking(actorUserId: string, bookingId: string) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFound("Booking not found");
    }

    const actorRole = await this.getActorRole(actorUserId);
    const isOwner = booking.userId.toString() === actorUserId;
    const isAdmin = actorRole === "ADMIN";

    let isAssigned = false;
    if (!isOwner && !isAdmin) {
      if (booking.bookingType === "GUIDE" && booking.guideId) {
        const guide = await Guide.findOne({ userId: actorUserId })
          .select("_id")
          .lean();
        isAssigned =
          !!guide && guide._id.toString() === booking.guideId.toString();
      }
      if (booking.bookingType === "DRIVER" && booking.driverId) {
        const driver = await Driver.findOne({ userId: actorUserId })
          .select("_id")
          .lean();
        isAssigned =
          !!driver && driver._id.toString() === booking.driverId.toString();
      }
    }

    if (!isOwner && !isAdmin && !isAssigned) {
      throw new Unauthorized("Not allowed to view refunds for this booking");
    }

    return Refund.find({ bookingId }).sort({ createdAt: -1 });
  }

  async getRefundsByUser(userId: string) {
    // Get all bookings for this user
    const userBookings = await Booking.find({ userId }).select("_id");

    const bookingIds = userBookings.map((b) => b._id);

    const refunds = await Refund.find({ bookingId: { $in: bookingIds } })
      .populate({
        path: "paymentId",
        select: "_id amount status",
      })
      .populate({
        path: "bookingId",
        select: "_id tourType totalPrice finalPrice",
      })
      .sort({ createdAt: -1 })
      .lean();

    return refunds;
  }

  async createCancellationRefunds(
    actorUserId: string,
    bookingId: string,
    reason?: string,
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Get booking with session
      const booking = await Booking.findById(bookingId).session(session);
      if (!booking) {
        throw new NotFound("Booking not found");
      }

      // 2. Authorization check
      const actorRole = await this.getActorRole(actorUserId);
      const isOwner = booking.userId.toString() === actorUserId;
      const isAdmin = actorRole === "ADMIN";

      let isAssigned = false;
      if (!isOwner && !isAdmin) {
        if (booking.bookingType === "GUIDE" && booking.guideId) {
          const guide = await Guide.findOne({ userId: actorUserId })
            .select("_id")
            .lean();
          isAssigned =
            !!guide && guide._id.toString() === booking.guideId.toString();
        }
        if (booking.bookingType === "DRIVER" && booking.driverId) {
          const driver = await Driver.findOne({ userId: actorUserId })
            .select("_id")
            .lean();
          isAssigned =
            !!driver && driver._id.toString() === booking.driverId.toString();
        }
      }

      if (!isOwner && !isAdmin && !isAssigned) {
        throw new Unauthorized(
          "Not allowed to create cancellation refund for this booking",
        );
      }

      // 3. Check paid amount and refund eligibility
      const paidAmount = roundMoney(booking.paidAmount ?? 0);
      if (paidAmount <= 0) {
        throw new BadRequest("No paid amount available for refund");
      }

      if (booking.paymentStatus === "REFUNDED") {
        throw new BadRequest("Booking is already refunded");
      }

      // 4. Check already refunded amount
      const alreadyRefunded = await Refund.aggregate<{ total: number }>([
        {
          $match: {
            bookingId: booking._id,
            status: { $in: ["REQUESTED", "PROCESSED"] },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const refundedTotal = roundMoney(alreadyRefunded[0]?.total ?? 0);
      if (refundedTotal >= paidAmount - 0.01) {
        throw new BadRequest("Refund already initiated for this booking");
      }

      // 5. Get completed payments with session
      const completedPayments = await Payment.find({
        bookingId: booking._id,
        status: "COMPLETED",
        razorpayPaymentId: { $exists: true, $ne: null },
      })
        .session(session)
        .sort({ paidAt: -1, createdAt: -1 });

      if (!completedPayments.length) {
        throw new BadRequest("No completed online payment found for refund");
      }

      // 6. Create refunds for each payment
      const createdRefunds: any[] = [];
      let left = roundMoney(paidAmount - refundedTotal);

      for (const p of completedPayments) {
        if (left <= 0.01) break;

        const refundable = roundMoney(
          effectiveLineAmount(p) - (p.refundedAmount ?? 0),
        );
        if (refundable <= 0.01) continue;

        const amount = roundMoney(Math.min(left, refundable));

        // Call createRefund with the session to avoid nested transactions
        const refund = await this.createRefund(
          actorUserId,
          p._id.toString(),
          {
            amount,
            reason: reason || "Booking cancelled",
          },
          session, // Pass session to createRefund
        );

        createdRefunds.push(refund);
        left = roundMoney(left - amount);
      }

      if (!createdRefunds.length) {
        throw new BadRequest("No refundable payment lines found");
      }

      // 7. Update booking status if fully refunded
      const pendingOrProcessed = await Refund.aggregate<{ total: number }>([
        {
          $match: {
            bookingId: booking._id,
            status: { $in: ["REQUESTED", "PROCESSED"] },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const totalAfter = roundMoney(pendingOrProcessed[0]?.total ?? 0);
      if (totalAfter >= paidAmount - 0.01) {
        booking.paymentStatus = "REFUNDED";
        await booking.save({ session });
      }

      // 8. Log audit
      await financialAuditService.log({
        action: "CANCELLATION_REFUNDS_CREATED",
        actorUserId: actorUserId,
        bookingId: booking._id.toString(),
        metadata: {
          refundsCount: createdRefunds.length,
          totalRefundAmount: roundMoney(paidAmount - left),
        },
      });

      await session.commitTransaction();
      session.endSession();

      return createdRefunds;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async retryFailedPayment(userId: string, paymentId: string) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new NotFound("Payment not found");
    }

    if (payment.userId.toString() !== userId) {
      throw new Unauthorized("Not your payment");
    }
    if (payment.status === "COMPLETED") {
      throw new BadRequest("Completed payment cannot be retried");
    }

    const bookingId = payment.bookingId.toString();

    // CRITICAL: Invalidate ALL stale payments for this booking before retry
    // This ensures no stale PENDING or FAILED payments with old amounts can interfere
    await this.invalidateStalePendingOrders(bookingId);

    // Fetch fresh booking data to get latest pricing
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFound("Booking not found");
    }

    const finalPrice = booking.finalPrice ?? booking.totalPrice;
    const paidAmount = booking.paidAmount ?? 0;
    const remainingAmount = roundMoney(finalPrice - paidAmount);

    // Log pricing context for debugging
    console.log("🔄 RETRY PAYMENT PRICING CONTEXT:", {
      paymentId,
      bookingId,
      originalPaymentAmount: payment.amount,
      currentFinalPrice: finalPrice,
      currentPaidAmount: paidAmount,
      currentRemainingAmount: remainingAmount,
      paymentType: booking.paymentType,
      paymentStatus: booking.paymentStatus,
    });

    // Warn if pricing changed significantly since original payment
    if (payment.amount && Math.abs(payment.amount - remainingAmount) > 1) {
      console.warn("⚠️ PRICING CHANGE DETECTED DURING RETRY:", {
        paymentId,
        bookingId,
        originalAmount: payment.amount,
        newAmount: remainingAmount,
        difference: Math.abs(payment.amount - remainingAmount),
      });
    }

    // CRITICAL FIX: Update the EXISTING payment document with the new amount
    // instead of creating a new one. This ensures the paymentId remains the same
    // and verification will use the correct amount.
    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: "PENDING",
        amount: remainingAmount,
        failureReason: undefined,
        $unset: { razorpayOrderId: "" }, // Clear any existing razorpayOrderId
      },
      { new: true },
    );

    if (!updatedPayment) {
      throw new BadRequest("Failed to update payment for retry");
    }

    console.log("🔄 PAYMENT UPDATED FOR RETRY:", {
      paymentId,
      oldAmount: payment.amount,
      newAmount: remainingAmount,
    });

    // Now create Razorpay order for the updated payment
    return this.createRazorpayOrderForBooking(
      userId,
      bookingId,
    );
  }

  async getFinancialAuditLogs(actorUserId: string, limit = 100) {
    const role = await this.getActorRole(actorUserId);
    if (role !== "ADMIN") {
      throw new Unauthorized("Only admin can view financial audit logs");
    }
    const safeLimit = Number.isFinite(limit) ? limit : 100;
    return FinancialAuditLog.find()
      .sort({ createdAt: -1 })
      .limit(Math.max(1, Math.min(500, safeLimit)))
      .lean();
  }

  async processPayment(paymentId: string, data: any, userId: string) {
    // If Razorpay signature data provided, delegate to dedicated handler
    if (
      data?.razorpay_order_id &&
      data?.razorpay_payment_id &&
      data?.razorpay_signature
    ) {
      return this.verifyAndCompleteRazorpayPayment(userId, paymentId, {
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
      });
    }

    // Manual payment processing within transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Fetch payment with session
      const payment = await Payment.findById(paymentId).session(session);

      if (!payment) {
        throw new NotFound("Payment not found");
      }

      // 2. Validate status
      if (!["COMPLETED", "FAILED"].includes(data.status)) {
        throw new BadRequest("Invalid payment status");
      }

      if (payment.status === "COMPLETED") {
        throw new BadRequest("Payment already completed");
      }

      // 3. Ownership check
      if (payment.userId.toString() !== userId) {
        throw new Unauthorized("Not your payment");
      }

      // 4. Update payment
      const lineAmount = effectiveLineAmount(payment);

      payment.status = data.status;
      payment.transactionId = data.transactionId;
      payment.paymentMethod = data.paymentMethod;
      payment.failureReason = data.failureReason;
      payment.paidAt = data.status === "COMPLETED" ? new Date() : undefined;

      await payment.save({ session });

      // 5. If payment completed, update booking
      if (data.status === "COMPLETED") {
        const booking = await Booking.findById(payment.bookingId).session(
          session,
        );

        if (booking) {
          const finalPrice = booking.finalPrice ?? booking.totalPrice;
          const paidBefore = roundMoney(booking.paidAmount ?? 0);
          const paidAfter = roundMoney(paidBefore + lineAmount);
          const remainingAfter = roundMoney(finalPrice - paidAfter);

          // Prevent overpayment
          if (paidAfter > finalPrice + 0.01) {
            throw new BadRequest("This payment would overpay the booking");
          }

          booking.paidAmount = paidAfter;
          booking.remainingAmount = Math.max(0, remainingAfter);
          booking.paymentStatus =
            remainingAfter <= 0.01
              ? "COMPLETED"
              : paidAfter > 0.01
                ? "PARTIAL"
                : "PENDING";

          applyPlatformSplitToBooking(booking);
          await booking.save({ session });

          // 6. Audit log
          await financialAuditService.log({
            action: "PAYMENT_COMPLETED",
            actorUserId: userId,
            bookingId: booking._id.toString(),
            paymentId: payment._id.toString(),
            metadata: {
              source: "manual",
              amount: lineAmount,
            },
          });

          console.log(
            `[PAYMENT] 💰 Payment Success for paymentId: ${paymentId}, bookingId: ${payment.bookingId}`,
          );

          // 7. Send notification (non-blocking, outside transaction)
          await session.commitTransaction();
          session.endSession();

          try {
            await NotificationService.sendPaymentSuccess(paymentId);
          } catch (error) {
            console.warn("Notification send failed (non-blocking):", error);
          }

          return Payment.findById(paymentId).populate("bookingId");
        }
      }

      if (data.status === "FAILED") {
        await financialAuditService.log({
          action: "PAYMENT_FAILED",
          actorUserId: userId,
          bookingId: payment.bookingId.toString(),
          paymentId: payment._id.toString(),
          metadata: {
            source: "manual",
            reason: data.failureReason,
          },
        });
      }

      await session.commitTransaction();
      session.endSession();

      return Payment.findById(paymentId).populate("bookingId");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async getPaymentsByUser(userId: string) {
    const payments = await Payment.find({ userId })
      .populate("bookingId")
      .sort({ createdAt: -1 });

    return payments;
  }

  async getPaymentByBooking(bookingId: string) {
    const payment = await Payment.findOne({ bookingId }).populate("bookingId");

    return payment;
  }

  async getPaymentsByBookingId(bookingId: string, userId: string) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFound("Booking not found");
    }
    if (booking.userId.toString() !== userId) {
      throw new Unauthorized("Not authorized");
    }
    return Payment.find({ bookingId })
      .sort({ createdAt: 1 })
      .populate("bookingId");
  }

  async getPaymentsByGuide(guideId: string) {
    const payments = await Payment.find()
      .populate({
        path: "bookingId",
        match: { guideId },
      })
      .sort({ createdAt: -1 });

    return payments.filter((p) => p.bookingId !== null);
  }

  async getPaymentStats(guideId: string) {
    const payments = await Payment.find({
      status: "COMPLETED",
    }).populate({
      path: "bookingId",
      match: { guideId },
    });

    const filteredPayments = payments.filter((p) => p.bookingId !== null);
    const totalEarnings = filteredPayments.reduce(
      (sum: number, p: IPayment) => sum + effectiveLineAmount(p),
      0,
    );
    const completedPayments = filteredPayments.length;

    return {
      totalEarnings,
      completedPayments,
      averagePayment:
        completedPayments > 0 ? totalEarnings / completedPayments : 0,
    };
  }

  async getGuideEarnings(guideId: string) {
    const payments = await Payment.find()
      .populate({
        path: "bookingId",
        match: { guideId },
      })
      .sort({ createdAt: -1 });

    const validPayments = payments.filter((p) => p.bookingId !== null);

    const totalEarnings = validPayments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + getProviderShareForPayment(p), 0);

    const grossEarnings = validPayments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalGst = validPayments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => {
        const b = p.bookingId as any;
        if (!b) return sum;
        const totalPaid = b.paidAmount || b.totalPrice || 1;
        const lineAmt = p.amount || 0;
        const portion = lineAmt / totalPaid;
        return sum + ((b.gstAmount || 0) * portion);
      }, 0);

    const pendingAmount = validPayments
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + getProviderShareForPayment(p), 0);

    const bookings = await Booking.find({ guideId });

    const bookingStats = {
      total: bookings.length,
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
    };

    const tourTypeEarnings: {
      [key: string]: { revenue: number; bookings: number };
    } = {};

    validPayments
      .filter((p) => p.status === "COMPLETED" && p.bookingId)
      .forEach((payment) => {
        const tourType = (payment.bookingId as any).tourType || "Other";
        if (!tourTypeEarnings[tourType]) {
          tourTypeEarnings[tourType] = { revenue: 0, bookings: 0 };
        }
        tourTypeEarnings[tourType].revenue += getProviderShareForPayment(payment);
        tourTypeEarnings[tourType].bookings += 1;
      });

    const revenueByTourType = Object.entries(tourTypeEarnings)
      .map(([type, data]) => ({
        type,
        revenue: data.revenue,
        bookings: data.bookings,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const recentTransactions = validPayments
      .map((payment) => ({
        id: payment._id.toString(),
        amount: Math.round(getProviderShareForPayment(payment)),
        transactionDate: payment.paidAt?.toISOString() || payment.createdAt?.toISOString(),
        status: payment.status?.toLowerCase() || "pending",
      }))
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .slice(0, 5);

    return {
      totalEarnings,
      grossEarnings,
      totalGst,
      pendingAmount,
      bookingStats,
      revenueByTourType,
      recentTransactions,
    };
  }

  async getGuideMonthlyEarnings(guideId: string) {
    const payments = await Payment.find({ status: "COMPLETED" })
      .populate({
        path: "bookingId",
        match: { guideId },
      })
      .sort({ createdAt: -1 });

    const validPayments = payments.filter((p) => p.bookingId !== null);

    const monthlyData: { [key: string]: number } = {};

    validPayments.forEach((p) => {
      const month = new Date(p.paidAt || p.createdAt).toISOString().slice(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + getProviderShareForPayment(p);
    });

    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      months.push({
        month: monthKey,
        revenue: monthlyData[monthKey] || 0,
      });
    }

    return months;
  }

  async getGuideWeeklyEarnings(guideId: string) {
    const payments = await Payment.find({ status: "COMPLETED" })
      .populate({
        path: "bookingId",
        match: { guideId },
      })
      .sort({ createdAt: -1 });

    const validPayments = payments.filter((p) => p.bookingId !== null);

    const weeklyData: { [key: string]: number } = {};

    validPayments.forEach((p) => {
      const date = new Date(p.paidAt || p.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().slice(0, 10);
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + getProviderShareForPayment(p);
    });

    const weeks = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i * 7);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().slice(0, 10);
      weeks.push({
        week: `Week ${4 - i}`,
        revenue: weeklyData[weekKey] || 0,
      });
    }

    return weeks;
  }

  async getTotalRevenue() {
    const payments = await Payment.find({ status: "COMPLETED" });

    const total = payments.reduce((sum, p) => sum + effectiveLineAmount(p), 0);

    return { totalRevenue: total };
  }

  async getMonthlyRevenue() {
    const payments = await Payment.find({ status: "COMPLETED" });

    const map: any = {};

    payments.forEach((p) => {
      const month = new Date(p.createdAt).toISOString().slice(0, 7);
      map[month] = (map[month] || 0) + effectiveLineAmount(p);
    });

    return map;
  }

  async getDriverEarnings(driverId: string) {
    const payments = await Payment.find()
      .populate({
        path: "bookingId",
        match: { driverId },
      })
      .sort({ createdAt: -1 });

    const validPayments = payments.filter((p) => p.bookingId !== null);

    const totalEarnings = validPayments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + getProviderShareForPayment(p), 0);

    const grossEarnings = validPayments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalGst = validPayments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => {
        const b = p.bookingId as any;
        if (!b) return sum;
        const totalPaid = b.paidAmount || b.totalPrice || 1;
        const lineAmt = p.amount || 0;
        const portion = lineAmt / totalPaid;
        return sum + ((b.gstAmount || 0) * portion);
      }, 0);

    const pendingAmount = validPayments
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + getProviderShareForPayment(p), 0);

    const bookings = await Booking.find({ driverId });

    const bookingStats = {
      total: bookings.length,
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
    };

    const tourTypeEarnings: {
      [key: string]: { revenue: number; bookings: number };
    } = {};

    validPayments
      .filter((p) => p.status === "COMPLETED" && p.bookingId)
      .forEach((payment) => {
        const tourType = (payment.bookingId as any).tourType || "Other";
        if (!tourTypeEarnings[tourType]) {
          tourTypeEarnings[tourType] = { revenue: 0, bookings: 0 };
        }
        tourTypeEarnings[tourType].revenue += getProviderShareForPayment(payment);
        tourTypeEarnings[tourType].bookings += 1;
      });

    const revenueByTourType = Object.entries(tourTypeEarnings)
      .map(([type, data]) => ({
        type,
        revenue: data.revenue,
        bookings: data.bookings,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const recentTransactions = validPayments
      .map((payment) => ({
        id: payment._id.toString(),
        amount: Math.round(getProviderShareForPayment(payment)),
        transactionDate: payment.paidAt?.toISOString() || payment.createdAt?.toISOString(),
        status: payment.status?.toLowerCase() || "pending",
      }))
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .slice(0, 5);

    return {
      totalEarnings,
      grossEarnings,
      totalGst,
      pendingAmount,
      bookingStats,
      revenueByTourType,
      recentTransactions,
    };
  }

  async getDriverMonthlyEarnings(driverId: string) {
    const payments = await Payment.find({ status: "COMPLETED" })
      .populate({
        path: "bookingId",
        match: { driverId },
      })
      .sort({ createdAt: -1 });

    const validPayments = payments.filter((p) => p.bookingId !== null);

    const monthlyData: { [key: string]: number } = {};

    validPayments.forEach((p) => {
      const month = new Date(p.paidAt || p.createdAt).toISOString().slice(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + getProviderShareForPayment(p);
    });

    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      months.push({
        month: monthKey,
        revenue: monthlyData[monthKey] || 0,
      });
    }

    return months;
  }

  async getDriverWeeklyEarnings(driverId: string) {
    const payments = await Payment.find({ status: "COMPLETED" })
      .populate({
        path: "bookingId",
        match: { driverId },
      })
      .sort({ createdAt: -1 });

    const validPayments = payments.filter((p) => p.bookingId !== null);

    const weeklyData: { [key: string]: number } = {};

    validPayments.forEach((p) => {
      const date = new Date(p.paidAt || p.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().slice(0, 10);
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + getProviderShareForPayment(p);
    });

    const weeks = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i * 7);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().slice(0, 10);
      weeks.push({
        week: `Week ${4 - i}`,
        revenue: weeklyData[weekKey] || 0,
      });
    }

    return weeks;
  }

  /**
   * Guide/driver (or admin) marks COD booking as fully paid after collecting cash.
   */
  async completeCodPayment(actorUserId: string, bookingId: string) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new NotFound("Booking not found");
    }

    if (booking.paymentType !== "COD") {
      throw new BadRequest("Booking is not cash on delivery");
    }

    if (booking.paymentStatus === "COMPLETED") {
      throw new BadRequest("Cash payment is already marked as collected");
    }

    await this.assertActorMayCollectCod(actorUserId, booking);

    const finalPrice = roundMoney(booking.finalPrice ?? booking.totalPrice);

    booking.paidAmount = finalPrice;
    booking.remainingAmount = 0;
    booking.paymentStatus = "COMPLETED";
    booking.status = "COMPLETED"; // Also mark booking as completed
    applyPlatformSplitToBooking(booking);
    await booking.save();

    const pendingPayments = await Payment.find({
      bookingId: booking._id,
      status: "PENDING",
    }).sort({ createdAt: 1 });

    const primary =
      pendingPayments.find((p) => p.paymentKind === "INITIAL") ??
      pendingPayments[0];

    const txnId = `cod_${booking._id.toString()}_${Date.now()}`;

    if (primary) {
      await Payment.findByIdAndUpdate(primary._id, {
        status: "COMPLETED",
        paymentMethod: "COD",
        paymentStage: "FULL",
        type: "COD",
        paidAt: new Date(),
        amount: finalPrice,
        transactionId: txnId,
      });

      const otherIds = pendingPayments
        .filter((p) => p._id.toString() !== primary._id.toString())
        .map((p) => p._id);

      if (otherIds.length) {
        await Payment.updateMany(
          { _id: { $in: otherIds } },
          {
            status: "FAILED",
            failureReason: "Closed by COD cash collection",
          },
        );
      }
    } else {
      await Payment.create({
        bookingId: booking._id,
        userId: booking.userId,
        guideId: booking.guideId,
        driverId: booking.driverId,
        amount: finalPrice,
        type: "COD",
        paymentKind: "CHARGE",
        paymentStage: "FULL",
        status: "COMPLETED",
        paymentMethod: "COD",
        paidAt: new Date(),
        transactionId: txnId,
      });
    }

    return Booking.findById(bookingId)
      .populate({
        path: "guideId",
        populate: { path: "userId" },
      })
      .populate({
        path: "driverId",
        populate: { path: "userId" },
      })
      .populate("userId");
  }

  private async assertActorMayCollectCod(
    actorUserId: string,
    booking: IBooking,
  ) {
    const user = await User.findById(actorUserId);

    if (!user) {
      throw new Unauthorized("User not found");
    }

    if (user.role === "ADMIN") {
      return;
    }

    if (booking.bookingType === "GUIDE") {
      const guide = await Guide.findOne({ userId: actorUserId });

      if (!guide || booking.guideId?.toString() !== guide._id.toString()) {
        throw new Unauthorized(
          "Only the assigned guide can confirm cash collection",
        );
      }

      return;
    }

    if (booking.bookingType === "DRIVER") {
      const driver = await Driver.findOne({ userId: actorUserId });

      if (!driver || booking.driverId?.toString() !== driver._id.toString()) {
        throw new Unauthorized(
          "Only the assigned driver can confirm cash collection",
        );
      }

      return;
    }

    throw new BadRequest(
      "Cash collection is not available for this booking type",
    );
  }

  async getAdminPaymentsSummary() {
    const revenueAgg = await Payment.aggregate([
      { $match: { status: "COMPLETED" } },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue ?? 0;

    const bookingAgg = await Booking.aggregate([
      { $match: { paymentStatus: "COMPLETED" } },
      {
        $group: {
          _id: null,
          totalAdminCommission: { $sum: "$adminCommission" },
          totalGuideEarning: { $sum: "$guideEarning" },
          totalDriverEarning: { $sum: "$driverEarning" },
          totalGstAmount: { $sum: "$gstAmount" },
        }
      }
    ]);
    
    const adminNetRevenue = bookingAgg[0]?.totalAdminCommission ?? 0;
    const guidePayouts = bookingAgg[0]?.totalGuideEarning ?? 0;
    const driverPayouts = bookingAgg[0]?.totalDriverEarning ?? 0;
    const totalGst = bookingAgg[0]?.totalGstAmount ?? 0;

    const pendingBookingsCount = await Booking.countDocuments({
      paymentStatus: "PENDING",
    });

    const pendingAmountAgg = await Booking.aggregate([
      { $match: { paymentStatus: "PENDING" } },
      {
        $group: {
          _id: null,
          totalPendingAmount: {
            $sum: { $ifNull: ["$remainingAmount", 0] },
          },
        },
      },
    ]);

    const totalPendingAmount = pendingAmountAgg[0]?.totalPendingAmount ?? 0;

    const codPendingCount = await Booking.countDocuments({
      paymentType: "COD",
      paymentStatus: "PENDING",
    });

    const totalBookings = await Booking.countDocuments();

    const completedPaymentsCount = await Payment.countDocuments({
      status: "COMPLETED",
    });

    const recentPayments = await Payment.find({ status: "COMPLETED" })
      .sort({ paidAt: -1, updatedAt: -1 })
      .limit(15)
      .populate({
        path: "bookingId",
        select: "touristName tourType totalPrice finalPrice paymentType",
      })
      .lean();

    return {
      totalRevenue,
      adminNetRevenue,
      guidePayouts,
      driverPayouts,
      totalGst,
      totalPendingAmount,
      pendingBookingsCount,
      codPendingCount,
      totalBookings,
      completedPaymentsCount,
      recentPayments,
    };
  }
}

export const paymentService = new PaymentService();
