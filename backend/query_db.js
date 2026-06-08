const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// We need to require models manually
// Define Schemas or just fetch collections since Mongoose models might throw overlap errors if registered twice.
// Since Mongoose registers schemas, let's connect and retrieve raw collection data to be completely safe from import/compilation issues.

async function run() {
  const mongoUri = process.env.DATABASE_URL;
  if (!mongoUri) {
    console.error("DATABASE_URL is not defined in env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");

  // Get raw collections
  const db = mongoose.connection.db;
  
  // Find latest ride
  const latestRides = await db.collection('rides').find().sort({ createdAt: -1 }).limit(1).toArray();
  if (latestRides.length === 0) {
    console.log("No rides found in DB.");
    await mongoose.disconnect();
    return;
  }

  const latestRide = latestRides[0];
  console.log("\n================ LATEST RIDE IN DB ================");
  console.log("Ride ID:", latestRide._id);
  console.log("Status:", latestRide.status);
  console.log("Tourist (User) ID:", latestRide.user);
  console.log("Driver ID:", latestRide.driver);

  // Find Tourist User details
  const tourist = await db.collection('users').findOne({ _id: latestRide.user });
  console.log("Tourist Name:", tourist ? tourist.name : "N/A");
  console.log("Tourist Role:", tourist ? tourist.role : "N/A");
  console.log("Tourist Socket ID:", tourist ? tourist.socketId : "N/A");

  // Find Driver details
  if (latestRide.driver) {
    const driver = await db.collection('drivers').findOne({ _id: latestRide.driver });
    console.log("\n================ DRIVER INFO ================");
    console.log("Driver ID:", driver ? driver._id : "N/A");
    console.log("Driver User ID:", driver ? driver.userId : "N/A");
    console.log("Driver Verification Status:", driver ? driver.verificationStatus : "N/A");
    console.log("Driver Name:", driver ? driver.driverName : "N/A");

    if (driver && driver.userId) {
      const driverUser = await db.collection('users').findOne({ _id: driver.userId });
      console.log("Driver User Socket ID:", driverUser ? driverUser.socketId : "N/A");
    }

    // Simulate getActiveRide response for Driver
    const driverActiveRide = await db.collection('rides').findOne({
      driver: latestRide.driver,
      status: { $in: ["accepted", "ongoing", "payment_pending"] }
    });
    console.log("\n================ DRIVER getActiveRide RESPONSE ================");
    console.log(driverActiveRide ? {
      _id: driverActiveRide._id,
      status: driverActiveRide.status,
      user: driverActiveRide.user,
      driver: driverActiveRide.driver,
    } : "NULL");
  }

  // Simulate getActiveRide response for Tourist
  const touristActiveRide = await db.collection('rides').findOne({
    user: latestRide.user,
    status: { $in: ["pending", "accepted", "ongoing", "payment_pending"] }
  });

  console.log("\n================ TOURIST getActiveRide RESPONSE ================");
  console.log(touristActiveRide ? {
    _id: touristActiveRide._id,
    status: touristActiveRide.status,
    user: touristActiveRide.user,
    driver: touristActiveRide.driver,
  } : "NULL");

  await mongoose.disconnect();
  console.log("\nDisconnected.");
}

run().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
