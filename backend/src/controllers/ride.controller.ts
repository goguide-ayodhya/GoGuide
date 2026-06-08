import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as rideService from '../services/ride.service';
import * as mapService from '../services/maps.service';
import { driverCommissionService } from '../services/driverCommission.service';
import { sendMessageToSocketId, sendMessageToRoom } from '../socket';
import { Ride } from '../models/Ride';
import { AuthRequest } from '../middleware/auth';
import { Driver, IDriver } from '../models/Driver';
import { User, IUser } from '../models/User';
import { NotificationService } from '../services/notification.service';

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
            verificationStatus: "VERIFIED",
            isDeleted: { $ne: true },
            isActive: { $ne: false },
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
        const pickupLocation = typeof ride.pickup === 'string' ? JSON.parse(ride.pickup) : ride.pickup;
        const destinationLocation = typeof ride.destination === 'string' ? JSON.parse(ride.destination) : ride.destination;
        
        for (const driver of activeDrivers) {
            const driverUser = driver.userId as any;
            if (driverUser.currentLocation && pickupLocation) {
                // Direct coordinate access - no parsing needed
                const distance = calculateDistance(
                    driverUser.currentLocation.lat,
                    driverUser.currentLocation.lng,
                    pickupLocation.lat,
                    pickupLocation.lng
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
                            pickupLocation.lat,
                            pickupLocation.lng
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

        // Trigger push notification to user (tourist) asynchronously
        NotificationService.sendRideAcceptedNotification(rideId).catch(err => {
            console.error('Failed to send ride accepted push notification:', err);
        });

        // populate to get the user's socketId and driver details
        const user = await User.findById(ride.user);
        
        // Get driver details with user info
        const driverWithUser = await Driver.findById(driver._id).populate('userId');

        // Send confirmation to user and room
        sendMessageToRoom(`ride_${rideId}`, {
            event: 'ride-confirmed',
            data: ride
        });
        sendMessageToRoom(`ride_${rideId}`, {
            event: 'ride-accepted-driver',
            data: ride
        });

        if (user && user.socketId) {
            sendMessageToSocketId(user.socketId, {
                event: 'ride-confirmed',
                data: ride
            });
        }

        // Send ride-accepted event to all drivers to remove from their pending list
        const allActiveDrivers = await Driver.find({
            isAvailable: true,
            verificationStatus: "VERIFIED",
            isDeleted: { $ne: true },
            isActive: { $ne: false },
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

        // Trigger push notification to user (tourist) asynchronously
        NotificationService.sendRideStartedNotification(rideId).catch(err => {
            console.error('Failed to send ride started push notification:', err);
        });

        const user = await User.findById(ride.user);

        // Send ride-started event to room
        sendMessageToRoom(`ride_${rideId}`, {
            event: 'ride-started',
            data: ride
        });
        sendMessageToRoom(`ride_${rideId}`, {
            event: 'ride-started-driver',
            data: ride
        });

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

        console.log("[RIDE CONTROLLER] Ride ended with distance and duration:", {
          distance: ride.distance,
          duration: ride.duration,
          status: ride.status,
        });

        const user = await User.findById(ride.user);

        sendMessageToRoom(`ride_${rideId}`, {
            event: 'ride-payment-pending',
            data: ride
        });
        sendMessageToRoom(`ride_${rideId}`, {
            event: 'ride-ended',
            data: ride
        });

        if (user && user.socketId) {
            sendMessageToSocketId(user.socketId, {
                event: 'ride-payment-pending',
                data: ride
            });
        }

        return res.status(200).json(ride);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

export const confirmPayment = async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, paymentMethod } = req.body;

    try {
        const ride = await Ride.findById(rideId);

        if (!ride) {
            console.error(`[PAYMENT_CONFIRM] Ride not found: ${rideId}`);
            return res.status(404).json({ message: 'Ride not found' });
        }

        console.log(`[PAYMENT_STATUS] DB status before update for ride ${rideId}: status=${ride.status}, paymentStatus=${ride.paymentStatus}`);

        if (ride.status !== 'payment_pending') {
            console.warn(`[PAYMENT_CONFIRM] Ride ${rideId} is not in payment_pending state (current: ${ride.status})`);
            return res.status(400).json({ message: 'Ride is not waiting for payment' });
        }

        // Update ride to completed and mark payment as paid
        ride.status = 'completed';
        ride.paymentStatus = 'paid';
        ride.paymentMethod = paymentMethod;
        ride.paymentConfirmedAt = new Date();
        await ride.save();

        console.log(`[PAYMENT_STATUS] DB status after update for ride ${rideId}: status=${ride.status}, paymentStatus=${ride.paymentStatus}, paymentMethod=${ride.paymentMethod}`);

        // Fetch fully populated ride object to avoid any partial population issues
        const populatedRide = await Ride.findById(rideId)
            .populate('user')
            .populate({
                path: 'driver',
                populate: {
                    path: 'userId',
                    model: 'User',
                }
            });

        if (!populatedRide) {
            console.error(`[PAYMENT_CONFIRM] Failed to reload populated ride ${rideId}`);
            return res.status(500).json({ message: 'Error reloading populated ride' });
        }

        const driver = populatedRide.driver as any;
        if (!driver) {
            console.warn(`[PAYMENT] No driver associated with ride ${rideId}`);
            return res.status(500).json({ message: 'No driver associated with ride' });
        }

        // Generate driver earnings - call addDriverEarning
        const { driverCommissionService } = require('../services/driverCommission.service');
        try {
            await driverCommissionService.addDriverEarning(
                driver._id.toString(),
                populatedRide.fare,
                rideId
            );
            console.log(`[PAYMENT] Driver earnings generated for ride ${rideId}`);
        } catch (earnErr: any) {
            console.error(`[PAYMENT] Error generating driver earnings: ${earnErr.message}`);
        }

        // Prepare updated ride object for socket emission
        const updatedRide = populatedRide.toObject ? populatedRide.toObject() : populatedRide;
        console.log(`[SOCKET_SYNC] Emitting payment-confirmed payload:`, JSON.stringify({
            rideId: updatedRide._id || updatedRide.id,
            status: updatedRide.status,
            paymentStatus: updatedRide.paymentStatus,
            paymentMethod: updatedRide.paymentMethod,
            pickup: updatedRide.pickup,
            fare: updatedRide.fare
        }));

        // Notify room that payment is confirmed
        sendMessageToRoom(`ride_${rideId}`, {
            event: 'payment-confirmed',
            data: updatedRide
        });

        // Notify driver that payment is confirmed
        const driverUser = driver.userId;
        if (driverUser && driverUser.socketId) {
            console.log(`[SOCKET_SYNC] Sending payment-confirmed to driver ${driver._id} at socket ${driverUser.socketId}`);
            sendMessageToSocketId(driverUser.socketId, {
                event: 'payment-confirmed',
                data: updatedRide
            });
        } else {
            console.warn(`[SOCKET_SYNC] Driver user socket ID not found for driver ${driver._id}`);
        }

        // Notify user with same event for consistency
        const touristUser = populatedRide.user as any;
        if (touristUser && touristUser.socketId) {
            console.log(`[SOCKET_SYNC] Sending payment-confirmed to tourist ${touristUser._id} at socket ${touristUser.socketId}`);
            sendMessageToSocketId(touristUser.socketId, {
                event: 'payment-confirmed',
                data: updatedRide
            });
        } else {
            console.warn(`[SOCKET_SYNC] Tourist socket ID not found for user ${populatedRide.user}`);
        }

        return res.status(200).json({
            success: true,
            message: 'Payment confirmed and ride completed',
            data: updatedRide
        });
    } catch (err: any) {
        console.error('[PAYMENT] Error confirming payment:', err);
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
                const pickupCoords = JSON.parse(ride.pickup);
                const distance = calculateDistance(
                    driverLocation.lat,
                    driverLocation.lng,
                    pickupCoords.lat,
                    pickupCoords.lng
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

export const getActiveRide = async (req: AuthRequest, res: Response) => {
    try {
        console.log(`[ACTIVE_RIDE_RESTORE] Fetching active ride for user ${req.userId}`);
        
        // Check if user is a driver or tourist
        const driver = await Driver.findOne({ userId: req.userId });
        const isDriver = !!driver;

        let activeRide = null;

        if (isDriver) {
            // Driver: look for rides where driver is assigned and status is not completed/cancelled
            console.log(`[ACTIVE_RIDE_RESTORE] Checking for active driver rides`);
            activeRide = await Ride.findOne({
                driver: driver._id,
                status: { $in: ['accepted', 'ongoing', 'payment_pending'] }
            })
                .populate('user')
                .populate({
                    path: 'driver',
                    populate: {
                        path: 'userId',
                        model: 'User',
                    }
                })
                .select('+otp')
                .sort({ createdAt: -1 });

            if (activeRide) {
                console.log(`[ACTIVE_RIDE_RESTORE] Found active driver ride: ${activeRide._id}, status: ${activeRide.status}`);
            }
        } else {
            // Tourist: restore only actionable statuses — never reviewed or cancelled
            // completed is also excluded since payment already done; review flow handles it
            console.log(`[RESTORE_FLOW] Checking for active tourist rides`);
            activeRide = await Ride.findOne({
                user: req.userId,
                status: { $in: ['pending', 'accepted', 'ongoing', 'payment_pending'] }
            })
                .populate('user')
                .populate({
                    path: 'driver',
                    populate: {
                        path: 'userId',
                        model: 'User',
                    }
                })
                .select('+otp')
                .sort({ createdAt: -1 });

            if (activeRide) {
                console.log(`[RESTORE_FLOW] Found active tourist ride: ${activeRide._id}, status: ${activeRide.status}`);
            }
        }

        if (!activeRide) {
            console.log(`[ACTIVE_RIDE_RESTORE] No active ride found for ${isDriver ? 'driver' : 'tourist'} ${req.userId}`);
            return res.status(200).json(null);
        }

        // Convert status to frontend-friendly format
        const rideStatus = activeRide.status;
        console.log(`[ACTIVE_RIDE_RESTORE] Returning active ride with status: ${rideStatus}`);

        return res.status(200).json({
            ...activeRide.toObject(),
            status: rideStatus,
            userType: isDriver ? 'driver' : 'tourist'
        });
    } catch (err: any) {
        console.error('[ACTIVE_RIDE_RESTORE] Error fetching active ride:', err);
        return res.status(500).json({ message: err.message });
    }
};
export const submitReview = async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, rating, text, skip } = req.body;

    try {
        console.log(`[REVIEW_FLOW] Tourist ${req.userId} submitting review for ride ${rideId}`, {
            rating,
            textLength: text?.length || 0,
            skip
        });

        const ride = await Ride.findById(rideId)
            .populate('user')
            .populate({
                path: 'driver',
                populate: {
                    path: 'userId',
                    model: 'User',
                }
            });

        if (!ride) {
            console.error(`[REVIEW_FLOW] Ride not found: ${rideId}`);
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Verify the user is the ride requester
        const rideUser = ride.user as any;
        if (rideUser._id.toString() !== req.userId) {
            console.error(`[REVIEW_FLOW] Unauthorized review submission. Ride user: ${rideUser._id}, Requesting user: ${req.userId}`);
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Verify ride is in completed status (ready for review)
        if (ride.status !== 'completed') {
            console.error(`[REVIEW_FLOW] Cannot submit review. Ride status is ${ride.status}, expected 'completed'`);
            return res.status(400).json({ message: `Ride is not ready for review (current status: ${ride.status})` });
        }

        // Update ride with review or skip
        if (skip) {
            console.log(`[REVIEW_FLOW] Ride ${rideId}: Tourist skipped review`);
            ride.review = {
                rating: 0,
                text: 'Review skipped',
                submittedAt: new Date(),
                skipped: true
            } as any;
        } else {
            console.log(`[REVIEW_FLOW] Ride ${rideId}: Review submitted - Rating: ${rating}/5`);
            ride.review = {
                rating,
                text: text || '',
                submittedAt: new Date(),
                skipped: false
            } as any;
        }

        // Mark ride as reviewed
        ride.status = 'reviewed';
        await ride.save();

        console.log(`[REVIEW_FLOW] Ride ${rideId} status updated to 'reviewed'`);
        // Notify room about the review/skip
        sendMessageToRoom(`ride_${rideId}`, {
            event: 'ride-reviewed',
            data: ride.toObject()
        });

        // Notify driver about the review/skip
        const driver = ride.driver as any;
        if (driver && driver.userId) {
            const driverSocketId = (driver.userId as any).socketId;
            if (driverSocketId) {
                console.log(`[REVIEW_FLOW] Emitting ride-reviewed event to driver ${driver._id}`);
                sendMessageToSocketId(driverSocketId, {
                    event: 'ride-reviewed',
                    data: ride.toObject()
                });
            }
        }

        // Emit to tourist as well for multi-tab sync
        const userSocketId = (rideUser as any).socketId;
        if (userSocketId) {
            console.log(`[REVIEW_FLOW] Emitting ride-reviewed event to tourist ${req.userId}`);
            sendMessageToSocketId(userSocketId, {
                event: 'ride-reviewed',
                data: ride.toObject()
            });
        }

        return res.status(200).json({
            success: true,
            message: skip ? 'Review skipped' : 'Review submitted successfully',
            data: ride.toObject()
        });
    } catch (err: any) {
        console.error('[REVIEW_FLOW] Error submitting review:', err);
        return res.status(500).json({ message: err.message });
    }
};

// ============================================================
// CANCEL RIDE CONTROLLER
// [RIDE_STATE_MACHINE] Tourist cancels ride
// Only allowed from: pending (searching) | accepted
// Notifies driver via socket if driver was already assigned
// ============================================================
export const cancelRide = async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        console.log(`[CANCEL_FLOW] User ${req.userId} requesting cancel for ride ${rideId}`);

        // Delegate to service (includes status guard + ownership check)
        const ride = await rideService.cancelRide({ rideId, userId: req.userId! });

        // Trigger push notification asynchronously
        NotificationService.sendRideCancelledNotification(rideId, 'TOURIST').catch(err => {
            console.error('Failed to send ride cancelled push notification:', err);
        });

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found after cancellation' });
        }

        // Determine who cancelled — driver or tourist
        const requesterDriver = await Driver.findOne({ userId: req.userId });
        const cancelledByDriver = !!requesterDriver;
        const cancelMessage = cancelledByDriver
            ? 'Ride has been cancelled by the driver'
            : 'Ride has been cancelled by the tourist';

        const cancelPayload = {
            rideId: ride._id,
            status: 'cancelled',
            cancelledBy: cancelledByDriver ? 'driver' : 'tourist',
            message: cancelMessage,
        };

        // Notify room that ride is cancelled
        sendMessageToRoom(`ride_${rideId}`, {
            event: 'ride-cancelled',
            data: cancelPayload,
        });

        // Notify tourist (for multi-tab/refresh safety)
        const tourist = ride.user as any;
        if (tourist?.socketId) {
            sendMessageToSocketId(tourist.socketId, {
                event: 'ride-cancelled',
                data: cancelPayload,
            });
            console.log(`[CANCEL_FLOW] Notified tourist ${tourist._id}`);
        }

        // Notify driver if one was assigned
        const driver = ride.driver as any;
        if (driver?.userId?.socketId) {
            sendMessageToSocketId(driver.userId.socketId, {
                event: 'ride-cancelled',
                data: cancelPayload,
            });
            console.log(`[CANCEL_FLOW] Notified driver ${driver._id}`);
        }

        console.log(`[CANCEL_FLOW] Ride ${rideId} cancelled successfully`);
        return res.status(200).json({
            success: true,
            message: 'Ride cancelled successfully',
            data: ride,
        });
    } catch (err: any) {
        console.error('[CANCEL_FLOW] Error cancelling ride:', err.message);
        // If it's a state machine violation, return 400
        if (err.message.includes('Cannot cancel')) {
            return res.status(400).json({ message: err.message });
        }
        if (err.message.includes('Unauthorized')) {
            return res.status(403).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }
};