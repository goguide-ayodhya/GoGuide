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

  io.on("connection", (socket: any) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('join', async (data: { userId: string, userType: string }) => {
      const { userId, userType } = data;
      if (userId) {
          const { User } = require('./models/User');
          await User.findByIdAndUpdate(userId, { socketId: socket.id });
      }
    });

    socket.on('join-ride', (data: { rideId: string }) => {
      const { rideId } = data;
      if (rideId) {
        socket.join(`ride_${rideId}`);
        logger.info(`Socket ${socket.id} joined room ride_${rideId}`);
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
          const locationData = {
            rideId: ride._id,
            lat: location.ltd,
            lng: location.lng,
            eta: '5 min',
            timestamp: new Date().toISOString(),
          };

          // Emit to ride room first (most reliable)
          socket.to(`ride_${ride._id}`).emit('driver-location-update', locationData);
          logger.info(`[SOCKET] driver-location-update emitted to room ride_${ride._id}`);

          if (ride.user && touristSocketId) {
            logger.info(`[SOCKET] Ride ${index + 1}: rideId=${ride._id}, status=${ride.status}, touristId=${ride.user._id}, touristSocketId=${touristSocketId}`);
            io!.to(touristSocketId).emit('driver-location-update', locationData);
            logger.info(`[SOCKET] driver-location-update emitted to tourist fallback socket ${touristSocketId}`);
            forwardedCount++;
          } else {
            logger.warn(`[SOCKET] No tourist socket ID for ride ${ride._id}`);
          }
        });

        logger.info(`[SOCKET] Forwarded driver-location-update to ${forwardedCount} tourists via socketId`);
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
        const { Driver } = require('./models/Driver');

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

        // Update Driver currentLocation in the database
        if (ride.driver) {
          await Driver.findByIdAndUpdate(ride.driver, {
            currentLocation: {
              lat: Number(lat),
              lng: Number(lng),
            }
          });
          logger.info(`[DRIVER TRACKING] Updated Driver ${ride.driver} currentLocation in DB to lat=${lat}, lng=${lng}`);
        }

        const locationPayload = {
          rideId: String(rideId),
          lat: Number(lat),
          lng: Number(lng),
          eta: eta || '5 min',
          timestamp: new Date().toISOString(),
        };

        // Emit to the ride room (excluding the driver who emitted it)
        socket.to(`ride_${rideId}`).emit('driver-location-update', locationPayload);
        logger.info(`[DRIVER TRACKING] Location update sent to room ride_${rideId}`);

        // Fallback to direct tourist socketId if available
        const tourist = ride.user as any;
        if (tourist && tourist.socketId) {
          io!.to(tourist.socketId).emit('driver-location-update', locationPayload);
          logger.info(`[DRIVER TRACKING] Location update sent to tourist fallback socket ${tourist.socketId}`);
        }

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

export const sendMessageToRoom = (
  roomName: string,
  messageObject: { event: string; data: any },
) => {
  if (!io) {
    logger.warn("Socket.io not initialized.");
    return;
  }

  io.to(roomName).emit(messageObject.event, messageObject.data);
};
