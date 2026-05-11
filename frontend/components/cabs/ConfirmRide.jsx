import React from 'react'

const ConfirmRide = (props) => {
    return (
        <div className="w-full">
            <button 
                onClick={() => {
                    props.setConfirmRidePanel(false)
                }}
                className='sticky top-0 p-2 text-center w-full md:hidden focus:outline-none'
            >
                <i className="text-3xl text-gray-300 ri-arrow-down-wide-line"></i>
            </button>
            <h3 className='text-xl sm:text-2xl font-semibold mb-4 sm:mb-5'>Confirm your Ride</h3>

            <div className='flex gap-3 sm:gap-4 justify-between flex-col items-center'>
                <img className='h-16 sm:h-20 md:h-24 w-auto animate-pulse' src={`/assets/vehicle/${props.vehicleType === 'car' ? 'goCab' : props.vehicleType === 'moto' ? 'goMoto' : 'goAuto'}.webp`} alt="Vehicle" />
                <div className='w-full mt-3 sm:mt-4 md:mt-5 space-y-0'>
                    <div className='flex items-center gap-3 sm:gap-5 p-3 sm:p-4 border-b-2'>
                        <i className="ri-map-pin-user-fill text-lg sm:text-xl"></i>
                        <div className='flex-1 min-w-0'>
                            <h3 className='text-base sm:text-lg font-medium'>Start</h3>
                            <p className='text-xs sm:text-sm text-gray-600 truncate'>{props.pickup}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-3 sm:gap-5 p-3 sm:p-4 border-b-2'>
                        <i className="text-base sm:text-lg ri-map-pin-2-fill"></i>
                        <div className='flex-1 min-w-0'>
                            <h3 className='text-base sm:text-lg font-medium'>DropOff</h3>
                            <p className='text-xs sm:text-sm text-gray-600 truncate'>{props.destination}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-3 sm:gap-5 p-3 sm:p-4'>
                        <i className="ri-currency-line text-lg sm:text-xl"></i>
                        <div className='flex-1 min-w-0'>
                            <h3 className='text-base sm:text-lg font-medium'>₹{props.fare[props.vehicleType]}</h3>
                            {/* <p className='text-xs sm:text-sm text-gray-600'>Cash Payment</p> */}
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => {
                        props.setVehicleFound(true)
                        props.setConfirmRidePanel(false)
                        props.createRide()
                    }} 
                    className='w-full mt-4 sm:mt-5 md:mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold p-2.5 sm:p-3 rounded-lg transition'
                >
                    Confirm Ride
                </button>
            </div>
        </div>
    )
}

export default ConfirmRide