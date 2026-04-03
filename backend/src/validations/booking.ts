import { z } from 'zod';

export const createBookingSchema = z.object({
  guideId: z.string().min(1, 'Guide ID is required'),
  touristName: z.string().min(2, 'Tourisst name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone required'),
  groupSize: z.number().min(1).max(100),
  bookingDate: z.string().datetime('Valid date required'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Valid start time required'),
  tourType: z.string().min(1),
  meetingPoint: z.string().min(1),
  dropoffLocation: z.string().min(1),
  totalPrice: z.number().min(0),
  notes: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'ON_THE_WAY', 'COMPLETED', 'CANCELLED']),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
