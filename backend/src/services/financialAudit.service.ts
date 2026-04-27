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
  async log(input: FinancialAuditInput, session?: any) {
    try {
      await FinancialAuditLog.create([input], { session });
    } catch (err) {
      console.warn("[FIN_AUDIT] log failed:", err);
    }
  }

  
}

export const financialAuditService = new FinancialAuditService();
