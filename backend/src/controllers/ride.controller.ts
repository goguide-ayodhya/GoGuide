import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as rideService from '../services/ride.service';
import * as mapService from '../services/maps.service';
import { sendMessageToSocketId } from '../socket';
import { Ride } from '../models/Ride';
import { AuthRequest } from '../middleware/auth';
import { Driver, IDriver } from '../models/Driver';
import { User, IUser } from '../models/User';


export const createRide = async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicleType } = req.body;

    try {
        const ride = await rideService.createRide({
            user: req.userId,
            pickup,
            destination,
            vehicleType
        });

        res.status(201).json(ride);

        // Get all active verified drivers instead of nearby drivers
        const activeDrivers = await Driver.find({
            isAvailable: true,
            verificationStatus: "VERIFIED"
        }).populate('userId');

        // don't send OTP to drivers
        const rideData = ride.toObject() as any;
        delete rideData.otp;

        const rideWithUser = await Ride.findOne({ _id: ride._id }).populate('user');

        // Send ride request to all active drivers
        activeDrivers.forEach(async (driver) => {
            const driverUser = driver.userId as any;
            if (driverUser && driverUser.socketId) {
                sendMessageToSocketId(driverUser.socketId, {
                    event: 'new-ride',
                    data: rideWithUser
                });
            }
        });

        console.log(`[RIDE] Broadcasted ride ${ride._id} to ${activeDrivers.length} active drivers`);

    } catch (err: any) {
        console.log(err);
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

        // populate to get the user's socketId
        const user = await User.findById(ride.user);

        if (user && user.socketId) {
            sendMessageToSocketId(user.socketId, {
                event: 'ride-confirmed',
                data: ride
            });
        }

        console.log(`[RIDE] Driver ${driver._id} accepted ride ${rideId}`);
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

        if (user && user.socketId) {
            sendMessageToSocketId(user.socketId, {
                event: 'ride-started',
                data: ride
            });
        }

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