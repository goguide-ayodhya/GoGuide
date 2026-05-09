import React, { useRef, useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import CaptainDetails from '../components/CaptainDetails'
import RidePopUp from '../components/RidePopUp'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ConfirmRidePopUp from '../components/ConfirmRidePopUp'
import { SocketContext } from '@/contexts/cabs/SocketContext'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'

const CaptainHome = () => {

    const [ ridePopupPanel, setRidePopupPanel ] = useState(false)
    const [ confirmRidePopupPanel, setConfirmRidePopupPanel ] = useState(false)

    const ridePopupPanelRef = useRef(null)
    const confirmRidePopupPanelRef = useRef(null)
    const [ ride, setRide ] = useState(null)

    const { socket } = useContext(SocketContext)
    const { user: captain } = useAuth()

    useEffect(() => {
        if (!captain?._id && !captain?.id) return;
        const captainId = captain._id || captain.id;

        socket.emit('join', {
            userId: captainId,
            userType: 'driver'
        })
        const updateLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {

                    socket.emit('update-location-captain', {
                        userId: captainId,
                        location: {
                            ltd: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    })
                })
            }
        }

        const locationInterval = setInterval(updateLocation, 10000)
        updateLocation()

        // return () => clearInterval(locationInterval)
    }, [])

    socket.on('new-ride', (data) => {

        setRide(data)
        setRidePopupPanel(true)

    })

    async function confirmRide() {

        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/rides/confirm`, {
            rideId: ride._id,
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })

        setRidePopupPanel(false)
        setConfirmRidePopupPanel(true)

    }


    useGSAP(function () {
        if (ridePopupPanel) {
            gsap.to(ridePopupPanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(ridePopupPanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ ridePopupPanel ])

    useGSAP(function () {
        if (confirmRidePopupPanel) {
            gsap.to(confirmRidePopupPanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(confirmRidePopupPanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ confirmRidePopupPanel ])

    return (
        <div className='h-screen flex flex-col'>
            <div className='fixed inset-x-0 top-0 p-4 sm:p-6 flex items-center justify-between bg-white/95 backdrop-blur-sm z-40 border-b border-gray-100'>
                <img className='w-12 sm:w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Logo" />
                <Link href='/driver/dashboard' className='h-9 sm:h-10 w-9 sm:w-10 bg-white flex items-center justify-center rounded-full hover:bg-gray-100 transition'>
                    <i className="text-base sm:text-lg font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>
            <div className='h-3/5 mt-14 sm:mt-16'>
                <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="Background" />
            </div>
            <div className='h-2/5 p-4 sm:p-6 overflow-y-auto'>
                <CaptainDetails />
            </div>
            <div ref={ridePopupPanelRef} className='fixed inset-x-0 bottom-0 z-50 translate-y-full bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 pt-8 sm:pt-10 md:pt-12 max-h-[85vh] overflow-y-auto rounded-t-3xl md:rounded-t-2xl shadow-2xl md:shadow-xl md:max-w-2xl md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2'>
                <RidePopUp
                    ride={ride}
                    setRidePopupPanel={setRidePopupPanel}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    confirmRide={confirmRide}
                />
            </div>
            <div ref={confirmRidePopupPanelRef} className='fixed inset-x-0 bottom-0 z-50 translate-y-full bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 pt-8 sm:pt-10 md:pt-12 max-h-[85vh] overflow-y-auto rounded-t-3xl md:rounded-t-2xl shadow-2xl md:shadow-xl md:max-w-2xl md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2'>
                <ConfirmRidePopUp
                    ride={ride}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel} setRidePopupPanel={setRidePopupPanel} />
            </div>
        </div>
    )
}

export default CaptainHome