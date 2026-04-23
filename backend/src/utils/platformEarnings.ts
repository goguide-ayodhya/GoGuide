import { roundMoney } from "./bookingPricing";

const GUIDE_SHARE = 0.7;
const PLATFORM_SHARE = 0.3;

/** 70% guide, 30% platform — applied on final collected price. */
export function computePlatformSplit(finalPrice: number): {
  guideEarning: number;
  adminCommission: number;
} {
  const fp = roundMoney(finalPrice);
  return {
    guideEarning: roundMoney(fp * GUIDE_SHARE),
    adminCommission: roundMoney(fp * PLATFORM_SHARE),
  };
}
