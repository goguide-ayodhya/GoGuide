import React from 'react'

const VehiclePanel = (props) => {
    return (
        <div className="w-full">
            <button 
                onClick={() => {
                    props.setVehiclePanel(false)
                }}
                className='sticky top-0 p-2 text-center w-full md:hidden focus:outline-none'
            >
                <i className="text-3xl text-gray-300 ri-arrow-down-wide-line"></i>
            </button>
            <h3 className='text-xl sm:text-2xl font-semibold mb-4 sm:mb-5 px-0'>Choose a Vehicle</h3>
            
            <div className="space-y-2 sm:space-y-3">
                <div onClick={() => {
                    props.setConfirmRidePanel(true)
                    props.selectVehicle('car')
                }} className='flex border-2 hover:border-blue-400 active:border-blue-600 mb-0 rounded-xl w-full p-3 sm:p-4 items-center justify-between cursor-pointer transition'>
                    <img className='h-10 sm:h-12 w-auto' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="UberGo" />
                    <div className='ml-2 sm:ml-3 flex-1 min-w-0'>
                        <h4 className='font-medium text-sm sm:text-base leading-tight'>UberGo <span className='text-xs sm:text-sm'><i className="ri-user-3-fill"></i>4</span></h4>
                        <h5 className='font-medium text-xs sm:text-sm text-gray-600'>2 mins away</h5>
                        <p className='font-normal text-xs text-gray-500'>Affordable, compact</p>
                    </div>
                    <h2 className='text-base sm:text-lg font-semibold ml-2 whitespace-nowrap'>₹{props.fare.car}</h2>
                </div>
                
                <div onClick={() => {
                    props.setConfirmRidePanel(true)
                    props.selectVehicle('moto')
                }} className='flex border-2 hover:border-blue-400 active:border-blue-600 mb-0 rounded-xl w-full p-3 sm:p-4 items-center justify-between cursor-pointer transition'>
                    <img className='h-10 sm:h-12 w-auto' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_638,w_956/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png" alt="Moto" />
                    <div className='ml-2 sm:ml-3 flex-1 min-w-0'>
                        <h4 className='font-medium text-sm sm:text-base leading-tight'>Moto <span className='text-xs sm:text-sm'><i className="ri-user-3-fill"></i>1</span></h4>
                        <h5 className='font-medium text-xs sm:text-sm text-gray-600'>3 mins away</h5>
                        <p className='font-normal text-xs text-gray-500'>Affordable motorcycle</p>
                    </div>
                    <h2 className='text-base sm:text-lg font-semibold ml-2 whitespace-nowrap'>₹{props.fare.moto}</h2>
                </div>
                
                <div onClick={() => {
                    props.setConfirmRidePanel(true)
                    props.selectVehicle('auto')
                }} className='flex border-2 hover:border-blue-400 active:border-blue-600 mb-0 rounded-xl w-full p-3 sm:p-4 items-center justify-between cursor-pointer transition'>
                    <img className='h-10 sm:h-12 w-auto' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png" alt="UberAuto" />
                    <div className='ml-2 sm:ml-3 flex-1 min-w-0'>
                        <h4 className='font-medium text-sm sm:text-base leading-tight'>UberAuto <span className='text-xs sm:text-sm'><i className="ri-user-3-fill"></i>3</span></h4>
                        <h5 className='font-medium text-xs sm:text-sm text-gray-600'>3 mins away</h5>
                        <p className='font-normal text-xs text-gray-500'>Affordable Auto rides</p>
                    </div>
                    <h2 className='text-base sm:text-lg font-semibold ml-2 whitespace-nowrap'>₹{props.fare.auto}</h2>
                </div>
            </div>
        </div>
    )
}

export default VehiclePanel