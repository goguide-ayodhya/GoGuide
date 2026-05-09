import React from 'react'

const RidePopUp = (props) => {
    return (
        <div className="w-full">
            <button 
                onClick={() => {
                    props.setRidePopupPanel(false)
                }}
                className='sticky top-0 p-2 text-center w-full md:hidden focus:outline-none'
            >
                <i className="text-3xl text-gray-300 ri-arrow-down-wide-line"></i>
            </button>
            <h3 className='text-xl sm:text-2xl font-semibold mb-4 sm:mb-5'>New Ride Available!</h3>
            <div className='flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-yellow-100 border border-yellow-300 rounded-xl mt-3 sm:mt-4'>
                <div className='flex items-center gap-2 sm:gap-3 flex-1 min-w-0'>
                    <img className='h-12 sm:h-14 rounded-full object-cover w-12 sm:w-14 flex-shrink-0' src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" alt="User" />
                    <h2 className='text-base sm:text-lg font-medium truncate'>{props.ride?.user?.fullname?.firstname || 'Passenger'} {props.ride?.user?.fullname?.lastname || ''}</h2>
                </div>
                <h5 className='text-base sm:text-lg font-semibold whitespace-nowrap ml-2'>2.2 KM</h5>
            </div>
            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-4 sm:mt-5 space-y-0'>
                    <div className='flex items-center gap-3 sm:gap-5 p-3 sm:p-4 border-b-2'>
                        <i className="ri-map-pin-user-fill text-lg sm:text-xl"></i>
                        <div className='flex-1 min-w-0'>
                            <h3 className='text-base sm:text-lg font-medium'>Pickup Location</h3>
                            <p className='text-xs sm:text-sm text-gray-600 truncate'>{props.ride?.pickup || 'Loading...'}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-3 sm:gap-5 p-3 sm:p-4 border-b-2'>
                        <i className="text-base sm:text-lg ri-map-pin-2-fill"></i>
                        <div className='flex-1 min-w-0'>
                            <h3 className='text-base sm:text-lg font-medium'>Destination</h3>
                            <p className='text-xs sm:text-sm text-gray-600 truncate'>{props.ride?.destination || 'Loading...'}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-3 sm:gap-5 p-3 sm:p-4'>
                        <i className="ri-currency-line text-lg sm:text-xl"></i>
                        <div className='flex-1 min-w-0'>
                            <h3 className='text-base sm:text-lg font-medium'>₹{props.ride?.fare || '0'}</h3>
                            <p className='text-xs sm:text-sm text-gray-600'>Cash Payment</p>
                        </div>
                    </div>
                </div>
                <div className='mt-4 sm:mt-5 md:mt-6 w-full space-y-2 sm:space-y-3'>
                    <button 
                        onClick={() => {
                            props.setConfirmRidePopupPanel(true)
                            props.confirmRide()
                        }} 
                        className='w-full bg-green-600 hover:bg-green-700 text-white font-semibold p-2.5 sm:p-3 rounded-lg transition'
                    >
                        Accept Ride
                    </button>
                    <button 
                        onClick={() => {
                            props.setRidePopupPanel(false)
                        }} 
                        className='w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold p-2.5 sm:p-3 rounded-lg transition'
                    >
                        Ignore
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RidePopUp