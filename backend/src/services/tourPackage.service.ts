import { TourPackage } from "../models/Tour";
import { NotFound } from "../utils/httpException";

export class TourPackageService {
  async createPackage(userId: string, data: any) {
    return TourPackage.create({
      ...data,
      createdBy: userId,
    });
  }

  async getAllPackages() {
    return TourPackage.find().sort({ createdAt: -1 });
  }

  async getPackageById(id: string) {
    const pkg = await TourPackage.findById(id);
    if (!pkg) throw new NotFound("Package not found");
    return pkg;
  }

  async updatePackage(id: string, data: any) {
    const pkg = await TourPackage.findByIdAndUpdate(id, data, { new: true });
    if (!pkg) throw new NotFound("Package not found");
    return pkg;
  }

  async deletePackage(id: string) {
    const pkg = await TourPackage.findByIdAndDelete(id);
    if (!pkg) throw new NotFound("Package not found");
    return { message: "Package deleted" };
  }
}

export const tourPackageService = new TourPackageService();
