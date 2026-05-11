import { assets } from "@/public/assets/assets";
import React from "react";

const VehiclePanel = (props) => {
  return (
    <div className="w-full">
      <button
        onClick={() => {
          props.setVehiclePanel(false);
        }}
        className="sticky top-0 p-2 text-center w-full md:hidden focus:outline-none"
      >
        <i className="text-3xl text-gray-300 ri-arrow-down-wide-line"></i>
      </button>
      <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-5 px-0">
        Choose a Vehicle
      </h3>

      <div className="space-y-2 sm:space-y-3">
        <div
          onClick={() => props.selectVehicle("car")}
          role="button"
          tabIndex={0}
          className="flex border-2 hover:border-blue-400 active:border-blue-600 mb-0 rounded-xl w-full p-3 sm:p-4 items-center justify-between cursor-pointer transition"
        >
          <div className="w-10 overflow-visible">
            <img
              className="w-12 max-w-none object-cover"
              src="/assets/vehicle/goCab.webp"
              alt="GoCab"
            />
          </div>
          <div className="ml-2 sm:ml-3 flex-1 min-w-0">
            <h4 className="font-medium text-sm sm:text-base leading-tight">
              GoCab{" "}
              <span className="text-xs sm:text-sm">
                <i className="ri-user-3-fill"></i>3
              </span>
            </h4>
            {/* <h5 className="font-medium text-xs sm:text-sm text-gray-600">
              2 mins away
            </h5> */}
            <p className="font-normal text-xs text-gray-500">
              Affordable, compact
            </p>
          </div>
          <h2 className="text-base sm:text-lg font-semibold ml-2 whitespace-nowrap">
            ₹{props.fare.car}
          </h2>
        </div>

        <div
          onClick={() => props.selectVehicle("moto")}
          role="button"
          tabIndex={0}
          className="flex border-2 hover:border-blue-400 active:border-blue-600 mb-0 rounded-xl w-full p-3 sm:p-4 items-center justify-between cursor-pointer transition"
        >
          <div className="w-10 overflow-visible">
            <img
              className="w-12 max-w-none object-cover"
              src="/assets/vehicle/goMoto.webp"
              alt="Moto"
            />
          </div>
          <div className="ml-2 sm:ml-3 flex-1 min-w-0">
            <h4 className="font-medium text-sm sm:text-base leading-tight">
              Moto{" "}
              <span className="text-xs sm:text-sm">
                <i className="ri-user-3-fill"></i>1
              </span>
            </h4>
            {/* <h5 className="font-medium text-xs sm:text-sm text-gray-600">
              3 mins away
            </h5> */}
            <p className="font-normal text-xs text-gray-500">
              Affordable motorcycle
            </p>
          </div>
          <h2 className="text-base sm:text-lg font-semibold ml-2 whitespace-nowrap">
            ₹{props.fare.moto}
          </h2>
        </div>

        <div
          onClick={() => props.selectVehicle("auto")}
          role="button"
          tabIndex={0}
          className="flex border-2 hover:border-blue-400 active:border-blue-600 mb-0 rounded-xl w-full p-3 sm:p-4 items-center justify-between cursor-pointer transition"
        >
          <div className="w-10 overflow-visible">
            <img
              className="w-12 max-w-none object-cover"
              src="/assets/vehicle/goAuto.webp"
              alt="GoAuto"
            />
          </div>
          <div className="ml-2 sm:ml-3 flex-1 min-w-0">
            <h4 className="font-medium text-sm sm:text-base leading-tight">
              UberAuto{" "}
              <span className="text-xs sm:text-sm">
                <i className="ri-user-3-fill"></i>4
              </span>
            </h4>
            {/* <h5 className="font-medium text-xs sm:text-sm text-gray-600">
              3 mins away
            </h5> */}
            <p className="font-normal text-xs text-gray-500">
              Affordable Auto rides
            </p>
          </div>
          <h2 className="text-base sm:text-lg font-semibold ml-2 whitespace-nowrap">
            ₹{props.fare.auto}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default VehiclePanel;
