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

  async updateLocations(locations: string[], adminId: string): Promise<IAdminSettings> {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = await AdminSettings.create({
        driverCommissionPercent: 20,
        locations,
        lastUpdatedBy: adminId,
        lastUpdatedAt: new Date(),
      });
    } else {
      settings.locations = locations;
      settings.lastUpdatedBy = adminId;
      settings.lastUpdatedAt = new Date();
      await settings.save();
    }
    return settings;
  }

  async updatePaymentQR(qr: { url: string; isEnabled: boolean }, adminId: string): Promise<IAdminSettings> {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = await AdminSettings.create({
        driverCommissionPercent: 20,
        paymentQR: qr,
        lastUpdatedBy: adminId,
        lastUpdatedAt: new Date(),
      });
    } else {
      settings.paymentQR = qr;
      settings.lastUpdatedBy = adminId;
      settings.lastUpdatedAt = new Date();
      await settings.save();
    }
    return settings;
  }
}

export const adminSettingsService = new AdminSettingsService();
