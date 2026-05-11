import { Driver } from "../models/Driver";
import { User } from "../models/User";
import { BadRequest, NotFound } from "../utils/httpException";

export class DriverService {
  async createDriverProfile(userId: string, data: any) {
    console.log("[DRIVER-SERVICE] Creating driver profile for user:", userId, "with data:", data);
    const existingProfile = await Driver.findOne({ userId });
    if (existingProfile) {
      console.log("[DRIVER-SERVICE] Driver profile already exists for user:", userId, "Updating instead...");
      return this.updateDriverProfile(userId, data);
    }

    const driver = await Driver.create({
      ...data,
      userId,
    });
    console.log("[DRIVER-SERVICE] Driver profile created with ID:", driver._id);

    // CRITICAL: Update User model to mark profile as complete
    console.log("[DRIVER-SERVICE] Updating User model to mark profile as complete");
    await User.findByIdAndUpdate(userId, {
      isProfileComplete: true,
      status: "ACTIVE",
      profileStep: 5 // Final step completed
    });

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
    console.log("[DRIVER-SERVICE] Updating driver profile for user:", userId, "with data:", data);
    const driver = await Driver.findOneAndUpdate({ userId }, data, {
      new: true,
    });
    if (!driver) {
      throw new NotFound("Driver not found");
    }
    
    // CRITICAL: Check if all required fields are present to mark profile as complete
    const isComplete = driver.driverName && 
                      driver.vehicleType && 
                      driver.vehicleName && 
                      driver.vehicleNumber && 
                      driver.seats && 
                      driver.driverLicenseName &&
                      driver.driverPhoto &&
                      driver.driverLicense;

    if (isComplete) {
      console.log("[DRIVER-SERVICE] Profile is complete, updating User model");
      await User.findByIdAndUpdate(userId, {
        isProfileComplete: true,
        status: "ACTIVE",
        profileStep: 5 // Final step completed
      });
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
