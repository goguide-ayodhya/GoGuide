"use client";

import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { X, Navigation, Phone, Share2 } from "lucide-react";
import { SocketContext } from "@/contexts/cabs/SocketContext";
import { useActiveRide } from "@/contexts/ActiveRideContext";
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';


interface LiveTrackingPopupProps {
  ride: any;
  onClose: () => void;
  isOpen: boolean;
}

export default function LiveTrackingPopup({ ride, onClose, isOpen }: LiveTrackingPopupProps) {
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState("5 min");
  const { socket } = useContext(SocketContext);
  const { activeRide } = useActiveRide();
  const { isLoaded, loadError } = useGoogleMaps();
  const mapRef = useRef<google.maps.Map | null>(null);

  // Define handleLocationUpdate at component level
  const handleLocationUpdate = useCallback((data: any) => {
    console.log("[LIVE TRACKING] Location update received:", data);
    
    // Use ride prop first, fallback to activeRide from context
    const currentRideId = ride?._id || ride?.id || activeRide?._id || activeRide?.id;
    const receivedRideId = data.rideId;
    
    console.log("[LIVE TRACKING] Current ride ID:", currentRideId, "Received:", receivedRideId);
    
    if (receivedRideId === currentRideId) {
      console.log("[LIVE TRACKING] Updating driver location:", { lat: data.lat, lng: data.lng });
      setDriverLocation({
        lat: Number(data.lat),
        lng: Number(data.lng),
      });
      setEta(data.eta || "5 min");
    } else {
      console.log("[LIVE TRACKING] Ride ID mismatch - ignoring update");
    }
  }, [ride, activeRide]);

  const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

  const defaultCenter = {
    lat: 26.9124, // Default to a reasonable location
    lng: 75.7873, // Default to a reasonable location
  };

useEffect(() => {
  if (!socket) {
    console.log("[LIVE TRACKING] No socket");
    return;
  }

  if (!ride?._id) {
    console.log("[LIVE TRACKING] No ride ID");
    return;
  }

  if (!isOpen) {
    console.log("[LIVE TRACKING] Popup closed");
    return;
  }

  console.log(
    "[LIVE TRACKING] Listening for ride:",
    ride._id
  );

  const handleLocationUpdate = (data: any) => {
    console.log(
      "[TOURIST] LOCATION EVENT RECEIVED:",
      data
    );

    const incomingRideId =
      typeof data.rideId === "object"
        ? data.rideId._id
        : data.rideId;

    if (String(incomingRideId) !== String(ride._id)) {
      console.log("[LIVE TRACKING] Ride mismatch");
      return;
    }

    console.log(
      "[LIVE TRACKING] Updating driver location"
    );

    setDriverLocation({
      lat: Number(data.lat),
      lng: Number(data.lng),
    });

    if (data.eta) {
      setEta(data.eta);
    }
  };

  socket.off(
    "driver-location-update",
    handleLocationUpdate
  );

  socket.on(
    "driver-location-update",
    handleLocationUpdate
  );

  return () => {
    socket.off(
      "driver-location-update",
      handleLocationUpdate
    );
  };
}, [socket, ride?._id, isOpen]);

  // Cleanup socket listener on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.off("driver-location-update", handleLocationUpdate);
      }
    };
  }, [socket]);

  useEffect(() => {
  if (
    mapRef.current &&
    driverLocation?.lat &&
    driverLocation?.lng
  ) {
    mapRef.current.panTo({
      lat: Number(driverLocation.lat),
      lng: Number(driverLocation.lng),
    });
  }
}, [driverLocation]);

  // Auto-center map when driver location changes
  useEffect(() => {
    if (driverLocation?.lat && driverLocation?.lng) {
      // Map will auto-center when driverLocation prop changes
    }
  }, [driverLocation]);

  const handleCallDriver = () => {
    const driverPhone = ride?.driver?.userId?.phone || ride?.driver?.phone;
    if (driverPhone) {
      window.location.href = `tel:${driverPhone}`;
    }
  };

  const handleShareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My GoGuide Cab Ride',
        text: `I'm on a GoGuide cab from ${ride?.pickup} to ${ride?.destination}. ETA: ${eta}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      const text = `I'm on a GoGuide cab from ${ride?.pickup} to ${ride?.destination}. ETA: ${eta}`;
      navigator.clipboard.writeText(text);
      alert("Ride details copied to clipboard!");
    }
  };

  const handleNavigate = () => {
    if (ride?.pickup && ride?.destination) {
      const googleMapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(ride.pickup)}/${encodeURIComponent(ride.destination)}`;
      window.open(googleMapsUrl, "_blank");
    }
  };

useEffect(() => {
  if (isOpen) {
    // Prevent body scroll and touch events
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = "0";
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.bottom = "0";
    document.body.style.touchAction = "none";
    document.body.style.webkitUserSelect = "none";
    document.body.style.userSelect = "none";
    document.body.style.pointerEvents = "none";
  } else {
    // Restore body scroll and touch events
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.bottom = "";
    document.body.style.touchAction = "";
    document.body.style.webkitUserSelect = "";
    document.body.style.userSelect = "";
    document.body.style.pointerEvents = "";
  }

  return () => {
    // Cleanup on unmount
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.bottom = "";
    document.body.style.touchAction = "";
    document.body.style.webkitUserSelect = "";
    document.body.style.userSelect = "";
    document.body.style.pointerEvents = "";
  };
}, [isOpen]);

  if (!isOpen) return null;


  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="relative w-full max-w-4xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-semibold">Live Tracking</h2>
            <p className="text-sm text-gray-600">Your driver is on the way</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Google Map */}
        <div className="relative h-[45vh] min-h-[300px] flex-shrink-0 bg-gray-100">
          {/* Debug Panel */}
          <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 rounded z-20 max-w-xs">
            <div>Socket: {socket ? "✅" : "❌"}</div>
            <div>Ride ID: {ride?._id || activeRide?._id || "None"}</div>
            <div>Driver Loc: {driverLocation ? `${driverLocation.lat.toFixed(4)}, ${driverLocation.lng.toFixed(4)}` : "None"}</div>
            <div>ETA: {eta}</div>
            {/* Test Button */}
            <button 
              onClick={() => {
                console.log("[TEST] Simulating driver location update");
                // Simulate driver location update for testing
                const testData = {
                  rideId: ride?._id || activeRide?._id,
                  lat: 26.9124 + Math.random() * 0.01,
                  lng: 75.7873 + Math.random() * 0.01,
                  eta: `${Math.floor(Math.random() * 10 + 1)} min`
                };
                console.log("[TEST] Sending test data:", testData);
                handleLocationUpdate(testData);
              }}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
            >
              Test Driver Loc
            </button>
          </div>
          
          {loadError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50">
              <div className="text-center">
                <p className="text-red-600 font-medium">Map Error</p>
                <p className="text-sm text-gray-600">Failed to load Google Maps</p>
              </div>
            </div>
          ) : !isLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={{
                width: "100%",
                height: "100%",
              }}
              center={driverLocation || defaultCenter}
              zoom={15}
              onLoad={(map) => {
                mapRef.current = map;
                console.log("[LIVE TRACKING] Map loaded successfully");
              }}
              options={{
                fullscreenControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                zoomControl: true,
                gestureHandling: "greedy",
              }}
            >
              {/* Driver Marker */}
              {driverLocation && driverLocation.lat && driverLocation.lng && (
                <Marker
                  position={{
                    lat: Number(driverLocation.lat),
                    lng: Number(driverLocation.lng),
                  }}
                  icon={{
                    url: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                    scaledSize: new google.maps.Size(45, 45),
                  }}
                  title="Driver Location"
                />
              )}
              
              {/* Fallback Marker for Testing */}
              {!driverLocation && (
                <Marker
                  position={defaultCenter}
                  icon={{
                    url: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                    scaledSize: new google.maps.Size(45, 45),
                  }}
                  title="Default Location (No Driver Data)"
                />
              )}
            </GoogleMap>
          )}
          
          {/* ETA Badge */}
          <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10 shadow-lg">
            ETA: {eta}
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {/* Driver Info */}
          <div className="bg-white p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-semibold">
                  {ride?.driver?.userId?.fullname?.firstname?.[0] || "D"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">
                  {ride?.driver?.userId?.fullname?.firstname && ride?.driver?.userId?.fullname?.lastname
                    ? `${ride.driver.userId.fullname.firstname} ${ride.driver.userId.fullname.lastname}`
                    : ride?.driver?.driverName || "Driver"}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {ride?.driver?.vehicleName || ride?.driver?.vehicleType || "Vehicle"} • {ride?.driver?.vehicleNumber || "No plate"}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm text-gray-500">OTP</div>
                <div className="text-lg font-bold text-green-600">{ride?.otp || "****"}</div>
              </div>
            </div>
          </div>

          {/* Ride Details */}
          <div className="bg-white p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Pickup</p>
                <p className="text-sm text-gray-600 break-words">{ride?.pickup || "Loading..."}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Destination</p>
                <p className="text-sm text-gray-600 break-words">{ride?.destination || "Loading..."}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium">Fare:</div>
              <div className="text-sm font-semibold">₹{ride?.fare || 0}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white p-4 border-t grid grid-cols-3 gap-3">
            <button
              onClick={handleCallDriver}
              className="flex flex-col items-center gap-1 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Phone size={16} />
              <span className="text-xs">Call</span>
            </button>
            <button
              onClick={handleShareLocation}
              className="flex flex-col items-center gap-1 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Share2 size={16} />
              <span className="text-xs">Share</span>
            </button>
            <button
              onClick={handleNavigate}
              className="flex flex-col items-center gap-1 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Navigation size={16} />
              <span className="text-xs">Navigate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}