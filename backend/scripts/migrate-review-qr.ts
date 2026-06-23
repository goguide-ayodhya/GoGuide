import { Guide } from "./src/models/Guide";
import QRCode from "qrcode";
import { uploadBufferToStorage } from "./src/services/fileUpload.service";
import crypto from "crypto";
import mongoose from "mongoose";

async function migrateGuideReviewQR() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/tourist-app";
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB");

    // Find all guides without reviewQRToken
    const guidesWithoutToken = await Guide.find({ 
      $or: [
        { reviewQRToken: { $exists: false } },
        { reviewQRToken: null },
        { reviewQRToken: "" }
      ]
    });

    console.log(`\nFound ${guidesWithoutToken.length} guides without reviewQRToken`);

    const clientBase = process.env.CLIENT_BASE_URL || process.env.FRONTEND_BASE_URL || `http://localhost:3000`;
    let success = 0;
    let failed = 0;

    for (const guide of guidesWithoutToken) {
      try {
        // Generate new token
        const newToken = crypto.randomUUID();
        guide.reviewQRToken = newToken;
        guide.reviewCollectionEnabled = true;

        // Generate QR code
        const reviewUrl = `${clientBase.replace(/\/$/, "")}/tourist/guides/review/${newToken}`;
        try {
          const pngBuffer = await QRCode.toBuffer(reviewUrl, { type: "png", width: 400 });
          const uploadedUrl = await uploadBufferToStorage(pngBuffer, `guide-${guide._id}-review-qr.png`);
          guide.reviewQRImage = uploadedUrl;
        } catch (qrErr) {
          console.warn(`  ⚠ QR generation failed for guide ${guide._id}: ${qrErr}`);
          // Continue without QR image
        }

        await guide.save();
        success++;
        console.log(`  ✓ Migrated guide ${guide._id.toString().slice(0, 8)}... (token: ${newToken.slice(0, 8)}...)`);
      } catch (err: any) {
        failed++;
        console.error(`  ✗ Failed to migrate guide ${guide._id}: ${err.message}`);
      }
    }

    console.log(`\n✓ Migration complete: ${success} guides updated, ${failed} failed`);

    // Summary
    const guideCount = await Guide.countDocuments();
    const guidesWithToken = await Guide.countDocuments({ reviewQRToken: { $exists: true, $ne: "" } });
    console.log(`\nSummary: ${guidesWithToken}/${guideCount} guides have reviewQRToken`);

    await mongoose.connection.close();
    console.log("✓ Database connection closed");
  } catch (err: any) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrateGuideReviewQR();
