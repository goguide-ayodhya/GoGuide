import { PlatformSetting } from "../models/PlatformSetting";

import { Resend } from "resend";

const DEFAULT_CAB_PRICING = {
  baseFare: 50,
  pricePerKm: 12,
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
      from: "GoGuide <onboarding@resend.dev>",
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
}

export const settingsService = new SettingsService();
