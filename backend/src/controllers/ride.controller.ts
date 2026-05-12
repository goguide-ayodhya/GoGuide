import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as rideService from '../services/ride.service';
import * as mapService from '../services/maps.service';
import { sendMessageToSocketId } from '../socket';
import { Ride } from '../models/Ride';
import { AuthRequest } from '../middleware/auth';
import { Driver, IDriver } from '../models/Driver';
import { User, IUser } from '../models/User';

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};

export const createRide = async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicleType } = req.body;

    try {
        // Create ride first
        const ride = await rideService.createRide({
            user: req.userId,
            pickup,
            destination,
            vehicleType
        });

        // Get all active verified drivers
        const activeDrivers = await Driver.find({
            isAvailable: true,
            verificationStatus: "VERIFIED"
        }).populate('userId');

        // Prepare ride data for socket
        const rideData = ride.toObject() as any;
        delete rideData.otp;

        const rideWithUser = await Ride.findOne({ _id: ride._id }).populate('user');

        // Validate rideWithUser exists before using
        if (!rideWithUser) {
            console.error('[RIDE] Ride user data not found');
            return res.status(500).json({ message: 'Ride user data not found' });
        }

        // Send ride request only to nearby drivers within 5km radius
        const nearbyDrivers = [];
        for (const driver of activeDrivers) {
            const driverUser = driver.userId as any;
            if (driverUser.currentLocation && ride.pickup) {
                // Direct coordinate access - no parsing needed
                const distance = calculateDistance(
                    driverUser.currentLocation.lat,
                    driverUser.currentLocation.lng,
                    ride.pickup.lat,
                    ride.pickup.lng
                );
                
                if (distance <= 5) { // 5km radius
                    nearbyDrivers.push(driver);
                }
            } else {
                // If no location, include as fallback
                nearbyDrivers.push(driver);
            }
        }

        // Send ride request to nearby drivers only
        nearbyDrivers.forEach(async (driver) => {
            const driverUser = driver.userId as any;
            if (driverUser && driverUser.socketId) {
                sendMessageToSocketId(driverUser.socketId, {
                    event: 'new-ride',
                    data: {
                        ...rideWithUser.toObject(),
                        distance: driverUser.currentLocation ? calculateDistance(
                            driverUser.currentLocation.lat,
                            driverUser.currentLocation.lng,
                            ride.pickup.lat,
                            ride.pickup.lng
                        ) : null
                    }
                });
            }
        });

        console.log(`[RIDE] Created ride ${ride._id} and sent to ${nearbyDrivers.length}/${activeDrivers.length} nearby drivers`);
        
        // Send single response
        return res.status(201).json(ride);

    } catch (err: any) {
        console.error('[RIDE] Error creating ride:', err);
        return res.status(500).json({ message: err.message });
    }
};

export const getFare = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const pickup = req.query.pickup as string;
    const destination = req.query.destination as string;

    try {
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json(fare);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

export const confirmRide = async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const driver = await Driver.findOne({ userId: req.userId });
        if (!driver) {
            return res.status(404).json({ message: 'Driver profile not found' });
        }

        // Check if ride is still pending before accepting
        const existingRide = await Ride.findById(rideId);
        if (!existingRide) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (existingRide.status !== 'pending') {
            return res.status(400).json({ 
                message: 'Ride is no longer available',
                status: existingRide.status 
            });
        }

        const ride = await rideService.confirmRide({ rideId, driver });

        // populate to get the user's socketId and driver details
        const user = await User.findById(ride.user);
        
        // Get driver details with user info
        const driverWithUser = await Driver.findById(driver._id).populate('userId');

        // Send confirmation to user
        if (user && user.socketId) {
            sendMessageToSocketId(user.socketId, {
                event: 'ride-confirmed',
                data: ride
            });
        }

        // Send ride-accepted event to all drivers to remove from their pending list
        const allActiveDrivers = await Driver.find({
            isAvailable: true,
            verificationStatus: "VERIFIED"
        }).populate('userId');

        // Send to the accepting driver
        const acceptingDriverUser = await Driver.findById(driver._id).populate('userId');
        const acceptingDriverSocketId = (acceptingDriverUser as any)?.userId?.socketId;

        if (acceptingDriverSocketId) {
            sendMessageToSocketId(acceptingDriverSocketId, {
                event: 'ride-accepted-driver',
                data: ride
            });
        }

        // Send to all other drivers to remove from pending list
        allActiveDrivers.forEach(async (activeDriver) => {
            const driverUser = activeDriver.userId as any;
            if (driverUser && driverUser.socketId && driverUser._id.toString() !== driver._id.toString()) {
                sendMessageToSocketId(driverUser.socketId, {
                    event: 'ride-accepted',
                    data: {
                        rideId: rideId,
                        acceptedBy: driver._id,
                        message: 'Ride has been accepted by another driver'
                    }
                });
            }
        });

        console.log(`[RIDE] Driver ${driver._id} accepted ride ${rideId} and notified ${allActiveDrivers.length} drivers`);
        return res.status(200).json(ride);
    } catch (err: any) {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
};

export const startRide = async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const rideId = req.query.rideId as string;
    const otp = req.query.otp as string;

    try {
        const driver = await Driver.findOne({ userId: req.userId });
        if (!driver) {
            return res.status(404).json({ message: 'Driver profile not found' });
        }

        const ride = await rideService.startRide({ rideId, otp, driver });

        const user = await User.findById(ride.user);

        // Send ride-started event to user
        if (user && user.socketId) {
            sendMessageToSocketId(user.socketId, {
                event: 'ride-started',
                data: ride
            });
        }

        // Send ride-started event to driver
        const driverUser = await Driver.findById(driver._id).populate('userId');
        const driverSocketId = (driverUser as any)?.userId?.socketId;

        if (driverSocketId) {
            sendMessageToSocketId(driverSocketId, {
                event: 'ride-started-driver',
                data: ride
            });
        }

        console.log(`[RIDE] Driver ${driver._id} started ride ${rideId} and notified user and driver`);
        return res.status(200).json(ride);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

export const endRide = async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const driver = await Driver.findOne({ userId: req.userId });
        if (!driver) {
            return res.status(404).json({ message: 'Driver profile not found' });
        }

        const ride = await rideService.endRide({ rideId, driver });

        const user = await User.findById(ride.user);

        if (user && user.socketId) {
            sendMessageToSocketId(user.socketId, {
                event: 'ride-ended',
                data: ride
            });
        }

        return res.status(200).json(ride);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

export const getPendingRides = async (req: AuthRequest, res: Response) => {
    try {
        console.log(`[RIDE] Fetching pending rides for driver ${req.userId}`);
        
        const driver = await Driver.findOne({ userId: req.userId }).populate('userId');
        if (!driver) {
            return res.status(404).json({ message: 'Driver profile not found' });
        }

        const allPendingRides = await Ride.find({ 
            status: 'pending' 
        })
        .populate('user')
        .sort({ createdAt: -1 });

        const driverLocation = (driver.userId as any).currentLocation;
        
        // Filter rides based on criteria
        const filteredRides = allPendingRides.filter(ride => {
            // 1. Status must be pending (already filtered)
            // 2. Not expired (3-4 minutes expiry)
            const rideAge = (Date.now() - new Date(ride.createdAt).getTime()) / (1000 * 60); // minutes
            if (rideAge > 4) return false; // Expired after 4 minutes
            
            // 3. Within 5km radius if driver has location
            if (driverLocation && ride.pickup) {
                // Direct coordinate access - no parsing needed
                const distance = calculateDistance(
                    driverLocation.lat,
                    driverLocation.lng,
                    ride.pickup.lat,
                    ride.pickup.lng
                );
                if (distance > 5) return false; // Outside 5km radius
            }
            
            return true;
        });

        console.log(`[PENDING RIDES] Driver ${req.userId} received ${filteredRides.length}/${allPendingRides.length} eligible rides`);
        return res.status(200).json(filteredRides);
    } catch (err: any) {
        console.error('[RIDE] Error fetching pending rides:', err);
        return res.status(500).json({ message: err.message });
    }
};