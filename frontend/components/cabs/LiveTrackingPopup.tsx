"use client";

import { useState, useEffect, useContext, useCallback } from "react";
import { X, Navigation, Phone, Share2 } from "lucide-react";
import { SocketContext } from "@/contexts/cabs/SocketContext";
import { useActiveRide } from "@/contexts/ActiveRideContext";
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';


interface LiveTrackingPopupProps {
  ride: any;
  onClose: () => void;
  isOpen: boolean;
}

export default function LiveTrackingPopup({ ride, onClose, isOpen }: LiveTrackingPopupProps) {
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState("5 min");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const { socket } = useContext(SocketContext);
  const { activeRide } = useActiveRide();

  // Define handleLocationUpdate at component level
  const handleLocationUpdate = useCallback((data: any) => {
    console.log("[LIVE TRACKING] Raw socket data received:", data);
    console.log("[LIVE TRACKING] Expected ride ID:", activeRide?._id, "Received ride ID:", data.rideId);
    
    if (data.rideId === activeRide?._id) {
      console.log("[LIVE TRACKING] Ride ID match - updating location");
      console.log("[LIVE TRACKING] Setting driver location:", {
        lat: data.lat,
        lng: data.lng,
      });
      setDriverLocation({
        lat: data.lat,
        lng: data.lng,
      });
      setEta(data.eta || "5 min");
      console.log("[LIVE TRACKING] Location updated successfully:", {
        lat: data.lat,
        lng: data.lng,
      });
    } else {
      console.log("[LIVE TRACKING] Ride ID mismatch, ignoring update");
    }
  }, [activeRide]);

  const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

  const defaultCenter = {
    lat: 26.9124, // Default to a reasonable location
    lng: 75.7873, // Default to a reasonable location
  };

  useEffect(() => {
    console.log("[LIVE TRACKING] useEffect triggered");
    console.log("[LIVE TRACKING] Socket available:", !!socket);
    console.log("[LIVE TRACKING] Active ride from context:", activeRide);
    console.log("[LIVE TRACKING] Popup open:", isOpen);
    
    if (!socket || !activeRide || !isOpen) {
      console.log("[LIVE TRACKING] Early return - missing socket, active ride, or popup not open");
      return;
    }

    console.log("[LIVE TRACKING] Setting up location listener for ride:", activeRide?._id);
    console.log("[LIVE TRACKING] Socket ID:", socket.id);
    console.log("[LIVE TRACKING] Socket connected:", socket.connected);

    
    // Check if already listening
    const existingListeners = socket.listeners('driver-location-update');
    console.log("[LIVE TRACKING] Existing listeners:", existingListeners.length);
    
    socket.on("driver-location-update", handleLocationUpdate);
    console.log("[LIVE TRACKING] Listener added successfully");

    return () => {
      console.log("[LIVE TRACKING] Cleaning up listener");
      socket.off("driver-location-update", handleLocationUpdate);
    };
  }, [socket, activeRide, isOpen, handleLocationUpdate]);

  // Cleanup socket listener on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.off("driver-location-update", handleLocationUpdate);
      }
    };
  }, [socket]);

  // Debug: Always show current driver location state
  useEffect(() => {
    console.log("[LIVE TRACKING] Driver location state updated:", driverLocation);
    console.log("[LIVE TRACKING] Driver location type:", typeof driverLocation);
    console.log("[LIVE TRACKING] Driver location lat:", driverLocation?.lat);
    console.log("[LIVE TRACKING] Driver location lng:", driverLocation?.lng);
  }, [driverLocation]);

  // Auto-center map when driver location changes
  useEffect(() => {
    if (driverLocation?.lat && driverLocation?.lng) {
      console.log("[LIVE TRACKING] Auto-centering map to driver location:", driverLocation);
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
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [isOpen]);
  if (!isOpen) return null;


  return (
<div
  className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
>
  <div className="
relative
w-full
max-w-4xl
h-[90vh]
bg-white
rounded-3xl
shadow-2xl
flex
flex-col
overflow-hidden
">       {/* Header */}
{/* Header */}
<div className="flex items-center justify-between p-4 border-b flex-shrink-0 bg-white z-10">
            <div>
            <h2 className="text-lg font-semibold">Live Tracking</h2>
            <p className="text-sm text-gray-600">Your driver is on the way</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Google Map */}
<div className="relative h-[45vh] min-h-[300px] flex-shrink-0">
              {mapError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50">
              <div className="text-center">
                <p className="text-red-600 font-medium">Map Error</p>
                <p className="text-sm text-gray-600">{mapError}</p>
              </div>
            </div>
          ) : (
            <LoadScript 
              googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
              libraries={['places']}
              onLoad={() => {
                console.log("[LIVE TRACKING] Google Maps loaded successfully");
                setMapLoaded(true);
              }}
              onError={() => {
                console.error("[LIVE TRACKING] Google Maps failed to load");
                setMapError("Failed to load Google Maps");
              }}
            >
             <GoogleMap
  mapContainerStyle={mapContainerStyle}
  center={driverLocation || defaultCenter}
  zoom={15}
  options={{
    fullscreenControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    zoomControl: true,
    gestureHandling: "greedy",
  }}
>
  {driverLocation?.lat && driverLocation?.lng && (
    <Marker
      position={{
        lat: Number(driverLocation.lat),
        lng: Number(driverLocation.lng),
      }}
      icon={{
        url: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
        scaledSize: new google.maps.Size(40, 40),
      }}
    />
  )}
</GoogleMap>
            </LoadScript>
          )}
          
          {/* ETA Badge */}
          <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
            ETA: {eta}
          </div>
        </div>

        {/* Driver Info */}
<div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold">
                {ride?.driver?.userId?.fullname?.firstname?.[0] || "D"}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">
                {ride?.driver?.userId?.fullname?.firstname && ride?.driver?.userId?.fullname?.lastname
                  ? `${ride.driver.userId.fullname.firstname} ${ride.driver.userId.fullname.lastname}`
                  : ride?.driver?.driverName || "Driver"}
              </h3>
              <p className="text-sm text-gray-600">
                {ride?.driver?.vehicleName || ride?.driver?.vehicleType || "Vehicle"} • {ride?.driver?.vehicleNumber || "No plate"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">OTP</div>
              <div className="text-lg font-bold text-green-600">{ride?.otp || "****"}</div>
            </div>
          </div>
        </div>

        {/* Ride Details */}
<div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Pickup</p>
              <p className="text-sm text-gray-600">{ride?.pickup || "Loading..."}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Destination</p>
              <p className="text-sm text-gray-600">{ride?.destination || "Loading..."}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">Fare:</div>
            <div className="text-sm font-semibold">₹{ride?.fare || 0}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t grid grid-cols-3 gap-3">
          <button
            onClick={handleCallDriver}
            className="flex flex-col items-center gap-1 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
          >
            <Phone size={16} />
            <span className="text-xs">Call</span>
          </button>
          <button
            onClick={handleShareLocation}
            className="flex flex-col items-center gap-1 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
          >
            <Share2 size={16} />
            <span className="text-xs">Share</span>
          </button>
          <button
            onClick={handleNavigate}
            className="flex flex-col items-center gap-1 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
          >
            <Navigation size={16} />
            <span className="text-xs">Navigate</span>
          </button>
        </div>
      </div>
    </div>
  );
}