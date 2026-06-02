import React from 'react';
import { Phone, Navigation, AlertTriangle, Star } from 'lucide-react';

const Riding = (props) => {
    const driver = props.ride?.driver;
    const pickup = props.ride?.pickup;
    const destination = props.ride?.destination;
    const fare = props.ride?.fare;
    const status = props.ride?.status;

    const handleCallDriver = () => {
        if (driver?.userId?.phone || driver?.phone) {
            window.location.href = `tel:${driver?.userId?.phone || driver?.phone}`;
        }
    };

    const handleNavigate = () => {
        if (pickup && destination) {
            const googleMapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(
                pickup
            )}/${encodeURIComponent(destination)}`;

            window.open(googleMapsUrl, "_blank");
        }
    };

    const handleShareRide = () => {
        if (navigator.share) {
            navigator.share({
                title: 'My GoGuide Cab Ride',
                text: `I'm on a GoGuide cab from ${pickup} to ${destination}. ETA: ${props.eta || 'N/A'
                    }`,
                url: window.location.href
            });
        } else {
            const text = `I'm on a GoGuide cab from ${pickup} to ${destination}. ETA: ${props.eta || 'N/A'
                }`;

            navigator.clipboard.writeText(text);
            alert("Ride details copied to clipboard!");
        }
    };

    return (
        <div className="w-full">

            {/* Mobile Close Button */}
            <button
                onClick={() => {
                    props.setRidingPanel(false);
                }}
                className="sticky top-0 p-2 text-center w-full md:hidden focus:outline-none"
            >
                <i className="text-3xl text-gray-300 ri-arrow-down-wide-line"></i>
            </button>

            {/* Heading */}
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-5">
                {status === "ongoing"
                    ? "Ride in Progress"
                    : "Driver Assigned"}
            </h3>

            {/* Driver Info */}
            <div className="flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-green-300 rounded-xl mt-3 sm:mt-4 bg-green-50">

                <div className="flex items-center gap-3 flex-1 min-w-0">

                    <img
                        className="h-14 w-14 rounded-full object-cover flex-shrink-0"
                        src={
                            driver?.driverPhoto ||
                            "https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg"
                        }
                        alt="Driver"
                    />

                    <div className="flex-1 min-w-0">

                        <h2 className="text-base sm:text-lg font-semibold truncate">
                            {driver?.userId?.fullname?.firstname &&
                                driver?.userId?.fullname?.lastname
                                ? `${driver.userId.fullname.firstname} ${driver.userId.fullname.lastname}`
                                : driver?.userId?.fullname?.firstname ||
                                driver?.driverName ||
                                "Driver"}
                        </h2>

                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">

                            {driver?.averageRating && (
                                <>
                                    <div className="flex items-center gap-1">
                                        <Star
                                            size={12}
                                            className="text-yellow-500 fill-yellow-500"
                                        />
                                        <span>
                                            {driver.averageRating.toFixed(1)}
                                        </span>
                                    </div>

                                    <span>•</span>
                                </>
                            )}

                            <span>
                                {driver?.vehicleName ||
                                    driver?.vehicleType ||
                                    "Cab"}
                            </span>

                            <span>•</span>

                            <span>
                                {driver?.vehicleNumber || "Loading..."}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ETA */}
                <div className="text-right">
                    <div className="text-xs text-gray-500">
                        ETA
                    </div>

                    <div className="text-sm font-semibold text-green-600">
                        {props.eta || "N/A"}
                    </div>
                </div>
            </div>

            {/* Ride Details */}
            <div className="flex flex-col items-center gap-2">

                <div className="w-full mt-4 sm:mt-5 space-y-0">
                                    
                    {/* Pickup */}
                    <div className="flex items-center gap-3 sm:gap-5 p-3 sm:p-4 border-b">

                        <i className="ri-map-pin-user-fill text-lg sm:text-xl"></i>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-medium">
                                Pickup Location
                            </h3>

                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                                {pickup || "Loading..."}
                            </p>
                        </div>
                    </div>

                    {/* Destination */}
                    <div className="flex items-center gap-3 sm:gap-5 p-3 sm:p-4 border-b">

                        <i className="ri-map-pin-2-fill text-lg sm:text-xl"></i>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-medium">
                                Destination
                            </h3>

                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                                {destination || "Loading..."}
                            </p>
                        </div>
                    </div>

                    {/* Fare */}
                    <div className="flex items-center gap-3 sm:gap-5 p-3 sm:p-4">

                        <i className="ri-currency-line text-lg sm:text-xl"></i>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-medium">
                                ₹{fare || "0"}
                            </h3>

                            <p className="text-xs sm:text-sm text-gray-600">
                                Estimated Fare
                            </p>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-4 sm:mt-5 w-full space-y-3">

                    {/* Call + Navigate */}
                    <div className="grid grid-cols-2 gap-3">

                        <button
                            onClick={handleCallDriver}
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium p-3 rounded-lg transition"
                        >
                            <Phone size={16} />

                            <span className="text-sm">
                                Call Driver
                            </span>
                        </button>

                        <button
                            onClick={handleNavigate}
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium p-3 rounded-lg transition"
                        >
                            <Navigation size={16} />

                            <span className="text-sm">
                                Navigate
                            </span>
                        </button>
                    </div>

                    {/* Live Tracking + Share */}
                    <div className="grid grid-cols-2 gap-3">

                        <button
                            onClick={() => {
                                if (props.setShowLiveTracking) {
                                    props.setShowLiveTracking(true);
                                }
                            }}
                            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium p-3 rounded-lg transition"
                        >
                            <i className="ri-map-2-line text-sm"></i>

                            <span className="text-sm">
                                Live Tracking
                            </span>
                        </button>

                        <button
                            onClick={handleShareRide}
                            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium p-3 rounded-lg transition"
                        >
                            <i className="ri-share-line text-sm"></i>

                            <span className="text-sm">
                                Share Ride
                            </span>
                        </button>
                    </div>

                    {/* Ongoing Ride */}
                    {status === "ongoing" && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">

                            <div className="flex items-center gap-2 text-blue-700">

                                <i className="ri-car-line text-lg"></i>

                                <div>
                                    <div className="text-sm font-medium">
                                        Ride in Progress
                                    </div>

                                    <div className="text-xs">
                                        You're on your way to destination
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Riding;
