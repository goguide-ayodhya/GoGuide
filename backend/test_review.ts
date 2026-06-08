import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Ride } from './src/models/Ride';

dotenv.config();

async function run() {
  const mongoUri = process.env.DATABASE_URL;
  if (!mongoUri) {
    console.error("DATABASE_URL is not defined in env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");

  // Fetch a completed ride
  const ride = await Ride.findOne({ status: 'completed' });
  if (!ride) {
    console.log("No completed ride found to test. Trying to find any ride...");
    const anyRide = await Ride.findOne();
    if (!anyRide) {
      console.log("No rides found at all.");
      await mongoose.disconnect();
      return;
    }
    console.log("Found ride:", anyRide._id, "Status:", anyRide.status);
    await testWithRide(anyRide);
  } else {
    console.log("Found completed ride:", ride._id);
    await testWithRide(ride);
  }
}

async function testWithRide(ride: any) {
  try {
    console.log("Attempting to save review skip...");
    
    // Save original status and review
    const originalStatus = ride.status;
    const originalReview = ride.review;

    // Simulate skip review logic
    ride.review = {
      rating: 0,
      text: 'Review skipped',
      submittedAt: new Date(),
      skipped: true
    };
    ride.status = 'reviewed';
    
    await ride.save();
    console.log("SUCCESS: Review skip saved successfully!");

    // Restore original status and review to not corrupt DB
    ride.status = originalStatus;
    ride.review = originalReview;
    await ride.save();
    console.log("SUCCESS: Original ride state restored.");
  } catch (error) {
    console.error("FAILURE: Error saving review skip:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
