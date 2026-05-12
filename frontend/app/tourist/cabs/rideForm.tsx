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
import Riding from "@/components/cabs/Riding";
import LiveTrackingPopup from "@/components/cabs/LiveTrackingPopup";

import { SocketContext } from "@/contexts/cabs/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveRide } from "@/contexts/ActiveRideContext";

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
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [riding, setRiding] = useState(false);
  const [showLiveTracking, setShowLiveTracking] = useState(false);
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
  const [ride, setRide] = useState<any>(null);

  const { socket } = useContext(SocketContext);
  const { user } = useAuth();
  const { activeRide } = useActiveRide();

  useEffect(() => {
    if (user?.id) {
      socket.emit("join", { userType: "user", userId: user.id });
    }
  }, [user]);

  useEffect(() => {
    const handleRideConfirmed = (ride: any) => {
      console.log("[TOURIST] Ride confirmed by driver:", ride);
      // Set ride data and show waiting for driver
      setRide(ride);
      setWaitingForDriver(true);
      setVehicleFound(false); // Clear vehicle found state
      // Clear any existing riding state
      setRiding(false);
      setShowLiveTracking(false);
    };

    const handleRideStarted = (ride: any) => {
      console.log("[TOURIST] Ride started:", ride);
      setWaitingForDriver(false);
      setRiding(true);
      setRide(ride);
      setShowLiveTracking(true); // Show live tracking when ride starts
    };

    const handleRideEnded = (ride: any) => {
      console.log("[TOURIST] Ride ended:", ride);
      // Clear all ride states
      setWaitingForDriver(false);
      setRiding(false);
      setShowLiveTracking(false);
      setRide(ride); // Keep ride data for payment
    };

    socket.on("ride-confirmed", handleRideConfirmed);
    socket.on("ride-started", handleRideStarted);
    socket.on("ride-ended", handleRideEnded);

    return () => {
      socket.off("ride-confirmed", handleRideConfirmed);
      socket.off("ride-started", handleRideStarted);
      socket.off("ride-ended", handleRideEnded);
    };
  }, [socket, router]);

  const handlePickupChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPickup(e.target.value);
    if (e.target.value.length >= 3) {
      try {
        const suggestions = await getSuggestions(e.target.value);
        setPickupSuggestions(suggestions);
      } catch (error) {
        console.error("Error fetching pickup suggestions:", error);
        setPickupSuggestions([]);
      }
    } else {
      setPickupSuggestions([]);
    }
  };

  const handleDestinationChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setDestination(e.target.value);
    if (e.target.value.length >= 3) {
      try {
        const suggestions = await getSuggestions(e.target.value);
        setDestinationSuggestions(suggestions);
      } catch (error) {
        console.error("Error fetching destination suggestions:", error);
        setDestinationSuggestions([]);
      }
    } else {
      setDestinationSuggestions([]);
    }
  };

  const findTrip = async () => {
    setVehiclePanel(true);
    setPanelOpen(false);

    try {
      const fareData = await getFare(pickup, destination);
      setFare(fareData);
      console.log("FareData created:", fareData);
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
      // Show booking success instead of looking for driver
      setConfirmRidePanel(false);
      setBookingSuccess(true);
    } catch (error) {
      console.error("Error creating ride:", error);
    }
  };

  const handleSelectVehicle = (type: VehicleType) => {
    setVehicleType(type);
    setVehiclePanel(false);
    setConfirmRidePanel(true);
  };

  return (
    <div className="h-screen relative overflow-hidden">
    
      <div className="h-screen w-full">
        <LiveTracking />
      </div>
      <div className={`flex flex-col ${panelOpen ? 'justify-start' : 'justify-end'} h-screen absolute top-0 w-full `}>
        <div className={`p-4 sm:p-6 md:p-8 bg-white relative shadow-lg pointer-events-auto ${panelOpen ? 'h-screen rounded-none' : 'h-[30%] sm:h-[35%] md:h-[40%] lg:h-[45%] xl:h-1/2 rounded-t-3xl md:rounded-t-2xl'}`}>
          <h5
            onClick={() => setPanelOpen(false)}
            className={`absolute right-4 sm:right-6 top-4 sm:top-6 text-2xl cursor-pointer ${panelOpen ? "opacity-100" : "opacity-0"}`}
          >
            <i className="ri-arrow-down-wide-line"></i>
          </h5>
          <h4 className="text-xl sm:text-2xl font-semibold text-primary">Find a trip</h4>
          <form className="relative py-3">
            <div className="line absolute h-12 sm:h-16 w-1 top-[50%] -translate-y-1/2 left-4 sm:left-5 bg-primary rounded-full"></div>
            <input
              onClick={() => {
                setPanelOpen(true);
                setActiveField("pickup");
              }}
              value={pickup}
              onChange={handlePickupChange}
              className="bg-[#eee] px-10 sm:px-12 py-2 sm:py-3 text-base sm:text-lg rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="bg-[#eee] px-10 sm:px-12 py-2 sm:py-3 text-base sm:text-lg rounded-lg w-full mt-2 sm:mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Enter your destination"
            />
          </form>
          <button
            onClick={findTrip}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 sm:py-3 rounded-lg mt-2 sm:mt-3 w-full font-medium transition"
          >
            Find Trip
          </button>
          <AnimatePresence>
            {panelOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white overflow-y-auto max-h-[60vh] md:max-h-[50vh] pointer-events-auto"
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
        initial={{ opacity: 0, y: 50 }}
animate={{
  opacity: vehiclePanel ? 1 : 0,
  y: vehiclePanel ? 0 : 50,
  pointerEvents: vehiclePanel ? "auto" : "none",
}}
        transition={{ duration: 0.3 }}
        className="fixed inset-x-0 bottom-0 z-10 bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 pt-8 sm:pt-10 md:pt-12 max-h-[85vh] overflow-y-auto rounded-t-3xl md:rounded-t-2xl shadow-2xl md:shadow-xl md:max-w-2xl md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 pointer-events-auto"
      >
        <VehiclePanel
          selectVehicle={handleSelectVehicle}
          fare={fare}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
animate={{
  opacity: confirmRidePanel ? 1 : 0,
  y: confirmRidePanel ? 0 : 50,
  pointerEvents: confirmRidePanel ? "auto" : "none",
}}
        transition={{ duration: 0.3 }}
        className="fixed inset-x-0 bottom-0 z-20 bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 pt-8 sm:pt-10 md:pt-12 max-h-[85vh] overflow-y-auto rounded-t-3xl md:rounded-t-2xl shadow-2xl md:shadow-xl md:max-w-2xl md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 pointer-events-auto"
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
        initial={{ opacity: 0, y: 50 }}
animate={{
  opacity: vehicleFound ? 1 : 0,
  y: vehicleFound ? 0 : 50,
  pointerEvents: vehicleFound ? "auto" : "none",
}}
        transition={{ duration: 0.3 }}
        className="fixed inset-x-0 bottom-0 z-10 bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 pt-8 sm:pt-10 md:pt-12 max-h-[85vh] overflow-y-auto rounded-t-3xl md:rounded-t-2xl shadow-2xl md:shadow-xl md:max-w-2xl md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2"
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
       initial={{ opacity: 0, y: 50 }}
animate={{
  opacity: waitingForDriver ? 1 : 0,
  y: waitingForDriver ? 0 : 50,
  pointerEvents: waitingForDriver ? "auto" : "none",
}}
        transition={{ duration: 0.3 }}
        className="fixed inset-x-0 bottom-0 z-10 bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 pt-8 sm:pt-10 md:pt-12 max-h-[85vh] overflow-y-auto rounded-t-3xl md:rounded-t-2xl shadow-2xl md:shadow-xl md:max-w-2xl md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2"
      >
        <WaitingForDriver
          ride={ride}
          setVehicleFound={setVehicleFound}
          setWaitingForDriver={setWaitingForDriver}
          waitingForDriver={waitingForDriver}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
animate={{
  opacity: riding ? 1 : 0,
  y: riding ? 0 : 50,
  pointerEvents: riding ? "auto" : "none",
}}
        transition={{ duration: 0.3 }}
        className="fixed inset-x-0 bottom-0 z-10 bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 pt-8 sm:pt-10 md:pt-12 max-h-[85vh] overflow-y-auto rounded-t-3xl md:rounded-t-2xl shadow-2xl md:shadow-xl md:max-w-2xl md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2"
      >
        <Riding
          ride={ride}
          setRidingPanel={setRiding}
          setShowLiveTracking={setShowLiveTracking}
          eta="5 min"
        />
      </motion.div>

      {/* Ride Completion and Payment */}
      {!riding && ride?.status === "completed" && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-0 bottom-0 z-20 bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 max-h-[85vh] overflow-y-auto rounded-t-3xl md:rounded-t-2xl shadow-2xl md:shadow-xl"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-3xl text-green-600"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Ride Completed!</h3>
            <p className="text-gray-600 mb-6">Thank you for riding with GoGuide</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Total Fare</span>
                <span className="text-xl font-bold">₹{ride?.fare || 0}</span>
              </div>
              <div className="text-sm text-gray-500">
                From: {ride?.pickup}
              </div>
              <div className="text-sm text-gray-500">
                To: {ride?.destination}
              </div>
            </div>
            
            <button
              onClick={() => {
                // TODO: Implement payment flow
                console.log("[PAYMENT] Initiate payment for ride:", ride._id);
                alert("Payment integration coming soon!");
                // Reset ride state after payment
                setRide(null);
                setConfirmRidePanel(false);
                setVehicleFound(false);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold p-3 rounded-lg transition-colors mb-3"
            >
              Make Payment
            </button>
            
            <button
              onClick={() => {
                setRide(null);
                setConfirmRidePanel(false);
                setVehicleFound(false);
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium p-3 rounded-lg transition-colors"
            >
              Book Another Ride
            </button>
          </div>
        </motion.div>
      )}

      {/* Live Tracking Popup */}
      <LiveTrackingPopup
        ride={ride}
        isOpen={showLiveTracking}
        onClose={() => setShowLiveTracking(false)}
      />
    </div>
    </div>
  );
};

export default RideForm;
