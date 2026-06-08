"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import PaymentConfirmation from "@/components/cabs/PaymentConfirmation";
import PaymentSuccess from "@/components/cabs/PaymentSuccess";
import ReviewPopup from "@/components/cabs/ReviewPopup";
import RideCompletionSummary from "@/components/cabs/RideCompletionSummary";

import { SocketContext } from "@/contexts/cabs/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveRide } from "@/contexts/ActiveRideContext";
import { useActiveRideRestore } from "@/hooks/useActiveRideRestore";

import {
  getSuggestions,
  getAddressFromCoordinates,
  type Suggestion,
} from "@/lib/api/maps";
import {
  getFare,
  createRide as createRideApi,
  submitReview,
  cancelRide as cancelRideApi,
} from "@/lib/api/rides";
import { type Fare, VehicleType } from "@/types/ride";
import Map from "@/components/cabs/Map";

// ============================================================
// RIDE STATUS → UI MAPPING (single source of truth)
//
// pending        → LookingForDriver (searching)
// accepted       → WaitingForDriver
// ongoing        → Riding + LiveTrackingPopup
// payment_pending → PaymentConfirmation
// completed      → PaymentSuccess → ReviewPopup
// reviewed       → RideCompletionSummary → reset
// cancelled      → reset everything
// ============================================================

const RideForm = () => {
  const router = useRouter();

  // ── Search / booking form state ──
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<Suggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Suggestion[]>([]);
  const [activeField, setActiveField] = useState<"pickup" | "destination" | null>(null);
  const [fare, setFare] = useState<Fare>({ auto: 0, car: 0, moto: 0 });
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // ── Active ride / UI phase state ──
  // ride is the LOCAL ride object (populated from socket events or restore)
  const [ride, setRide] = useState<any>(null);

  // ── UI visibility flags (driven by ride.status via socket events) ──
  const [vehicleFound, setVehicleFound] = useState(false);       // pending
  const [waitingForDriver, setWaitingForDriver] = useState(false); // accepted
  const [riding, setRiding] = useState(false);                   // ongoing
  const [showLiveTracking, setShowLiveTracking] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);

  // ── Cancel flow state ──
  const [isCancelling, setIsCancelling] = useState(false);

  const { socket } = useContext(SocketContext);
  const { user } = useAuth();
  const { activeRide, clearActiveRide } = useActiveRide();

  // ── Re-join socket room on mount ──
  useEffect(() => {
    if (user?.id) {
      socket.emit("join", { userType: "user", userId: user.id });
    }
  }, [user?.id]);

  // ============================================================
  // RESET — clears ALL local UI state and context
  // ============================================================
  const resetRideState = useCallback(() => {
    console.log("[RIDE_STATE_MACHINE] Resetting all ride state");
    setRide(null);
    setVehicleFound(false);
    setWaitingForDriver(false);
    setRiding(false);
    setShowLiveTracking(false);
    setShowReviewPopup(false);
    setIsCancelling(false);
    setPickup("");
    setDestination("");
    setVehicleType(null);
    setFare({ auto: 0, car: 0, moto: 0 });
    // Clear context so getActiveRide won't restore stale data
    clearActiveRide();
    router.push("/tourist/cabs");
  }, [clearActiveRide, router]);

  // ============================================================
  // RESTORE after refresh — uses ride.status as single source of truth
  // ============================================================
  useActiveRideRestore({
    onSearching: () => {
      console.log("[RESTORE_FLOW] Restoring: LookingForDriver (pending)");
      setVehicleFound(true);
      setWaitingForDriver(false);
      setRiding(false);
      setShowLiveTracking(false);
      setShowReviewPopup(false);
      if (activeRide) setRide(activeRide);
    },
    onAccepted: (restoredRide) => {
      console.log("[RESTORE_FLOW] Restoring: WaitingForDriver (accepted)");
      setVehicleFound(false);
      setWaitingForDriver(true);
      setRiding(false);
      setShowLiveTracking(true);
      setShowReviewPopup(false);
      setRide(restoredRide);
    },
    onOngoing: (restoredRide) => {
      console.log("[RESTORE_FLOW] Restoring: Riding + LiveTracking (ongoing)");
      setVehicleFound(false);
      setWaitingForDriver(false);
      setRiding(true);
      setShowLiveTracking(true);
      setShowReviewPopup(false);
      setRide(restoredRide);
    },
    onPaymentPending: (restoredRide) => {
      console.log("[RESTORE_FLOW] Restoring: PaymentConfirmation (payment_pending)");
      setVehicleFound(false);
      setWaitingForDriver(false);
      setRiding(false);
      setShowLiveTracking(false);
      setShowReviewPopup(false);
      setRide(restoredRide);
    },
    onCompleted: (restoredRide) => {
      // Payment was already confirmed — skip PaymentSuccess, go straight to review
      console.log("[RESTORE_FLOW] Restoring: ReviewPopup (completed — payment already done)");
      setVehicleFound(false);
      setWaitingForDriver(false);
      setRiding(false);
      setShowLiveTracking(false);
      setShowReviewPopup(true);
      setRide(restoredRide);
    },
  });

  // ============================================================
  // SOCKET EVENT HANDLERS — ride status drives UI transitions
  // ============================================================
  useEffect(() => {
    if (!socket) return;

    // pending → accepted: driver confirmed ride
    const handleRideConfirmed = (rideData: any) => {
      console.log("[RIDE_STATUS] ride-confirmed received, status:", rideData?.status);
      setRide(rideData);
      setVehicleFound(false);
      setWaitingForDriver(true);
      setRiding(false);
      setShowLiveTracking(true);
    };

    // accepted → ongoing: driver started ride with OTP
    const handleRideStarted = (rideData: any) => {
      console.log("[RIDE_STATUS] ride-started received, status:", rideData?.status);
      setRide(rideData);
      setWaitingForDriver(false);
      setRiding(true);
      setShowLiveTracking(true);
    };

    // ongoing → payment_pending: driver ended ride
    const handleRidePaymentPending = (rideData: any) => {
      console.log("[PAYMENT_FLOW] ride-payment-pending received, status:", rideData?.status);
      setRide(rideData);
      setRiding(false);
      setShowLiveTracking(false);
      setWaitingForDriver(false);
      setVehicleFound(false);
    };

    // payment_pending → completed: payment confirmed
    const handlePaymentConfirmed = (rideData: any) => {
      console.log("[PAYMENT_FLOW] payment-confirmed received, status:", rideData?.status);
      // Update ride with new status — UI is now driven by ride.status === 'completed'
      setRide(rideData);
    };

    // Legacy event alias
    const handleRideEnded = (rideData: any) => {
      console.log("[RIDE_STATUS] ride-ended (legacy) received");
      setRide(rideData);
      setRiding(false);
      setShowLiveTracking(false);
    };

    // completed → reviewed: review submitted/skipped
    const handleRideReviewed = (rideData: any) => {
      console.log("[RIDE_STATUS] ride-reviewed received, status:", rideData?.status);
      // Update ride so RideCompletionSummary renders
      setRide(rideData);
      // Context will clearActiveRide() automatically (see ActiveRideContext)
      // Auto-reset after 3s
      setTimeout(() => {
        console.log("[RIDE_STATE_MACHINE] Auto-resetting after review");
        resetRideState();
      }, 3000);
    };

    // [CANCEL_FLOW] Ride cancelled — clear everything and show reason
    const handleRideCancelled = (data: any) => {
      console.log("[CANCEL_FLOW] ride-cancelled received:", data);
      const reason = data?.message || "Your ride has been cancelled.";
      // Show reason only if it's an auto-cancellation (not triggered by the tourist themselves)
      if (data?.cancelledBy !== 'tourist') {
        alert(`\u26a0\ufe0f ${reason}`);
      }
      resetRideState();
    };

    socket.on("ride-confirmed", handleRideConfirmed);
    socket.on("ride-started", handleRideStarted);
    socket.on("ride-payment-pending", handleRidePaymentPending);
    socket.on("payment-confirmed", handlePaymentConfirmed);
    socket.on("ride-ended", handleRideEnded);
    socket.on("ride-reviewed", handleRideReviewed);
    socket.on("ride-cancelled", handleRideCancelled);

    return () => {
      socket.off("ride-confirmed", handleRideConfirmed);
      socket.off("ride-started", handleRideStarted);
      socket.off("ride-payment-pending", handleRidePaymentPending);
      socket.off("payment-confirmed", handlePaymentConfirmed);
      socket.off("ride-ended", handleRideEnded);
      socket.off("ride-reviewed", handleRideReviewed);
      socket.off("ride-cancelled", handleRideCancelled);
    };
  }, [socket, resetRideState]);

  // ============================================================
  // CANCEL RIDE HANDLER
  // [RIDE_STATE_MACHINE] Only allowed in: pending | accepted
  // ============================================================
  const handleCancelRide = useCallback(async () => {
    const rideId = ride?._id || activeRide?._id;
    if (!rideId) {
      console.warn("[CANCEL_FLOW] No ride ID to cancel");
      resetRideState();
      return;
    }

    console.log("[CANCEL_FLOW] Tourist initiating cancel for ride:", rideId);
    setIsCancelling(true);

    try {
      await cancelRideApi(rideId);
      console.log("[CANCEL_FLOW] Ride cancelled successfully via API");
      // Socket event 'ride-cancelled' will arrive and call resetRideState()
      // But also reset immediately to avoid waiting for socket
      resetRideState();
    } catch (err: any) {
      console.error("[CANCEL_FLOW] Cancel error:", err.message);
      // If state machine rejected it (ongoing/completed), just close the UI
      resetRideState();
    } finally {
      setIsCancelling(false);
    }
  }, [ride?._id, activeRide?._id, resetRideState]);

  // ── Fare / location handlers ──
  const handlePickupChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPickup(e.target.value);
    if (e.target.value.length >= 3) {
      try {
        const suggestions = await getSuggestions(e.target.value);
        setPickupSuggestions(suggestions);
      } catch (error) {
        setPickupSuggestions([]);
      }
    } else {
      setPickupSuggestions([]);
    }
  };

  const handleDestinationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestination(e.target.value);
    if (e.target.value.length >= 3) {
      try {
        const suggestions = await getSuggestions(e.target.value);
        setDestinationSuggestions(suggestions);
      } catch (error) {
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
    } catch (error) {
      console.error("[RIDE_STATUS] Error fetching fare:", error);
    }
  };

  const handleCreateRide = async () => {
    if (!vehicleType) return;
    try {
      const rideData = await createRideApi({ pickup, destination, vehicleType });
      console.log("[RIDE_STATUS] Ride created:", rideData?._id);
      setConfirmRidePanel(false);
      setVehicleFound(true);
      // Store minimal ride data (no driver yet)
      setRide(rideData);
    } catch (error) {
      console.error("[RIDE_STATUS] Error creating ride:", error);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!activeField) return;
    if (typeof window === "undefined") return;
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Please ensure you are using a secure connection (HTTPS).");
      return;
    }

    setLoadingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        // Try high accuracy first
        navigator.geolocation.getCurrentPosition(resolve, (err) => {
          console.warn("[RIDE_STATUS] High accuracy GPS failed, trying fallback...", err);
          // Fallback to low accuracy
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 30000,
            maximumAge: 10000,
          });
        }, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      const { latitude, longitude } = position.coords;
      const result = await getAddressFromCoordinates(latitude, longitude);
      const address = result?.address || "";

      if (!address) throw new Error("Unable to determine address.");

      if (activeField === "pickup") {
        setPickup(address);
        setPickupSuggestions([]);
      } else {
        setDestination(address);
        setDestinationSuggestions([]);
      }
      setPanelOpen(false);
    } catch (error: any) {
      console.error("[RIDE_STATUS] Location error:", error);
      let errMsg = "Unable to retrieve location. ";
      if (error.code === 1) {
        errMsg += "Location permission was denied. Please enable location services in your browser settings.";
      } else if (error.code === 3) {
        errMsg += "The request timed out. Please check your network connection and GPS signal.";
      } else {
        errMsg += error.message || "Please ensure you are using HTTPS.";
      }
      alert(errMsg);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSelectVehicle = (type: VehicleType) => {
    setVehicleType(type);
    setVehiclePanel(false);
    setConfirmRidePanel(true);
  };

  // ── Payment handlers ──
  const handlePaymentConfirmed = (paymentMethod: string) => {
    console.log("[PAYMENT_FLOW] Payment confirmed locally with method:", paymentMethod);
    // Do NOT set showPaymentSuccess here.
    // The socket event 'payment-confirmed' updates ride.status → 'completed'
    // which drives the PaymentSuccess render via ride.status === 'completed'
  };

  // ── Review handlers ──
  const handleReviewSubmit = async (rating: number, reviewText: string) => {
    if (!ride?._id) return;
    console.log("[REVIEW_FLOW] Submitting review:", { rideId: ride._id, rating });
    try {
      await submitReview(ride._id, rating, reviewText, false);
      // Update local state immediately on API success (don't wait for socket)
      console.log("[REVIEW_FLOW] Review submitted successfully, updating local state");
      setRide((prev: any) => prev ? { ...prev, status: 'reviewed' } : prev);
      setShowReviewPopup(false);
      // Auto-reset after 3s (socket event will also fire but is now redundant)
      setTimeout(() => {
        console.log("[RIDE_STATE_MACHINE] Auto-resetting after review submit");
        resetRideState();
      }, 3000);
    } catch (err) {
      console.error("[REVIEW_FLOW] Error submitting review:", err);
    }
  };

  const handleReviewSkip = async () => {
    if (!ride?._id) return;
    console.log("[REVIEW_FLOW] Skipping review for ride:", ride._id);
    try {
      await submitReview(ride._id, 0, "", true);
      // Update local state immediately on API success (don't wait for socket)
      console.log("[REVIEW_FLOW] Review skipped successfully, updating local state");
      setRide((prev: any) => prev ? { ...prev, status: 'reviewed' } : prev);
      setShowReviewPopup(false);
      // Auto-reset after 3s
      setTimeout(() => {
        console.log("[RIDE_STATE_MACHINE] Auto-resetting after review skip");
        resetRideState();
      }, 3000);
    } catch (err) {
      console.error("[REVIEW_FLOW] Error skipping review:", err);
    }
  };

  // ── Derived flags from ride.status (single source of truth) ──
  const isPaymentPending = ride?.status === "payment_pending";
  const isCompleted = ride?.status === "completed";
  const isReviewed = ride?.status === "reviewed";

  return (
    <div className="h-screen relative overflow-hidden">
      <div className="h-screen w-full">
        <Map />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-10 pointer-events-none">
        <div
          className={`
            pointer-events-auto
            p-4 sm:p-6 md:p-8
            bg-white
            relative
            shadow-lg
            transition-all duration-300 ease-in-out
            max-h-[90vh]
            overflow-hidden
            flex flex-col
            ${
              panelOpen
                ? "h-[70vh] rounded-t-3xl"
                : "h-[30%] sm:h-[35%] md:h-[40%] lg:h-[45%] xl:h-1/2 rounded-t-3xl"
            }
          `}
        >
          <div className="flex-shrink-0">
            <h5
              onClick={() => setPanelOpen(false)}
              className={`absolute right-4 sm:right-6 top-4 sm:top-6 text-2xl cursor-pointer transition-opacity duration-300 ${panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <i className="ri-arrow-down-wide-line"></i>
            </h5>
            <h4 className="text-xl sm:text-2xl font-semibold text-primary">
              Find a trip
            </h4>
            <form className="relative py-3">
              <div className="line absolute h-12 sm:h-16 w-1 top-[50%] -translate-y-1/2 left-4 sm:left-5 bg-primary rounded-full"></div>
              <input
                onClick={() => { setPanelOpen(true); setActiveField("pickup"); }}
                value={pickup}
                onChange={handlePickupChange}
                className="bg-[#eee] px-10 sm:px-12 py-2 sm:py-3 text-base sm:text-lg rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                placeholder="Add a pick-up location"
              />
              <input
                onClick={() => { setPanelOpen(true); setActiveField("destination"); }}
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
          </div>
          <div className="flex-1 overflow-hidden">
            <AnimatePresence>
              {panelOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="bg-white overflow-y-auto max-h-full pointer-events-auto"
                >
                  <LocationSearchPanel
                    suggestions={activeField === "pickup" ? pickupSuggestions : destinationSuggestions}
                    setPanelOpen={setPanelOpen}
                    setVehiclePanel={setVehiclePanel}
                    setPickup={setPickup}
                    setDestination={setDestination}
                    activeField={activeField}
                    onUseCurrentLocation={handleUseCurrentLocation}
                    isUsingCurrentLocation={loadingLocation}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Vehicle Selection Panel */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: vehiclePanel ? 1 : 0, y: vehiclePanel ? 0 : 50, pointerEvents: vehiclePanel ? "auto" : "none" }}
        transition={{ duration: 0.3 }}
        className="fixed inset-x-0 bottom-0 z-30 bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 pt-8 sm:pt-10 md:pt-12 max-h-[85vh] overflow-y-auto rounded-t-3xl md:rounded-t-2xl shadow-2xl md:shadow-xl md:max-w-2xl md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2"
      >
        <VehiclePanel selectVehicle={handleSelectVehicle} fare={fare} />
      </motion.div>

      {/* Confirm Ride Panel */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: confirmRidePanel ? 1 : 0, y: confirmRidePanel ? 0 : 50, pointerEvents: confirmRidePanel ? "auto" : "none" }}
        transition={{ duration: 0.3 }}
        className="fixed inset-x-0 bottom-0 z-40 bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 pt-8 sm:pt-10 md:pt-12 max-h-[85vh] overflow-y-auto rounded-t-3xl md:rounded-t-2xl shadow-2xl md:shadow-xl md:max-w-2xl md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2"
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

      {/* SEARCHING: Looking for Driver — pending status */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: vehicleFound ? 1 : 0, y: vehicleFound ? 0 : 50, pointerEvents: vehicleFound ? "auto" : "none" }}
        transition={{ duration: 0.3 }}
        className="fixed inset-x-0 bottom-0 z-30 bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 pt-8 sm:pt-10 md:pt-12 max-h-[85vh] overflow-y-auto rounded-t-3xl md:rounded-t-2xl shadow-2xl md:shadow-xl md:max-w-2xl md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2"
      >
        <LookingForDriver
          ride={ride}
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          setVehicleFound={setVehicleFound}
          onCancelRide={handleCancelRide}
          isCancelling={isCancelling}
        />
      </motion.div>

      {/* ACCEPTED: Waiting for Driver — accepted status */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: waitingForDriver ? 1 : 0, y: waitingForDriver ? 0 : 50, pointerEvents: waitingForDriver ? "auto" : "none" }}
        transition={{ duration: 0.3 }}
        className="fixed inset-x-0 bottom-0 z-30 bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 pt-8 sm:pt-10 md:pt-12 max-h-[85vh] overflow-y-auto rounded-t-3xl md:rounded-t-2xl shadow-2xl md:shadow-xl md:max-w-2xl md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2"
      >
        <WaitingForDriver
          ride={ride}
          vehicleType={vehicleType}
          setVehicleFound={setVehicleFound}
          setWaitingForDriver={setWaitingForDriver}
          waitingForDriver={waitingForDriver}
          onCancelRide={handleCancelRide}
          isCancelling={isCancelling}
        />
      </motion.div>

      {/* ONGOING: Riding — ongoing status */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: riding ? 1 : 0, y: riding ? 0 : 50, pointerEvents: riding ? "auto" : "none" }}
        transition={{ duration: 0.3 }}
        className="fixed inset-x-0 bottom-0 z-30 bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 pt-8 sm:pt-10 md:pt-12 max-h-[85vh] overflow-y-auto rounded-t-3xl md:rounded-t-2xl shadow-2xl md:shadow-xl md:max-w-2xl md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2"
      >
        <Riding
          ride={ride}
          setRidingPanel={setRiding}
          setShowLiveTracking={setShowLiveTracking}
          eta="5 min"
        />
      </motion.div>

      {/* PAYMENT_PENDING: Payment Confirmation — driven by ride.status */}
      <AnimatePresence>
        {isPaymentPending && ride && (
          <PaymentConfirmation
            ride={ride}
            onPaymentConfirmed={handlePaymentConfirmed}
          />
        )}
      </AnimatePresence>

      {/* COMPLETED: Payment Success → Review Popup — driven by ride.status */}
      <AnimatePresence>
        {isCompleted && !showReviewPopup && ride && (
          <PaymentSuccess
            ride={ride}
            onProceedToReview={() => {
              console.log("[RIDE_STATUS] Proceeding to review");
              setShowReviewPopup(true);
            }}
            onClose={() => {
              console.log("[RIDE_STATUS] Skipping payment success → review");
              setShowReviewPopup(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* COMPLETED: Review Popup */}
      <AnimatePresence>
        {isCompleted && showReviewPopup && ride && (
          <ReviewPopup
            ride={ride}
            driverName={
              ride?.driver?.userId?.fullname?.firstname ||
              ride?.driver?.driverName ||
              "Driver"
            }
            onSubmit={handleReviewSubmit}
            onSkip={handleReviewSkip}
          />
        )}
      </AnimatePresence>

      {/* REVIEWED: Completion Summary — auto-resets after 3s */}
      <AnimatePresence>
        {isReviewed && ride && (
          <RideCompletionSummary
            ride={ride}
            onClose={() => {
              setShowReviewPopup(false);
              resetRideState();
            }}
          />
        )}
      </AnimatePresence>

      {/* Live Tracking Popup — overlay when ongoing */}
      <LiveTrackingPopup
        ride={ride}
        isOpen={showLiveTracking}
        onClose={() => setShowLiveTracking(false)}
      />
    </div>
  );
};

export default RideForm;
