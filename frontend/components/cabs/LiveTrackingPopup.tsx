"use client";

import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { X, Navigation, Phone, Share2 } from "lucide-react";
import { SocketContext } from "@/contexts/cabs/SocketContext";
import { useActiveRide } from "@/contexts/ActiveRideContext";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";
import TouristLoader from "@/components/common/TouristLoader";

interface LiveTrackingPopupProps {
  ride: any;
  onClose: () => void;
  isOpen: boolean;
}

export default function LiveTrackingPopup({
  ride,
  onClose,
  isOpen,
}: LiveTrackingPopupProps) {
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(() => {
    if (ride?.driver?.currentLocation?.lat && ride?.driver?.currentLocation?.lng) {
      return {
        lat: Number(ride.driver.currentLocation.lat),
        lng: Number(ride.driver.currentLocation.lng),
      };
    }
    return null;
  });

  const [previousLocation, setPreviousLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [eta, setEta] = useState("5 min");

  // Use React STATE for map instance (not just a Ref) so that centering/marker
  // effects re-run properly after the map finishes loading.
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const { socket } = useContext(SocketContext);
  const { activeRide } = useActiveRide();
  const { isLoaded, loadError } = useGoogleMaps();

  // Animate marker smoothly between two positions
  const animateMarker = useCallback((from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
    if (!markerRef.current) return;

    const steps = 20;
    let currentStep = 0;

    const animate = () => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

      const newLat = from.lat + (to.lat - from.lat) * easeProgress;
      const newLng = from.lng + (to.lng - from.lng) * easeProgress;
      markerRef.current?.setPosition({ lat: newLat, lng: newLng });

      if (currentStep < steps) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animate();
  }, []);

  // Handle location updates with smooth animation
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

    console.log("[LIVE TRACKING] Listening for ride:", ride._id);

    const handleLocationUpdate = (data: any) => {
      console.log("[LIVE TRACKING] Location update received:", data);

      const incomingRideId =
        typeof data.rideId === "object" ? data.rideId._id : data.rideId;

      if (String(incomingRideId) !== String(ride._id)) {
        console.log("[LIVE TRACKING] Ride mismatch");
        return;
      }

      const newLocation = {
        lat: Number(data.lat),
        lng: Number(data.lng),
      };

      if (previousLocation && driverLocation) {
        animateMarker(driverLocation, newLocation);
      }

      setPreviousLocation(driverLocation);
      setDriverLocation(newLocation);

      if (data.eta) {
        setEta(data.eta);
      }

      console.log("[LIVE TRACKING] Updated driver location:", newLocation);
    };

    socket.off("driver-location-update", handleLocationUpdate);
    socket.on("driver-location-update", handleLocationUpdate);

    return () => {
      socket.off("driver-location-update", handleLocationUpdate);
    };
  }, [socket, ride?._id, isOpen, animateMarker, driverLocation, previousLocation]);

  const defaultCenter = {
    lat: 26.9124,
    lng: 75.7873,
  };

  // Cleanup socket listener and markers on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.off("driver-location-update");
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [socket]);

  // Create/update marker whenever map (state) or driverLocation changes
  // Using map as STATE (not just ref) ensures this fires after map loads
  useEffect(() => {
    if (!map || !driverLocation?.lat || !driverLocation?.lng || !isLoaded) return;

    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({
        position: { lat: driverLocation.lat, lng: driverLocation.lng },
        map: map,
        title: "Your Driver",
        icon: {
          url: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
          scaledSize: new google.maps.Size(45, 45),
        },
      });
      console.log("[LIVE TRACKING] Driver marker created at:", driverLocation);
    } else {
      markerRef.current.setPosition({ lat: driverLocation.lat, lng: driverLocation.lng });
    }

    // Pan map to driver location
    map.panTo({ lat: driverLocation.lat, lng: driverLocation.lng });
    map.setZoom(16);
    console.log("[LIVE TRACKING] Map centered on driver:", driverLocation);
  }, [map, driverLocation, isLoaded]);

  // Lock body scroll (but NOT pointer events — removing that so map stays interactive)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = "0";
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.bottom = "0";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.bottom = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.bottom = "";
    };
  }, [isOpen]);

  const handleCallDriver = () => {
    const driverPhone = ride?.driver?.userId?.phone || ride?.driver?.phone;
    if (driverPhone) {
      window.location.href = `tel:${driverPhone}`;
    }
  };

  const handleShareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: "My GoGuide Cab Ride",
        text: `I'm on a GoGuide cab from ${ride?.pickup} to ${ride?.destination}. ETA: ${eta}`,
        url: window.location.href,
      });
    } else {
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-4xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
          {loadError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50">
              <div className="text-center">
                <p className="text-red-600 font-medium">Map Error</p>
                <p className="text-sm text-gray-600">Failed to load Google Maps</p>
              </div>
            </div>
          ) : !isLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <TouristLoader text="Loading map..." />
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={{
                width: "100%",
                height: "100%",
              }}
              center={driverLocation || defaultCenter}
              zoom={driverLocation ? 16 : 13}
              onLoad={(mapInstance) => {
                setMap(mapInstance);
                console.log("[LIVE TRACKING] Map loaded successfully, driver location:", driverLocation);
              }}
              onUnmount={() => {
                if (markerRef.current) {
                  markerRef.current.setMap(null);
                  markerRef.current = null;
                }
                setMap(null);
              }}
              options={{
                fullscreenControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                zoomControl: true,
                gestureHandling: "greedy",
              }}
            >
            </GoogleMap>
          )}

          {/* ETA Badge */}
          <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10 shadow-lg">
            ETA: {eta}
          </div>

          {/* No location warning */}
          {isLoaded && !driverLocation && (
            <div className="absolute bottom-4 left-4 right-4 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded-lg text-center">
              Waiting for driver location...
            </div>
          )}
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {/* Driver Info */}
          <div className="bg-white p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-semibold">
                  <img
                    src={ride?.driver?.driverPhoto}
                    alt="Driver"
                    className="w-14 h-14 rounded-full object-cover"
                  />{" "}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">
                  {ride?.driver?.userId?.fullname?.firstname &&
                  ride?.driver?.userId?.fullname?.lastname
                    ? `${ride.driver.userId.fullname.firstname} ${ride.driver.userId.fullname.lastname}`
                    : ride?.driver?.driverName || "Driver"}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {ride?.driver?.vehicleName ||
                    ride?.driver?.vehicleType ||
                    "Vehicle"}{" "}
                  • {ride?.driver?.vehicleNumber || "No plate"}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm text-gray-500">OTP</div>
                <div className="text-lg font-bold text-green-600">
                  {ride?.otp || "****"}
                </div>
              </div>
            </div>
          </div>

          {/* Ride Details */}
          <div className="bg-white p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Pickup</p>
                <p className="text-sm text-gray-600 break-words">
                  {ride?.pickup || "Loading..."}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Destination</p>
                <p className="text-sm text-gray-600 break-words">
                  {ride?.destination || "Loading..."}
                </p>
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
