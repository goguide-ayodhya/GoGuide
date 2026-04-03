import { Cab } from "../models/Cab";
import { NotFound } from "../utils/httpException";

export class CabService {
  async createCab(userId: string, data: any) {
    const cab = await Cab.create({
      ...data,
      userId,
    });
    return cab;
  }

  async getMyCabs(userId: string) {
    return Cab.find({ userId }).sort({ createdAt: -1 });
  }

  async cancelCab(cabId: string, userId: string) {
    const cab = await Cab.findById(cabId);

    if (!cab) throw new NotFound("Cab not found");

    if (cab.userId.toString() !== userId) {
      throw new Error("Not your cab booking");
    }

    cab.status = "CANCELLED";
    await cab.save();

    return cab;
  }
}

export const cabService = new CabService();
