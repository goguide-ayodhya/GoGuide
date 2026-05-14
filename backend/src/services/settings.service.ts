import { PlatformSetting } from "../models/PlatformSetting";

import { Resend } from "resend";

const DEFAULT_CAB_PRICING = {
  baseFare: 50,
  pricePerKm: 12,
};

const DEFAULT_RIDE_PRICING = {
  baseFare: {
    auto: 30,
    car: 50,
    moto: 20
  },
  perKmRate: {
    auto: 10,
    car: 15,
    moto: 8
  },
  perMinuteRate: {
    auto: 2,
    car: 3,
    moto: 1.5
  }
};

const resend = new Resend(process.env.RESEND_API_KEY);

export class SettingsService {
  async sendMail({
    to,
    subject,
    text,
  }: {
    to: string;
    subject: string;
    text: string;
  }) {
    await resend.emails.send({
      from: "GoGuide <support@goguide.in>",
      to,
      subject,
      html: `<p>${text}</p>`,
    });
  }

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

  async getRidePricing() {
    const pricing = await PlatformSetting.findOne({ key: "ridePricing" });
    if (!pricing) {
      return DEFAULT_RIDE_PRICING;
    }

    return pricing.value;
  }

  async updateRidePricing(data: typeof DEFAULT_RIDE_PRICING) {
    const pricing = await PlatformSetting.findOneAndUpdate(
      { key: "ridePricing" },
      { value: data },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return pricing!.value;
  }
}

export const settingsService = new SettingsService();
