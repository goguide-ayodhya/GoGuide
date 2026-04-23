import crypto from "crypto";
import Razorpay from "razorpay";

function requireKeys(): { key_id: string; key_secret: string } {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay is not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)",
    );
  }
  return { key_id, key_secret };
}

let client: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (!client) {
    const { key_id, key_secret } = requireKeys();
    client = new Razorpay({ key_id, key_secret });
  }
  return client;
}

export async function createRazorpayOrder(
  amountRupees: number,
  receipt: string,
) {
  console.log(
    "createRazorpayOrder called with amountRupees:",
    amountRupees,
    "receipt:",
    receipt,
  );
  if (!amountRupees || isNaN(amountRupees) || amountRupees <= 0) {
    console.log("Invalid amountRupees");
    throw new Error("Invalid amount for Razorpay order");
  }
  const razorpay = getRazorpayClient();
  const safeAmountRupees = Math.round(amountRupees);
  const amountPaise = safeAmountRupees * 100;

  console.log("amountPaise:", amountPaise);
  if (amountPaise < 100) {
    console.log("Amount too small");
    throw new Error("Minimum order amount is ₹1");
  }
  const safeReceipt = receipt.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
  console.log(
    "Creating order with amount:",
    amountPaise,
    "receipt:",
    safeReceipt,
  );
  const order = (await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: safeReceipt || `rcpt_${Date.now()}`,
    payment_capture: true,
  })) as { id: string };
  console.log("Order created:", order.id);
  return { order, amountPaise };
}

export function verifyPaymentSignature(
  orderId: string,
  razorpayPaymentId: string,
  signature: string,
): boolean {
  const { key_secret } = requireKeys();
  const body = `${orderId}|${razorpayPaymentId}`;
  const expected = crypto
    .createHmac("sha256", key_secret)
    .update(body)
    .digest("hex");
  return expected === signature;
}

export function verifyWebhookSignature(
  rawBody: Buffer,
  signature: string,
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "Razorpay webhook secret not configured (RAZORPAY_WEBHOOK_SECRET)",
    );
  }
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}
