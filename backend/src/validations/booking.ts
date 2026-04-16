import { boolean, z } from "zod";

export const createBookingSchema = z
  .object({
    guideId: z.string().optional(),
    driverId: z.string().optional(),
    touristName: z.string().min(2, "Tourisst name required"),
    email: z.string().email("Valid email required"),
    phone: z.string().min(10, "Valid phone required"),
    groupSize: z.number().min(1).max(100),
    bookingDate: z.string().datetime("Valid date required"),
    bookingType: z.enum(["GUIDE", "DRIVER"]),

    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Valid start time required"),
    tourType: z.string().min(1),
    meetingPoint: z.string().min(1),
    dropoffLocation: z.string().min(1),
    totalPrice: z.number().min(0),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.bookingType === "GUIDE") {
      if (!data.guideId) {
        ctx.addIssue({
          path: ["guideId"],
          code: z.ZodIssueCode.custom,
          message: "guideId is required for GUIDE booking",
        });
      }
    }

    if (data.bookingType === "DRIVER") {
      if (!data.driverId) {
        ctx.addIssue({
          path: ["driverId"],
          code: z.ZodIssueCode.custom,
          message: "driverId is required for DRIVER booking",
        });
      }
    }
  });

export const updateBookingStatusSchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"]),
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<
  typeof updateBookingStatusSchema
>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
