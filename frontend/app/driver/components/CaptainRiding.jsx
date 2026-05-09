import React, { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FinishRide from '../components/FinishRide'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import LiveTracking from '../components/LiveTracking'

const CaptainRiding = () => {

    const [ finishRidePanel, setFinishRidePanel ] = useState(false)
    const finishRidePanelRef = useRef(null)
    const location = useLocation()
    const rideData = location.state?.ride



    useGSAP(function () {
        if (finishRidePanel) {
            gsap.to(finishRidePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(finishRidePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ finishRidePanel ])


    return (
        <div className='h-screen flex flex-col relative'>
            <div className='fixed inset-x-0 top-0 p-4 sm:p-6 flex items-center justify-between bg-white/95 backdrop-blur-sm z-40 border-b border-gray-100'>
                <img className='w-12 sm:w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Logo" />
                <Link href='/driver/dashboard' className='h-9 sm:h-10 w-9 sm:w-10 bg-white flex items-center justify-center rounded-full hover:bg-gray-100 transition'>
                    <i className="text-base sm:text-lg font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>

            <div className='flex-1 mt-14 sm:mt-16'>
                <LiveTracking />
            </div>

            <div className='h-auto sm:h-1/5 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between relative bg-yellow-400 gap-3 rounded-t-2xl sm:rounded-none cursor-pointer hover:bg-yellow-500 transition'
                onClick={() => {
                    setFinishRidePanel(true)
                }}
            >
                <button className='sm:hidden w-full text-center pb-2'>
                    <i className="text-3xl text-gray-800 ri-arrow-up-wide-line"></i>
                </button>
                <h4 className='text-lg sm:text-xl font-semibold flex-1'>{'4 KM away'}</h4>
                <button className='w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold p-2.5 sm:p-3 sm:px-10 rounded-lg transition'>
                    Complete Ride
                </button>
            </div>
            
            <div ref={finishRidePanelRef} className='fixed inset-x-0 bottom-0 z-50 translate-y-full bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 pt-8 sm:pt-10 md:pt-12 max-h-[85vh] overflow-y-auto rounded-t-3xl md:rounded-t-2xl shadow-2xl md:shadow-xl md:max-w-2xl md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2'>
                <FinishRide
                    ride={rideData}
                    setFinishRidePanel={setFinishRidePanel} />
            </div>
        </div>
    )
}

export default CaptainRiding