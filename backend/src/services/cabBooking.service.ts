import { CabBooking, ICabBooking } from "../models/CabBooking";

export class CabBookingService {
  async createBooking(data: Partial<ICabBooking>): Promise<ICabBooking> {
    return await CabBooking.create(data);
  }

  async getBookingsByUser(userId: string): Promise<ICabBooking[]> {
    return await CabBooking.find({ userId }).sort({ createdAt: -1 });
  }

  async getAllBookings(): Promise<ICabBooking[]> {
    return await CabBooking.find({})
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });
  }

  async getBookingById(id: string): Promise<ICabBooking | null> {
    return await CabBooking.findById(id);
  }

  async updateStatus(id: string, status: string): Promise<ICabBooking | null> {
    return await CabBooking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("userId", "name email phone");
  }
}

export const cabBookingService = new CabBookingService();
