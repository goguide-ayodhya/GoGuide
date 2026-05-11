import React from 'react'
import { useRouter } from 'next/navigation'

const BookingSuccess = (props) => {
    const router = useRouter()

    const handleBackToBookings = () => {
        router.push('/tourist/bookings')
    }

    return (
        <div 
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={(e) => {
                e.stopPropagation();
                props.setBookingSuccess(false);
            }}
        >
            <div 
                className="w-full max-w-md bg-white rounded-lg shadow-xl m-4 max-h-[90vh] overflow-y-auto pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
            >
            <button 
                onClick={() => {
                    props.setBookingSuccess(false)
                }}
                className='sticky top-0 p-2 text-center w-full md:hidden focus:outline-none'
            >
                <i className="text-3xl text-gray-300 ri-arrow-down-wide-line"></i>
            </button>
            
            <div className='flex flex-col items-center justify-center py-8'>
                <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4'>
                    <i className="ri-check-line text-4xl text-green-600"></i>
                </div>
                
                <h3 className='text-2xl font-semibold mb-2'>Booking Sent!</h3>
                <p className='text-gray-600 text-center mb-6 px-4'>
                    Your ride request has been sent. 
                    Wait for a driver accepts your request.
                </p>

                <div className='w-full space-y-3'>
                    <div className='bg-gray-50 p-4 rounded-lg'>
                        <div className='flex items-center gap-3 mb-3'>
                            <i className="ri-map-pin-user-fill text-lg text-gray-700"></i>
                            <div>
                                <h4 className='font-medium'>Pickup</h4>
                                <p className='text-sm text-gray-600 truncate'>{props.pickup}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3 mb-3'>
                            <i className="ri-map-pin-2-fill text-lg text-gray-700"></i>
                            <div>
                                <h4 className='font-medium'>Destination</h4>
                                <p className='text-sm text-gray-600 truncate'>{props.destination}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3'>
                            <i className="ri-currency-line text-lg text-gray-700"></i>
                            <div>
                                <h4 className='font-medium'>Estimated Fare</h4>
                                <p className='text-sm text-gray-600'>₹{props.fare[props.vehicleType]}</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleBackToBookings}
                        className='w-full bg-black hover:bg-gray-800 text-white font-medium p-3 rounded-lg transition'
                    >
                        Back to My Bookings
                    </button>
                </div>
            </div>
        </div>
        </div>
    )
}

export default BookingSuccess
