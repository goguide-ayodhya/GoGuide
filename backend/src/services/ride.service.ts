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
    {
      _id: rideId,
    },
    {
      status: "accepted",
      driver: driver._id,
    },
  );

  const ride = await Ride.findOne({
    _id: rideId,
  })
    .populate("user")
    .populate({
      path: "driver",
      populate: {
        path: "userId",
        model: "User",
      },
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

  const ride = await Ride.findOne({
    _id: rideId,
  })
    .populate("user")
    .populate("driver")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "accepted") {
    throw new Error("Ride not accepted");
  }

  if (ride.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  await Ride.findOneAndUpdate(
    {
      _id: rideId,
    },
    {
      status: "ongoing",
    },
  );

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

  const ride = await Ride.findOne({
    _id: rideId,
    driver: driver._id,
  })
    .populate("user")
    .populate("driver")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "ongoing") {
    throw new Error("Ride not ongoing");
  }

  await Ride.findOneAndUpdate(
    {
      _id: rideId,
    },
    {
      status: "completed",
    },
  );

  return ride;
};
