import { Driver } from "../models/Driver";
import { BadRequest, NotFound } from "../utils/httpException";

export class DriverService {
  async createDriverProfile(userId: string, data: any) {
    console.log("[DRIVER-SERVICE] Creating driver profile for user:", userId, "with data:", data);
    const existingProfile = await Driver.findOne({ userId });
    if (existingProfile) {
      console.log("[DRIVER-SERVICE] Driver profile already exists for user:", userId);
      throw new BadRequest("Driver Profile already exist");
    }

    const driver = await Driver.create({
      ...data,
      userId,
    });
    console.log("[DRIVER-SERVICE] Driver profile created with ID:", driver._id);

    return driver;
  }

  async getAllDrivers(filters?: any) {
    const query: any = {
      verificationStatus: "VERIFIED",
      isAvailable: true,
    };

    if (filters?.all) {
      delete query.verificationStatus;
      delete query.isAvailable;
    }

    const drivers = await Driver.find(query)
      .populate("userId", "name avatar email phone")
      .sort({ averageRating: -1 });

    return drivers;
  }

  async getAllDriversForAdmin() {
    const drivers = await Driver.find({})
      .populate("userId", "name avatar email phone")
      .sort({ createdAt: -1 });

    return drivers;
  }

  async getDriverById(driverId: string) {
    const driver = await Driver.findById(driverId).populate("userId");
    if (!driver) {
      throw new NotFound("Driver not found");
    }
    return driver;
  }

  async getDriverByUserId(userId: string) {
    const driver = await Driver.findOne({ userId }).populate("userId");
    if (!driver) {
      throw new NotFound("Driver Profile not found");
    }
    return driver;
  }

  async updateDriverProfile(userId: string, data: any) {
    const driver = await Driver.findOneAndUpdate({ userId }, data, {
      new: true,
    });
    if (!driver) {
      throw new NotFound("Driver not found");
    }
    return driver;
  }

  async setAvailability(userId: string, isAvailable: boolean) {
    const driver = await Driver.findOneAndUpdate(
      { userId },
      { isAvailable },
      { new: true },
    );
    if (!driver) {
      throw new NotFound("Driver not found");
    }
    return driver;
  }

  async verifyDriver(driverId: string) {
    return Driver.findByIdAndUpdate(
      driverId,
      { verificationStatus: "VERIFIED" },
      { new: true },
    );
  }

  async rejectDriver(driverId: string) {
    return Driver.findByIdAndUpdate(
      driverId,
      { verificationStatus: "REJECTED" },
      { new: true },
    );
  }
}

export const driverService = new DriverService();
