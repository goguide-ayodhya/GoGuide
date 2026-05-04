import { roundMoney } from "./bookingPricing";
import { PRICING_CONFIG } from "../config/pricing";

/**
 * Compute platform split on the base price (excluding GST).
 * Guide gets GUIDE_PAYOUT_RATE (70%), Admin gets PLATFORM_COMMISSION_RATE (30%).
 * If there is a discount, it is subtracted from the admin's commission.
 */
export function computePlatformSplit(basePrice: number, discount: number = 0): {
  guideEarning: number;
  adminCommission: number;
} {
  return {
    guideEarning: roundMoney(basePrice * PRICING_CONFIG.GUIDE_PAYOUT_RATE),
    adminCommission: roundMoney((basePrice * PRICING_CONFIG.PLATFORM_COMMISSION_RATE) - discount),
  };
}
