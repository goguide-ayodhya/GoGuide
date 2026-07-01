import { AdminSettings, IAdminSettings } from "../models/AdminSettings";

export class AdminSettingsService {
  async getSettings(): Promise<IAdminSettings> {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = await AdminSettings.create({
        driverCommissionPercent: 20,
      });
    }
    return settings;
  }

  async updateCommissionPercent(percent: number, adminId: string): Promise<IAdminSettings> {
    if (percent < 0 || percent > 100) {
      throw new Error("Commission percent must be between 0 and 100");
    }

    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = await AdminSettings.create({
        driverCommissionPercent: percent,
        lastUpdatedBy: adminId,
        lastUpdatedAt: new Date(),
      });
    } else {
      settings.driverCommissionPercent = percent;
      settings.lastUpdatedBy = adminId;
      settings.lastUpdatedAt = new Date();
      await settings.save();
    }

    return settings;
  }

  async getCommissionPercent(): Promise<number> {
    const settings = await this.getSettings();
    return settings.driverCommissionPercent;
  }

  async updateGuidePricing(
    pricing: NonNullable<IAdminSettings["guidePricing"]>,
    adminId: string
  ): Promise<IAdminSettings> {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = await AdminSettings.create({
        driverCommissionPercent: 20,
        guidePricing: pricing,
        lastUpdatedBy: adminId,
        lastUpdatedAt: new Date(),
      });
    } else {
      settings.guidePricing = pricing;
      settings.lastUpdatedBy = adminId;
      settings.lastUpdatedAt = new Date();
      await settings.save();
    }
    return settings;
  }

  async updateLocations(
    locations: string[] | { halfDay: string[]; fullDay: string[] },
    adminId: string
  ): Promise<IAdminSettings> {
    const normalizedLocations = Array.isArray(locations)
      ? locations
      : [...(locations.halfDay || []), ...(locations.fullDay || [])];
    const normalizedByTourType = Array.isArray(locations)
      ? { halfDay: locations, fullDay: locations }
      : {
          halfDay: locations.halfDay || [],
          fullDay: locations.fullDay || [],
        };

    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = await AdminSettings.create({
        driverCommissionPercent: 20,
        locations: normalizedLocations,
        locationsByTourType: normalizedByTourType,
        lastUpdatedBy: adminId,
        lastUpdatedAt: new Date(),
      });
    } else {
      settings.locations = normalizedLocations;
      settings.locationsByTourType = normalizedByTourType;
      settings.lastUpdatedBy = adminId;
      settings.lastUpdatedAt = new Date();
      await settings.save();
    }
    return settings;
  }

  async updateVehicleTypes(vehicleTypes: string[], adminId: string): Promise<IAdminSettings> {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = await AdminSettings.create({
        driverCommissionPercent: 20,
        vehicleTypes,
        lastUpdatedBy: adminId,
        lastUpdatedAt: new Date(),
      });
    } else {
      settings.vehicleTypes = vehicleTypes;
      settings.lastUpdatedBy = adminId;
      settings.lastUpdatedAt = new Date();
      await settings.save();
    }
    return settings;
  }

  async updatePaymentQR(qr: { url: string; isEnabled: boolean; upiId?: string; merchantName?: string }, adminId: string): Promise<IAdminSettings> {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = await AdminSettings.create({
        driverCommissionPercent: 20,
        paymentQR: qr,
        lastUpdatedBy: adminId,
        lastUpdatedAt: new Date(),
      });
    } else {
      settings.paymentQR = {
        url: qr.url,
        isEnabled: qr.isEnabled,
        upiId: qr.upiId || settings.paymentQR?.upiId || "",
        merchantName: qr.merchantName || settings.paymentQR?.merchantName || "",
      };
      settings.lastUpdatedBy = adminId;
      settings.lastUpdatedAt = new Date();
      await settings.save();
    }
    return settings;
  }
}

export const adminSettingsService = new AdminSettingsService();
