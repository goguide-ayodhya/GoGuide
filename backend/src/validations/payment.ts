import { z } from "zod";

export const setPaymentModeSchema = z.object({
  paymentType: z.enum(["FULL", "PARTIAL", "COD"]),
});

export const createRazorpayOrderSchema = z.object({
  paymentStage: z.enum(["ADVANCE", "FULL"]).optional(),
});

export const verifyRazorpaySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const createRefundSchema = z.object({
  amount: z.number().positive(),
  reason: z.string().trim().min(2).max(200).optional(),
});

export type SetPaymentModeInput = z.infer<typeof setPaymentModeSchema>;
export type CreateRazorpayOrderInput = z.infer<typeof createRazorpayOrderSchema>;
export type VerifyRazorpayInput = z.infer<typeof verifyRazorpaySchema>;
export type CreateRefundInput = z.infer<typeof createRefundSchema>;
