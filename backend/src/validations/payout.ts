import { z } from "zod";

export const createAdminPayoutSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
});

export type CreateAdminPayoutInput = z.infer<typeof createAdminPayoutSchema>;
