import { TourPackage } from "../models/Tour";
import { NotFound, BadRequest } from "../utils/httpException";
import { Types } from "mongoose";

export class TourPackageService {
  async createPackage(data: any, adminId?: string) {
    const payload: any = { ...data };

    // basic validations
    if (!payload.title || typeof payload.title !== "string") {
      throw new BadRequest("Title is required");
    }
    if (!payload.location || typeof payload.location !== "string") {
      throw new BadRequest("Location is required");
    }
    // support locations array (new) or old itinerary
    if ((!payload.locations || !Array.isArray(payload.locations) || payload.locations.length === 0) && (!payload.itinerary || !Array.isArray(payload.itinerary) || payload.itinerary.length === 0)) {
      throw new BadRequest("Locations are required");
    }
    if (!payload.duration || payload.duration <= 0) {
      throw new BadRequest("Invalid duration");
    }
    if (!payload.price || payload.price <= 0) {
      throw new BadRequest("Invalid price");
    }

    // normalize numeric fields
    payload.price = Number(payload.price);
    payload.basePrice = payload.basePrice ? Number(payload.basePrice) : 0;
    payload.cabPrice = payload.cabPrice ? Number(payload.cabPrice) : 0;
    payload.guidePrice = payload.guidePrice ? Number(payload.guidePrice) : 0;
    if (payload.discount) payload.discount = Number(payload.discount);
    if (payload.soldCount === undefined) payload.soldCount = 0;

    // normalize locations: if itinerary provided, map to location strings
    if (payload.itinerary && Array.isArray(payload.itinerary) && payload.itinerary.length > 0 && (!payload.locations || payload.locations.length === 0)) {
      payload.locations = payload.itinerary.map((s: any) => (typeof s.location === "string" ? s.location : s.location?.city || s.title || "")).filter(Boolean);
    }

    if (!payload.locations) payload.locations = [];

    if (adminId) payload.createdBy = new Types.ObjectId(adminId);

    const created = await TourPackage.create(payload);
    return created;
  }

  async getAllPackages(filters?: any) {
    const query: any = {};
    if (filters?.isActive !== undefined) query.isActive = filters.isActive;
    if (filters?.type) query.type = filters.type;
    // price range
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice !== undefined) query.price.$lte = Number(filters.maxPrice);
    }

    if (filters?.q) {
      const q = new RegExp(filters.q, "i");
      query.$or = [{ title: q }, { description: q }, { location: q }, { state: q }];
    }

    return await TourPackage.find(query).sort({ createdAt: -1 });
  }

  async getPackageById(id: string) {
    const pkg = await TourPackage.findById(id);
    if (!pkg) throw new NotFound("Package not found");
    return pkg;
  }

  async updatePackage(id: string, data: any) {

    if (data.itinerary) {
      if (!Array.isArray(data.itinerary) || data.itinerary.length === 0) {
        throw new BadRequest("Itinerary cannot be empty");
      }
      // convert itinerary to locations if needed
      data.locations = data.itinerary.map((s: any) => (typeof s.location === "string" ? s.location : s.location?.city || s.title || "")).filter(Boolean);
      delete data.itinerary;
    }

    if (data.locations && (!Array.isArray(data.locations) || data.locations.length === 0)) {
      throw new BadRequest("Locations cannot be empty");
    }

    // normalize numeric fields if provided
    if (data.price !== undefined) data.price = Number(data.price);
    if (data.basePrice !== undefined) data.basePrice = Number(data.basePrice);
    if (data.cabPrice !== undefined) data.cabPrice = Number(data.cabPrice);
    if (data.guidePrice !== undefined) data.guidePrice = Number(data.guidePrice);
    if (data.discount !== undefined) data.discount = Number(data.discount);

    const pkg = await TourPackage.findByIdAndUpdate(id, data, { new: true });
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
