"use client";

import { X, Phone, Navigation, MapPin, Clock, DollarSign, AlertTriangle } from "lucide-react";
import { useState, useEffect, useRef, useContext } from "react";
import { startRide, endRide } from "@/lib/api/rides";
import { useRouter } from "next/navigation";
import { SocketContext } from "@/contexts/cabs/SocketContext";

interface DriverAssignedSheetProps {
  ride: any;
  onClose: () => void;
  isDriver?: boolean;
}

export default function DriverAssignedSheet({ ride, onClose, isDriver = false }: DriverAssignedSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [rideStatus, setRideStatus] = useState(ride?.status || "accepted");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const router = useRouter();
  const { socket } = useContext(SocketContext);

  // GPS Watch ID ref for cleanup
  const watchIdRef = useRef<number | null>(null);

  // ====================================================
  // REAL-TIME GPS TRACKING
  // Starts when rideStatus is accepted or ongoing
  // Emits driver-location-update via socket to backend
  // Cleans up on unmount or ride completion
  // ====================================================
  useEffect(() => {
    if (!socket || !ride?._id) return;

    if (rideStatus !== "accepted" && rideStatus !== "ongoing") {
      // If tracking was running, stop it
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        console.log("[DRIVER TRACKING] GPS tracking stopped — ride not in accepted/ongoing state");
      }
      return;
    }

    if (!navigator.geolocation) {
      console.error("[DRIVER TRACKING] Geolocation is not supported by this browser");
      return;
    }

    console.log("[DRIVER TRACKING] Starting real GPS tracking for ride:", ride._id);

    // Clear any existing watch before starting new one
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // Emit the driver's current accurate location immediately when tracking starts
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const immediatePayload = {
          rideId: ride._id,
          lat: latitude,
          lng: longitude,
          eta: "5 min",
        };
        socket.emit("driver-location-update", immediatePayload);
        console.log("[DRIVER TRACKING] Emitted initial driver-location-update:", immediatePayload);
      },
      (error) => {
        console.warn("[DRIVER TRACKING] Initial geolocation fetch failed:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        console.log(`[DRIVER TRACKING] GPS position received: lat=${latitude}, lng=${longitude}, accuracy=${position.coords.accuracy}m`);

        const locationPayload = {
          rideId: ride._id,
          lat: latitude,
          lng: longitude,
          eta: "5 min", // Can be enhanced with real distance calc
        };

        socket.emit("driver-location-update", locationPayload);
        console.log("[DRIVER TRACKING] Emitted driver-location-update:", locationPayload);
      },
      (error) => {
        console.error("[DRIVER TRACKING] Geolocation error:", error.code, error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // Always get fresh position
      }
    );

    console.log("[DRIVER TRACKING] watchPosition started with ID:", watchIdRef.current);

    // Cleanup when rideStatus changes or component unmounts
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        console.log("[DRIVER TRACKING] GPS tracking cleaned up");
      }
    };
  }, [socket, ride?._id, rideStatus]);

  // ====================================================
  // LISTEN FOR RIDE STARTED (driver side)
  // ====================================================
  useEffect(() => {
    if (!socket || !isDriver) return;

    const handleRideStarted = (rideData: any) => {
      console.log("[DRIVER ASSIGNED] Ride started:", rideData);
      setRideStatus("ongoing");
    };

    // [CANCEL_FLOW] Tourist cancelled the ride — close sheet and notify driver
    const handleRideCancelled = (data: any) => {
      const cancelledRideId = data.rideId || data._id;
      const currentRideId = ride?._id;
      if (String(cancelledRideId) !== String(currentRideId)) return;

      console.log("[CANCEL_FLOW] Ride cancelled by tourist:", cancelledRideId);
      // Short delay so the alert is seen before sheet closes
      alert("⚠️ The tourist has cancelled this ride.");
      onClose();
    };

    socket.on("ride-started-driver", handleRideStarted);
    socket.on("ride-cancelled", handleRideCancelled);

    return () => {
      socket.off("ride-started-driver", handleRideStarted);
      socket.off("ride-cancelled", handleRideCancelled);
    };
  }, [socket, isDriver, ride?._id, onClose]);


  const tourist = ride?.user;
  const driver = ride?.driver;
  const pickup = ride?.pickup;
  const destination = ride?.destination;
  const fare = ride?.fare;
  const otp = ride?.otp;

  const handleStartRide = async () => {
    if (!ride?._id) return;
    
    // Verify OTP input
    if (!otpInput.trim()) {
      setOtpError("Please enter the OTP provided by the tourist");
      return;
    }
    
    setIsLoading(true);
    setOtpError("");
    
    try {
      console.log("[DRIVER] Starting ride with OTP:", otpInput);
      await startRide(ride._id, otpInput.trim());
      setRideStatus("ongoing");
      setOtpInput(""); // Clear OTP after successful start
      
      // Emit socket event to notify tourist that ride has started
      socket?.emit("ride-started", {
        rideId: ride._id,
        driverId: ride?.driver?._id,
        userId: ride?.user?._id,
        status: "ongoing"
      });
      
    } catch (error) {
      console.error("[DRIVER] Error starting ride:", error);
      setOtpError("Invalid OTP. Please check with the tourist and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndRide = async () => {
    if (!ride?._id) return;
    
    setIsLoading(true);
    try {
      console.log("[DRIVER] Ending ride:", ride._id);

      // Stop GPS tracking BEFORE ending ride
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        console.log("[DRIVER TRACKING] GPS tracking stopped on ride end");
      }

      await endRide(ride._id);
      setRideStatus("payment_pending");
      
      // Emit socket event to notify tourist that ride is awaiting payment
      socket?.emit("ride-payment-pending", {
        rideId: ride._id,
        driverId: ride?.driver?._id,
        userId: ride?.user?._id,
        status: "payment_pending",
        fare: ride?.fare
      });
      
      console.log("[DRIVER] Ride ended, waiting for payment confirmation");
      router.push("/driver/dashboard");
    } catch (error) {
      console.error("[DRIVER] Error ending ride:", error);
      alert("Failed to end ride. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallUser = () => {
    if (tourist?.phone) {
      window.location.href = `tel:${tourist.phone}`;
    }
  };

  const handleNavigate = () => {
    if (pickup && destination) {
      const googleMapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(pickup)}/${encodeURIComponent(destination)}`;
      window.open(googleMapsUrl, "_blank");
    }
  };

  const handleCancelRide = () => {
    if (confirm("Are you sure you want to cancel this ride?")) {
      // TODO: Implement cancel ride API
      console.log("[DRIVER] Cancel ride:", ride._id);
      router.push("/driver/dashboard");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center no-scrollbar">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-2xl bg-white p-4 shadow-lg sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-slate-500">
              {isDriver ? "Active Ride" : "Driver Assigned"}
            </div>
            <div className="text-lg font-semibold">
              {isDriver 
                ? `${tourist?.fullname?.firstname || tourist?.name || "User"}`
                : `${driver?.userId?.fullname?.firstname || driver?.driverName || "Driver"}`
              }
            </div>
            <div className="text-sm text-slate-600">
              {isDriver 
                ? `Tourist • ${tourist?.phone || "No phone"}`
                : `${driver?.vehicleName || driver?.vehicleType || "Vehicle"} • ${driver?.vehicleNumber || "No plate"}`
              }
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* OTP Input for Driver */}
        {isDriver && rideStatus === "accepted" && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-center">
              <div className="text-xs text-yellow-600 font-medium mb-2">ENTER TOURIST'S OTP</div>
              <input
                type="text"
                value={otpInput}
                onChange={(e) => {
                  setOtpInput(e.target.value);
                  setOtpError(""); // Clear error when user types
                }}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full px-3 py-2 text-2xl font-bold text-center border-2 border-yellow-300 rounded-lg focus:outline-none focus:border-yellow-500 bg-white"
              />
              {otpError && (
                <div className="mt-2 text-xs text-red-600 font-medium">
                  {otpError}
                </div>
              )}
              <div className="mt-2 text-xs text-yellow-600">
                Ask the tourist for the OTP and enter it here to start the ride
              </div>
            </div>
          </div>
        )}

        {/* Ride Details */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <MapPin className="w-5 h-5 text-slate-600" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900">Pickup</div>
              <div className="text-xs text-slate-600 truncate">{pickup || "Loading..."}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Navigation className="w-5 h-5 text-slate-600" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900">Destination</div>
              <div className="text-xs text-slate-600 truncate">{destination || "Loading..."}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-slate-600" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900">Fare</div>
              <div className="text-xs text-slate-600">₹{fare || 0}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Clock className="w-5 h-5 text-slate-600" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900">Status</div>
              <div className="text-xs text-slate-600 capitalize">{rideStatus}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCallUser}
              className="flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Phone size={16} />
              <span className="text-sm font-medium">Call</span>
            </button>
            <button
              onClick={handleNavigate}
              className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Navigation size={16} />
              <span className="text-sm font-medium">Navigate</span>
            </button>
          </div>

          {/* Primary Actions based on status */}
          {isDriver && rideStatus === "accepted" && (
            <button
              onClick={handleStartRide}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold p-3 rounded-lg transition-colors"
            >
              {isLoading ? "Starting..." : "Start Ride"}
            </button>
          )}

          {isDriver && rideStatus === "ongoing" && (
            <button
              onClick={handleEndRide}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold p-3 rounded-lg transition-colors"
            >
              {isLoading ? "Ending..." : "End Ride"}
            </button>
          )}

          {/* Cancel Ride */}
          <button
            onClick={handleCancelRide}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <AlertTriangle size={16} />
            Cancel Ride
          </button>
        </div>
      </div>
    </div>
  );
}
