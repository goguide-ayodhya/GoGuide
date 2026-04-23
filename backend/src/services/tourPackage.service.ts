import { TourPackage } from "../models/Tour";
import { NotFound, BadRequest } from "../utils/httpException";
import { Types } from "mongoose";

export class TourPackageService {
  async createPackage(data: any, adminId?: string) {
    const payload = { ...data };

    if (!data.itinerary || data.itinerary.length === 0) {
      throw new BadRequest("Itinerary is required");
    }

    if (!data.duration || data.duration <= 0) {
      throw new BadRequest("Invalid duration");
    }

    if (!data.price || data.price <= 0) {
      throw new BadRequest("Invalid price");
    }

    data.itinerary = data.itinerary.sort((a: any, b: any) => a.order - b.order);

    if (adminId) payload.createdBy = new Types.ObjectId(adminId);

    const created = await TourPackage.create(payload);
    return created;
  }

  async getAllPackages(filters?: any) {
    const query: any = {};
    if (filters?.isActive !== undefined) query.isActive = filters.isActive;
    if (filters?.q) {
      const q = new RegExp(filters.q, "i");
      query.$or = [{ title: q }, { description: q }, { "location.city": q }];
    }

    return await TourPackage.find(query).sort({ createdAt: -1 });
  }

  async getPackageById(id: string) {
    const pkg = await TourPackage.findById(id);
    if (!pkg) throw new NotFound("Package not found");
    return pkg;
  }

  async updatePackage(id: string, data: any) {
    const pkg = await TourPackage.findByIdAndUpdate(id, data, { new: true });
    if (data.itinerary) {
      if (data.itinerary.length === 0) {
        throw new BadRequest("Itinerary cannot be empty");
      }

      data.itinerary = data.itinerary.sort(
        (a: any, b: any) => a.order - b.order,
      );
    }
    if (!pkg) throw new NotFound("Package not found");
    return pkg;
  }

  async deletePackage(id: string) {
    const pkg = await TourPackage.findByIdAndDelete(id);
    if (!pkg) throw new NotFound("Package not found");
    return pkg;
  }
}

export const tourPackageService = new TourPackageService();
