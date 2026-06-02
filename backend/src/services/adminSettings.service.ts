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
}

export const adminSettingsService = new AdminSettingsService();
