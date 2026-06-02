import { Ride } from "../models/Ride";
import * as mapService from "./maps.service";
import crypto from "crypto";
import { settingsService } from "./settings.service";

export async function getFare(pickup: string, destination: string) {
  const pricing = await settingsService.getRidePricing();
  console.log("LIVE PRICING:", pricing);

  if (!pickup || !destination) {
    throw new Error("Pickup and destination are required");
  }

  const distanceTime = await mapService.getDistanceTime(pickup, destination);
  const distance = distanceTime.distance;
  const duration = distanceTime.duration;

  const fare = {
    auto: Math.round(
      (distance.value / 1000) * pricing.perKmRate.auto +
        (duration.value / 60) * pricing.perMinuteRate.auto +
        pricing.baseFare.auto,
    ),
    car: Math.round(
      (distance.value / 1000) * pricing.perKmRate.car +
        (duration.value / 60) * pricing.perMinuteRate.car +
        pricing.baseFare.car,
    ),
    moto: Math.round(
      (distance.value / 1000) * pricing.perKmRate.moto +
        (duration.value / 60) * pricing.perMinuteRate.moto +
        pricing.baseFare.moto,
    ),
  };

  return fare;
}

function getOtp(num: number) {
  return crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
}

export const createRide = async ({
  user,
  pickup,
  destination,
  vehicleType,
}: {
  user: any;
  pickup: string;
  destination: string;
  vehicleType: "auto" | "car" | "moto";
}) => {
  if (!user || !pickup || !destination || !vehicleType) {
    throw new Error("All fields are required");
  }

  const fare = await getFare(pickup, destination);

  const ride = await Ride.create({
    user,
    pickup,
    destination,
    otp: getOtp(6),
    fare: fare[vehicleType],
  });

  return ride;
};

export const confirmRide = async ({
  rideId,
  driver,
}: {
  rideId: string;
  driver: any;
}) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  await Ride.findOneAndUpdate(
    { _id: rideId },
    { status: "accepted", driver: driver._id },
  );

  const ride = await Ride.findOne({ _id: rideId })
    .populate("user")
    .populate({
      path: "driver",
      populate: { path: "userId", model: "User" },
    })
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  return ride;
};

export const startRide = async ({
  rideId,
  otp,
  driver,
}: {
  rideId: string;
  otp: string;
  driver: any;
}) => {
  if (!rideId || !otp) {
    throw new Error("Ride id and OTP are required");
  }

  const ride = await Ride.findOne({ _id: rideId })
    .populate("user")
    .populate("driver")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  // [RIDE_STATE_MACHINE] Strict status guard
  if (ride.status !== "accepted") {
    throw new Error(`Ride cannot be started — current status: ${ride.status}`);
  }

  if (ride.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  await Ride.findOneAndUpdate({ _id: rideId }, { status: "ongoing" });

  return ride;
};

export const endRide = async ({
  rideId,
  driver,
}: {
  rideId: string;
  driver: any;
}) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  const ride = await Ride.findOne({ _id: rideId, driver: driver._id })
    .populate("user")
    .populate("driver")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  // [RIDE_STATE_MACHINE] Strict status guard
  if (ride.status !== "ongoing") {
    throw new Error(`Ride cannot be ended — current status: ${ride.status}`);
  }

  // Calculate distance and duration using Google Maps API
  let distanceValue = 0;
  let durationValue = 0;

  try {
    const distanceTime = await mapService.getDistanceTime(ride.pickup, ride.destination);
    distanceValue = distanceTime.distance?.value || 0; // in meters
    durationValue = distanceTime.duration?.value || 0; // in seconds
    console.log("[RIDE_STATE_MACHINE] Distance and duration calculated:", { distanceValue, durationValue });
  } catch (error) {
    console.error("[RIDE_STATE_MACHINE] Error calculating distance/duration:", error);
  }

  // Transition: ongoing → payment_pending
  await Ride.findOneAndUpdate(
    { _id: rideId },
    { status: "payment_pending", distance: distanceValue, duration: durationValue },
  );

  const updatedRide = await Ride.findOne({ _id: rideId })
    .populate("user")
    .populate("driver");

  if (!updatedRide) {
    throw new Error("Ride not found after update");
  }

  return updatedRide;
};

// ============================================================
// CANCEL RIDE SERVICE
// [RIDE_STATE_MACHINE] Only allowed from: pending | accepted
// Blocked for: ongoing | payment_pending | completed | reviewed
// ============================================================
export const cancelRide = async ({
  rideId,
  userId,
}: {
  rideId: string;
  userId: string;
}) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  const ride = await Ride.findById(rideId)
    .populate("user")
    .populate({
      path: "driver",
      populate: { path: "userId", model: "User" },
    });

  if (!ride) {
    throw new Error("Ride not found");
  }

  // Strict cancel guard — only searching (pending) or accepted
  const cancellableStatuses = ["pending", "accepted"];
  if (!cancellableStatuses.includes(ride.status)) {
    console.warn(
      `[RIDE_STATE_MACHINE] Cancel rejected — ride ${rideId} has status: ${ride.status}`
    );
    throw new Error(
      `Cannot cancel ride in status: ${ride.status}. Cancellation only allowed during searching or accepted.`
    );
  }

  // Verify the user requesting cancel is the ride owner
  const rideUser = ride.user as any;
  if (rideUser._id.toString() !== userId) {
    throw new Error("Unauthorized: only the ride owner can cancel");
  }

  await Ride.findByIdAndUpdate(rideId, { status: "cancelled" });

  // Return fresh populated ride
  const updatedRide = await Ride.findById(rideId)
    .populate("user")
    .populate({
      path: "driver",
      populate: { path: "userId", model: "User" },
    });

  console.log(`[RIDE_STATE_MACHINE] Ride ${rideId} → cancelled (by user ${userId})`);
  return updatedRide;
};
