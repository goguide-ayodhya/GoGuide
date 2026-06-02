/**
 * Finance Utilities - All calculations use Math.round() for no decimal amounts
 */

export const COMMISSION_RULES = {
  MIN: 0,
  MAX: 100,
  DEFAULT: 20,
};

/**
 * Calculate admin commission from driver earnings
 * @param earnings Total driver earnings
 * @param commissionPercent Commission percentage (0-100)
 * @returns Admin commission amount (rounded)
 */
export function calculateAdminCommission(
  earnings: number,
  commissionPercent: number
): number {
  return Math.round((earnings * commissionPercent) / 100);
}

/**
 * Calculate driver's net amount after commission
 * @param earnings Total driver earnings
 * @param commissionPercent Commission percentage (0-100)
 * @returns Driver's net amount (rounded)
 */
export function calculateDriverNet(
  earnings: number,
  commissionPercent: number
): number {
  return Math.round(earnings - (earnings * commissionPercent) / 100);
}

/**
 * Format currency for display
 * @param amount Amount in paise/cents
 * @param currency Currency symbol (default: ₹)
 * @returns Formatted string
 */
export function formatCurrency(amount: number, currency: string = "₹"): string {
  return `${currency}${Math.round(amount).toLocaleString()}`;
}

/**
 * Validate commission percentage
 * @param percent Percentage to validate
 * @returns Boolean indicating if valid
 */
export function isValidCommissionPercent(percent: number): boolean {
  return (
    Number.isFinite(percent) &&
    percent >= COMMISSION_RULES.MIN &&
    percent <= COMMISSION_RULES.MAX
  );
}

/**
 * Validate payment amount
 * @param amount Amount to validate
 * @param maxAmount Maximum allowed amount
 * @returns Boolean indicating if valid
 */
export function isValidPaymentAmount(amount: number, maxAmount?: number): boolean {
  if (!Number.isFinite(amount) || amount <= 0) return false;
  if (maxAmount !== undefined && amount > maxAmount) return false;
  // Check if it's a whole number (no decimals after rounding)
  return Math.round(amount) === amount;
}

/**
 * Calculate financial summary for display
 */
export interface FinancialSummary {
  totalEarned: number;
  commissionPercent: number;
  adminShare: number;
  driverShare: number;
  pending: number;
}

export function calculateFinancialSummary(
  totalEarned: number,
  commissionPercent: number,
  adminPaid: number,
  adminGenerated?: number
): FinancialSummary {
  const adminShare = adminGenerated ?? calculateAdminCommission(totalEarned, commissionPercent);
  const driverShare = calculateDriverNet(totalEarned, commissionPercent);
  const pending = Math.max(0, adminShare - adminPaid);

  return {
    totalEarned: Math.round(totalEarned),
    commissionPercent,
    adminShare: Math.round(adminShare),
    driverShare: Math.round(driverShare),
    pending: Math.round(pending),
  };
}

/**
 * Generate payment example for display
 */
export function generatePaymentExample(
  exampleEarning: number = 1000,
  commissionPercent: number = 20
): {
  earning: number;
  adminCommission: number;
  driverAmount: number;
} {
  return {
    earning: Math.round(exampleEarning),
    adminCommission: calculateAdminCommission(exampleEarning, commissionPercent),
    driverAmount: calculateDriverNet(exampleEarning, commissionPercent),
  };
}
