import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { logger } from "./utils/logger";

let io: Server | null = null;

export const initializeSocket = (server: HttpServer) => {
  if (io) {
    logger.warn("Socket.io already initialized");
    return;
  }

  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  io.on("connection", (socket: { id: any; on: (arg0: string, arg1: (...args: any[]) => void) => void; }) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('join', async (data: { userId: string, userType: string }) => {
      const { userId, userType } = data;
      if (userId) {
          // Assuming we use User model for both TOURIST and DRIVER sockets
          // Wait, we need to import User and Driver. We can do that lazily or at the top.
          const { User } = require('./models/User');
          await User.findByIdAndUpdate(userId, { socketId: socket.id });
      }
    });

    socket.on('update-location-captain', async (data: { userId: string, location: { ltd: number, lng: number } }) => {
      const { userId, location } = data;
      logger.info(`[SOCKET] Received location update from driver userId=${userId}:`, location);
      
      if (!userId || !location || location.ltd == null || location.lng == null) {
          logger.error(`[SOCKET] Invalid location data:`, data);
          return;
      }
      
      const { Driver } = require('./models/Driver');
      const { Ride } = require('./models/Ride');

      const driver = await Driver.findOne({ userId });
      if (!driver) {
        logger.warn(`[SOCKET] No Driver document found for userId=${userId}`);
        return;
      }

      await Driver.findByIdAndUpdate(driver._id, {
          currentLocation: {
              lat: location.ltd,
              lng: location.lng
          }
      });

      try {
        logger.info(`[SOCKET] Finding active rides for driverId=${driver._id} (userId=${userId})...`);
        
        const activeRides = await Ride.find({ 
            driver: driver._id, 
            status: { $in: ['accepted', 'ongoing'] } 
        }).populate('user');

        logger.info(`[SOCKET] Found ${activeRides.length} active rides for driverId=${driver._id}`);

        let forwardedCount = 0;
        activeRides.forEach((ride: any, index: number) => {
          const touristSocketId = ride.user?.socketId;
          if (ride.user && touristSocketId) {
            logger.info(`[SOCKET] Ride ${index + 1}: rideId=${ride._id}, status=${ride.status}, touristId=${ride.user._id}, touristSocketId=${touristSocketId}`);

            const locationData = {
              rideId: ride._id,
              lat: location.ltd,
              lng: location.lng,
              eta: '5 min',
              timestamp: new Date().toISOString(),
            };

            io!.to(touristSocketId).emit('driver-location-update', locationData);
            logger.info(`[SOCKET] driver-location-update emitted to tourist ${ride.user._id} for ride ${ride._id}`, locationData);
            forwardedCount++;
          } else {
            logger.warn(`[SOCKET] No tourist socket ID for ride ${ride._id}`);
          }
        });

        logger.info(`[SOCKET] Forwarded driver-location-update to ${forwardedCount} tourists`);
      } catch (error) {
        logger.error(`[SOCKET] Error forwarding location update: ${error}`);
      }
    });

    // ====================================================
    // REAL-TIME DRIVER GPS TRACKING
    // Receives: { rideId, lat, lng, eta }
    // Emits location ONLY to the tourist of that specific ride
    // Supports: accepted, arriving, ongoing statuses
    // ====================================================
    socket.on('driver-location-update', async (data: { rideId: string; lat: number; lng: number; eta?: string }) => {
      const { rideId, lat, lng, eta } = data;

      if (!rideId || lat == null || lng == null) {
        logger.warn(`[DRIVER TRACKING] Invalid data received:`, data);
        return;
      }

      try {
        const { Ride } = require('./models/Ride');
        const { User } = require('./models/User');

        // Find the ride and populate the user (tourist)
        const ride = await Ride.findById(rideId).populate('user');

        if (!ride) {
          logger.warn(`[DRIVER TRACKING] Ride ${rideId} not found`);
          return;
        }

        // [LIVE_TRACKING] Allow tracking during: accepted, arriving, ongoing
        const trackableStatuses = ['accepted', 'arriving', 'ongoing'];
        if (!trackableStatuses.includes(ride.status)) {
          logger.warn(`[DRIVER TRACKING] Ride ${rideId} status not trackable (status: ${ride.status})`);
          return;
        }

        const tourist = ride.user as any;

        if (!tourist || !tourist.socketId) {
          logger.warn(`[DRIVER TRACKING] Tourist has no socketId for ride ${rideId}`);
          return;
        }

        const locationPayload = {
          rideId: String(rideId),
          lat: Number(lat),
          lng: Number(lng),
          eta: eta || '5 min',
          timestamp: new Date().toISOString(),
        };

        // Emit ONLY to the specific tourist — not broadcast
        io!.to(tourist.socketId).emit('driver-location-update', locationPayload);

        logger.info(`[DRIVER TRACKING] Location update sent for ride ${rideId}: status=${ride.status}, lat=${lat}, lng=${lng}`);

      } catch (error) {
        logger.error(`[DRIVER TRACKING] Error processing GPS update: ${error}`);
      }
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};

export const sendMessageToSocketId = (
  socketId: string,
  messageObject: { event: string; data: any },
) => {
  if (!io) {
    logger.warn("Socket.io not initialized.");
    return;
  }

  io.to(socketId).emit(messageObject.event, messageObject.data);
};
