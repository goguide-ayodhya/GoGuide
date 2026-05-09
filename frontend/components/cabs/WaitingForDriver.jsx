import React from 'react'

const WaitingForDriver = (props) => {
  return (
    <div className="w-full">
      <button 
        onClick={() => {
          props.setWaitingForDriver(false)
        }}
        className='sticky top-0 p-2 text-center w-full md:hidden focus:outline-none'
      >
        <i className="text-3xl text-gray-300 ri-arrow-down-wide-line"></i>
      </button>

      <div className='flex items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 p-3 sm:p-4 border border-yellow-200 rounded-lg bg-yellow-50'>
        <img className='h-12 sm:h-14 md:h-16 w-auto rounded-lg' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="Vehicle" />
        <div className='flex-1 min-w-0'>
          <h2 className='text-base sm:text-lg font-medium capitalize truncate'>{props.ride?.captain?.fullname?.firstname || 'Driver'}</h2>
          <h4 className='text-lg sm:text-xl font-semibold text-gray-900'>{props.ride?.captain?.vehicle?.plate || 'Loading...'}</h4>
          <p className='text-xs sm:text-sm text-gray-600'>Maruti Suzuki Alto</p>
        </div>
        <div className='text-right'>
          <p className='text-xs text-gray-500'>OTP</p>
          <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-green-600'>{props.ride?.otp || '****'}</h1>
        </div>
      </div>

      <div className='flex gap-2 justify-between flex-col items-center'>
        <div className='w-full space-y-0'>
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
              <p className='text-xs sm:text-sm text-gray-600'>Estimated Fare</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WaitingForDriver