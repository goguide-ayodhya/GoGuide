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
}

export const tourPackageService = new TourPackageService();
