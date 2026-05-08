import axios from 'axios';
import { Driver } from '../models/Driver';

export const getAddressCoordinate = async (address: string) => {
    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            const location = response.data.results[ 0 ].geometry.location;
            return {
                ltd: location.lat,
                lng: location.lng
            };
        } else {
            throw new Error('Unable to fetch coordinates');
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getDistanceTime = async (origin: string, destination: string) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    const apiKey = process.env.GOOGLE_MAPS_API;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            if (response.data.rows[ 0 ].elements[ 0 ].status === 'ZERO_RESULTS') {
                throw new Error('No routes found');
            }

            return response.data.rows[ 0 ].elements[ 0 ];
        } else {
            throw new Error('Unable to fetch distance and time');
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const getAutoCompleteSuggestions = async (input: string) => {
    if (!input) {
        throw new Error('query is required');
    }

    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            return response.data.predictions.map((prediction: any) => prediction.description).filter((value: any) => value);
        } else {
            throw new Error('Unable to fetch suggestions');
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const getCaptainsInTheRadius = async (ltd: number, lng: number, radius: number) => {
    // radius in km
    const drivers = await Driver.find({
        isAvailable: true,
        verificationStatus: "VERIFIED",
        // Since MongoDB geo queries are tricky without proper indexing,
        // we'll filter them manually or assume a format
        currentLocation: {
            $exists: true
        }
    });
    
    // Manual haversine distance filtering for simplicity and robustness since we didn't add a 2dsphere index yet
    // Wait, let's just use MongoDB's center sphere on the lat/lng fields.
    // MongoDB doesn't support $geoWithin without GeoJSON or legacy coordinate arrays.
    // Since our currentLocation is an object with lat/lng, we will calculate distance manually in code for this subset.
    const toRad = (x: number) => x * Math.PI / 180;
    const R = 6371; // Earth's radius in km
    
    const nearbyDrivers = drivers.filter(driver => {
        if (!driver.currentLocation || driver.currentLocation.lat == null) return false;
        
        const dLat = toRad(driver.currentLocation.lat - ltd);
        const dLon = toRad(driver.currentLocation.lng - lng);
        const lat1 = toRad(ltd);
        const lat2 = toRad(driver.currentLocation.lat);

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const distance = R * c;
        
        return distance <= radius;
    });

    return nearbyDrivers;
};