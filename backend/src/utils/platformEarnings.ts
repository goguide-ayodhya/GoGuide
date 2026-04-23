import { roundMoney } from "./bookingPricing";

const GUIDE_SHARE = 0.7;
const PLATFORM_SHARE = 0.3;

/**
 * Compute platform split on the taxable base (exclude GST) if `finalPrice` is GST-inclusive.
 * Assumes finalPrice is inclusive of 18% GST. This returns guide and platform shares
 * computed on the base amount (finalPrice / 1.18).
 */
export function computePlatformSplit(finalPrice: number): {
  guideEarning: number;
  adminCommission: number;
} {
  const fp = roundMoney(finalPrice);
  // derive taxable base assuming 18% GST included
  const base = roundMoney(fp / 1.18);
  return {
    guideEarning: roundMoney(base * GUIDE_SHARE),
    adminCommission: roundMoney(base * PLATFORM_SHARE),
  };
}
