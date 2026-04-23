import { PlatformSetting } from "../models/PlatformSetting";

import nodemailer from "nodemailer";

const DEFAULT_CAB_PRICING = {
  baseFare: 50,
  pricePerKm: 12,
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
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
