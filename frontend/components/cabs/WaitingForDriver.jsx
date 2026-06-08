import React from "react";

const WaitingForDriver = (props) => {
  return (
    <div className="w-full">
      <button
        onClick={() => {
          props.setWaitingForDriver(false);
        }}
        className="sticky top-0 p-2 text-center w-full md:hidden focus:outline-none"
      >
        <i className="text-3xl text-gray-300 ri-arrow-down-wide-line"></i>
      </button>

      {/* Driver + OTP Info */}
      <div className="flex items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 p-3 sm:p-4 border border-yellow-200 rounded-lg bg-yellow-50">
        <img
          className="h-16 sm:h-20 md:h-24 w-auto animate-pulse"
          src={`/assets/vehicle/${
            props.vehicleType === "car"
              ? "goCab"
              : props.vehicleType === "moto"
              ? "goMoto"
              : "goAuto"
          }.webp`}
          alt="Vehicle"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-md font-medium capitalize truncate">
            {props.ride?.driver?.userId?.fullname?.firstname &&
            props.ride?.driver?.userId?.fullname?.lastname
              ? `${props.ride?.driver?.userId?.fullname?.firstname} ${props.ride?.driver?.userId?.fullname?.lastname}`
              : props.ride?.driver?.userId?.fullname?.firstname ||
                props.ride?.driver?.driverName ||
                "Driver"}
          </h2>
          <h4 className="text-lg sm:text-md font-semibold text-gray-900">
            {props.ride?.driver?.vehicleNumber || "Loading..."}
          </h4>
          <p className="text-xs sm:text-sm text-gray-600">
            {props.ride?.driver?.vehicleName ||
              props.ride?.driver?.vehicleType ||
              "Cab"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">OTP</p>
          <h1 className="text-xl sm:text-xl md:text-3xl font-bold text-green-600">
            {props.ride?.otp || "****"}
          </h1>
        </div>
      </div>

      {/* Ride Details */}
      <div className="flex gap-2 justify-between flex-col items-center">
        <div className="w-full space-y-0">
          <div className="flex items-center gap-3 sm:gap-5 p-3 sm:p-4 border-b-2">
            <i className="ri-map-pin-user-fill text-lg sm:text-xl"></i>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-medium">
                Pickup Location
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {props.ride?.pickup || "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5 p-3 sm:p-4 border-b-2">
            <i className="text-base sm:text-lg ri-map-pin-2-fill"></i>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-medium">Destination</h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {props.ride?.destination || "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5 p-3 sm:p-4">
            <i className="ri-currency-line text-lg sm:text-xl"></i>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-medium">
                ₹{props.ride?.fare || "0"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">Estimated Fare</p>
            </div>
          </div>
        </div>
      </div>

      {/* [CANCEL_FLOW] Cancel ride button — only allowed during accepted status, hidden once ongoing */}
      {props.onCancelRide && props.ride?.status === "accepted" && (
        <button
          onClick={props.onCancelRide}
          disabled={props.isCancelling}
          className="mt-4 w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-medium p-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {props.isCancelling ? "Cancelling..." : "Cancel Ride"}
        </button>
      )}
    </div>
  );
};

export default WaitingForDriver;
