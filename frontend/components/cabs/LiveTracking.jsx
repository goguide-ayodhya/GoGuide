import React, { useState, useEffect, useContext } from 'react'
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api'
import { SocketContext } from '@/contexts/cabs/SocketContext'
import { useActiveRide } from '@/contexts/ActiveRideContext'

const containerStyle = {
    width: '100%',
    height: '100%',
};

const center = {
    lat: -3.745,
    lng: -38.523
};

const LiveTracking = () => {
    const [ currentPosition, setCurrentPosition ] = useState(center);
    const { socket } = useContext(SocketContext);
    const { activeRide } = useActiveRide();

    useEffect(() => {
        // Block tracking until activeRide._id exists
        if (!activeRide?._id) {
            console.log('[DRIVER] Blocking GPS tracking - no active ride ID found');
            return;
        }

        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            console.log("Position updated:", latitude, longitude);
            const newLocation = {
                lat: latitude,
                lng: longitude
            };
            setCurrentPosition(newLocation);
            
            // Emit location to socket for tourist tracking using ActiveRideContext
            console.log('[DRIVER] Active ride from context:', activeRide);
            console.log('[DRIVER] Socket connected:', !!socket);
            console.log('[DRIVER] Socket ID:', socket.id);
            console.log('[DRIVER] Socket connected:', socket.connected);
            console.log('[DRIVER] Active ride ID:', activeRide._id);
            
            if (socket && activeRide?._id) {
                const locationData = {
                    rideId: activeRide._id,
                    lat: latitude,
                    lng: longitude,
                    eta: '5 min' // You can calculate actual ETA based on distance
                };
                socket.emit('driver-location-update', locationData);
                console.log('[DRIVER] Emitting location update:', locationData);
            } else {
                console.log('[DRIVER] Cannot emit location - missing socket or active ride ID');
            }
        }, (error) => {
            console.error('[DRIVER] Geolocation error:', error);
        });

        const watchId = navigator.geolocation.watchPosition((position) => {
            // Block tracking until activeRide._id exists
            if (!activeRide?._id) {
                console.log('[DRIVER] Watch position - Blocking GPS tracking - no active ride ID found');
                return;
            }

            const { latitude, longitude } = position.coords;
            console.log("Position updated:", latitude, longitude);
            const newLocation = {
                lat: latitude,
                lng: longitude
            };
            setCurrentPosition(newLocation);
            
            // Emit location updates to socket for tourist tracking using ActiveRideContext
            console.log('[DRIVER] Watch position - Active ride from context:', activeRide);
            console.log('[DRIVER] Watch position - Socket connected:', !!socket);
            console.log('[DRIVER] Watch position - Socket ID:', socket.id);
            console.log('[DRIVER] Watch position - Socket connected:', socket.connected);
            console.log('[DRIVER] Watch position - Active ride ID:', activeRide?._id);
            
            if (socket && activeRide?._id) {
                const locationData = {
                    rideId: activeRide._id,
                    lat: latitude,
                    lng: longitude,
                    eta: '5 min' // You can calculate actual ETA based on distance
                };
                socket.emit('driver-location-update', locationData);
                console.log('[DRIVER] Watch position - Location update emitted:', {
                  rideId: activeRide?._id,
                  lat: latitude,
                  lng: longitude,
                  eta: "5 min",
                });
            } else {
                console.log('[DRIVER] Watch position - Cannot emit - missing socket or active ride ID');
            }
        }, (error) => {
            console.error('[DRIVER] Watch position error:', error);
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, [socket, activeRide]);

    useEffect(() => {
        const updatePosition = () => {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;

                console.log('Position updated:', latitude, longitude);
                setCurrentPosition({
                    lat: latitude,
                    lng: longitude
                });
            });
        };

        updatePosition(); // Initial position update

        const intervalId = setInterval(updatePosition, 1000); // Update every 10 seconds

    }, []);

    return (
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={currentPosition}
                zoom={15}
            >
                <Marker position={currentPosition} />
            </GoogleMap>
        </LoadScript>
    )
}

export default LiveTracking