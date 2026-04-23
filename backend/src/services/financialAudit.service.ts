import { FinancialAuditLog } from "../models/FinancialAuditLog";

type FinancialAuditInput = {
  action: string;
  actorUserId?: string;
  actorRole?: string;
  bookingId?: string;
  paymentId?: string;
  refundId?: string;
  payoutId?: string;
  metadata?: Record<string, unknown>;
};

export class FinancialAuditService {
  async log(input: FinancialAuditInput) {
    try {
      await FinancialAuditLog.create(input);
    } catch (err) {
      // Non-blocking: operational logging should not fail payment/refund flows.
      console.warn("[FIN_AUDIT] log failed:", err);
    }
  }
}

export const financialAuditService = new FinancialAuditService();
