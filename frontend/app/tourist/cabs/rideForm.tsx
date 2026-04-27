"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useContext } from "react";

import {} from "lucide-react";

import LocationSearchPanel from "@/components/cabs/LocationSearchPanel";
import VehiclePanel from "@/components/cabs/VehiclePanel";
import ConfirmRide from "@/components/cabs/ConfirmRide";
import LookingForDriver from "@/components/cabs/LookingForDriver";
import WaitingForDriver from "@/components/cabs/WaitingForDriver";

import { SocketContext } from "@/contexts/cabs/SocketContext";
import { useAuth } from "@/contexts/AuthContext";

import LiveTracking from "@/components/cabs/LiveTracking";
import { getSuggestions, type Suggestion } from "@/lib/api/maps";
import { getFare, createRide as createRideApi } from "@/lib/api/rides";
import { type Fare, VehicleType } from "@/types/ride";

const RideForm = () => {
  const router = useRouter();

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<Suggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<
    Suggestion[]
  >([]);
  const [activeField, setActiveField] = useState<
    "pickup" | "destination" | null
  >(null);
  const [fare, setFare] = useState<Fare>({
    auto: 0,
    car: 0,
    moto: 0,
  });
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [ride, setRide] = useState(null);

  const { socket } = useContext(SocketContext);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      socket.emit("join", { userType: "user", userId: user.id });
    }
  }, [user]);

  useEffect(() => {
    const handleRideConfirmed = (ride: any) => {
      setVehicleFound(false);
      setWaitingForDriver(true);
      setRide(ride);
    };

    const handleRideStarted = (ride: any) => {
      console.log("ride started", ride);
      setWaitingForDriver(false);
      router.push("/riding");
    };

    socket.on("ride-confirmed", handleRideConfirmed);
    socket.on("ride-started", handleRideStarted);

    return () => {
      socket.off("ride-confirmed", handleRideConfirmed);
      socket.off("ride-started", handleRideStarted);
    };
  }, [socket, router]);

  const handlePickupChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPickup(e.target.value);
    try {
      const suggestions = await getSuggestions(e.target.value);
      setPickupSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching pickup suggestions:", error);
    }
  };

  const handleDestinationChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setDestination(e.target.value);
    try {
      const suggestions = await getSuggestions(e.target.value);
      setDestinationSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching destination suggestions:", error);
    }
  };

  const findTrip = async () => {
    setVehiclePanel(true);
    setPanelOpen(false);

    try {
      const fareData = await getFare(pickup, destination);
      setFare(fareData);
    } catch (error) {
      console.error("Error fetching fare:", error);
    }
  };

  const handleCreateRide = async () => {
    if (!vehicleType) return;
    try {
      const rideData = await createRideApi({
        pickup,
        destination,
        vehicleType,
      });
      // Handle response if needed
      console.log("Ride created:", rideData);
    } catch (error) {
      console.error("Error creating ride:", error);
    }
  };

  return (
    <div className="h-screen relative overflow-hidden">
      <img
        className="w-16 absolute left-5 top-5"
        src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
        alt=""
      />
      <div className="h-screen w-screen">
        <LiveTracking />
      </div>
      <div className="flex flex-col justify-end h-screen absolute top-0 w-full">
        <div className="h-[30%] p-6 bg-white relative">
          <h5
            onClick={() => setPanelOpen(false)}
            className={`absolute right-6 top-6 text-2xl ${panelOpen ? "opacity-100" : "opacity-0"}`}
          >
            <i className="ri-arrow-down-wide-line"></i>
          </h5>
          <h4 className="text-2xl font-semibold">Find a trip</h4>
          <form className="relative py-3">
            <div className="line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gray-700 rounded-full"></div>
            <input
              onClick={() => {
                setPanelOpen(true);
                setActiveField("pickup");
              }}
              value={pickup}
              onChange={handlePickupChange}
              className="bg-[#eee] px-12 py-2 text-lg rounded-lg w-full"
              type="text"
              placeholder="Add a pick-up location"
            />
            <input
              onClick={() => {
                setPanelOpen(true);
                setActiveField("destination");
              }}
              value={destination}
              onChange={handleDestinationChange}
              className="bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3"
              type="text"
              placeholder="Enter your destination"
            />
          </form>
          <button
            onClick={findTrip}
            className="bg-black text-white px-4 py-2 rounded-lg mt-3 w-full"
          >
            Find Trip
          </button>
        </div>
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "70%", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white overflow-hidden"
            >
              <LocationSearchPanel
                suggestions={
                  activeField === "pickup"
                    ? pickupSuggestions
                    : destinationSuggestions
                }
                setPanelOpen={setPanelOpen}
                setVehiclePanel={setVehiclePanel}
                setPickup={setPickup}
                setDestination={setDestination}
                activeField={activeField}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: vehiclePanel ? 0 : "100%" }}
        transition={{ duration: 0.3 }}
        className="fixed w-full z-10 bottom-0 bg-white px-3 py-10 pt-12"
      >
        <VehiclePanel
          selectVehicle={setVehicleType}
          fare={fare}
          setConfirmRidePanel={setConfirmRidePanel}
          setVehiclePanel={setVehiclePanel}
        />
      </motion.div>

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: confirmRidePanel ? 0 : "100%" }}
        transition={{ duration: 0.3 }}
        className="fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12"
      >
        <ConfirmRide
          createRide={handleCreateRide}
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          setConfirmRidePanel={setConfirmRidePanel}
          setVehicleFound={setVehicleFound}
        />
      </motion.div>

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: vehicleFound ? 0 : "100%" }}
        transition={{ duration: 0.3 }}
        className="fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12"
      >
        <LookingForDriver
          createRide={handleCreateRide}
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          setVehicleFound={setVehicleFound}
        />
      </motion.div>

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: waitingForDriver ? 0 : "100%" }}
        transition={{ duration: 0.3 }}
        className="fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12"
      >
        <WaitingForDriver
          ride={ride}
          setVehicleFound={setVehicleFound}
          setWaitingForDriver={setWaitingForDriver}
          waitingForDriver={waitingForDriver}
        />
      </motion.div>
    </div>
  );
};

export default RideForm;
