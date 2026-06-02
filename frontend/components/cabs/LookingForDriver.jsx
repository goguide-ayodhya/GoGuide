import React from "react";

const LookingForDriver = (props) => {
  return (
    <div className="w-full">
      <button
        onClick={() => {
          props.setVehicleFound(false);
        }}
        className="sticky top-0 p-2 text-center w-full md:hidden focus:outline-none"
      >
        <i className="text-3xl text-gray-300 ri-arrow-down-wide-line"></i>
      </button>

      <div className="flex flex-col items-center justify-center gap-4">
        {/* Animated Vehicle */}
        <img
          className="h-20 w-auto animate-pulse"
          src={`/assets/vehicle/${
            props.vehicleType === "car"
              ? "goCab"
              : props.vehicleType === "moto"
              ? "goMoto"
              : "goAuto"
          }.webp`}
          alt="Vehicle"
        />

        <h3 className="text-xl sm:text-2xl font-semibold text-center">
          Looking for a Driver...
        </h3>

        <p className="text-sm text-gray-500 text-center">
          Searching nearby drivers for your ride
        </p>
      </div>

      {/* Ride Summary */}
      <div className="mt-4 w-full space-y-0">
        <div className="flex items-center gap-3 sm:gap-5 p-3 sm:p-4 border-b">
          <i className="ri-map-pin-user-fill text-lg sm:text-xl"></i>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-medium">Pickup</h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {props.pickup || "Loading..."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-5 p-3 sm:p-4 border-b">
          <i className="ri-map-pin-2-fill text-lg sm:text-xl"></i>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-medium">Destination</h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {props.destination || "Loading..."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-5 p-3 sm:p-4">
          <i className="ri-currency-line text-lg sm:text-xl"></i>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-medium">
              ₹{props.fare?.[props.vehicleType] || 0}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">Estimated Fare</p>
          </div>
        </div>
      </div>

      {/* [CANCEL_FLOW] Cancel ride button — allowed during searching */}
      {props.onCancelRide && (
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

export default LookingForDriver;