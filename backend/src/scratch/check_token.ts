import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

import { Guide } from "../models/Guide";
import { User } from "../models/User";

async function run() {
  const mongoUri = "mongodb://127.0.0.1:27017/tour-guide-db";
  await mongoose.connect(mongoUri);

  console.log("Listing all guides in DB...");
  const guides = await Guide.find({}).populate("userId");
  console.log(`Total guides: ${guides.length}`);
  for (const g of guides) {
    const u = g.userId as any;
    console.log({
      _id: g._id,
      guideName: u ? u.name : "N/A",
      email: u ? u.email : "N/A",
      reviewQRToken: g.reviewQRToken,
      reviewCollectionEnabled: g.reviewCollectionEnabled,
    });
  }

  await mongoose.disconnect();
}

run().catch(console.error);
