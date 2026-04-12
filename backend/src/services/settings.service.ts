import { PlatformSetting } from "../models/PlatformSetting";

const DEFAULT_CAB_PRICING = {
  baseFare: 50,
  pricePerKm: 12,
};

export class SettingsService {
  async getCabPricing() {
    const pricing = await PlatformSetting.findOne({ key: "cabPricing" });
    if (!pricing) {
      return DEFAULT_CAB_PRICING;
    }

    return pricing.value;
  }

  async updateCabPricing(data: { baseFare: number; pricePerKm: number }) {
    const pricing = await PlatformSetting.findOneAndUpdate(
      { key: "cabPricing" },
      { value: data },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return pricing!.value;
  }
}

export const settingsService = new SettingsService();
