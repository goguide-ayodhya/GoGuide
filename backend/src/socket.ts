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
      logger.info(`[SOCKET] Received location update from driver ${userId}:`, location);
      
      if (!userId || !location || !location.ltd || !location.lng) {
          logger.error(`[SOCKET] Invalid location data:`, data);
          return;
      }
      
      // Update driver location in database
      const { Driver } = require('./models/Driver');
      await Driver.findOneAndUpdate({ userId }, {
          currentLocation: {
              lat: location.ltd,
              lng: location.lng
          }
      });

      // Find active rides for this driver and emit to tourists
      const { Ride } = require('./models/Ride');
      const { User } = require('./models/User');
      
      try {
        logger.info(`[SOCKET] Finding active rides for driver ${userId}...`);
        
        // Try multiple ride status values
        const activeRides = await Ride.find({ 
            driver: userId, 
            status: { $in: ['accepted', 'ongoing', 'started', 'confirmed'] } 
        }).populate('user');

        logger.info(`[SOCKET] Found ${activeRides.length} active rides for driver ${userId}`);
        
        // Log details of each ride
        activeRides.forEach((ride: { _id: any; status: any; driver: any; user: { _id: any; socketId: any; }; }, index: number) => {
          logger.info(`[SOCKET] Ride ${index + 1}:`, {
            rideId: ride._id,
            status: ride.status,
            driver: ride.driver,
            user: ride.user?._id,
            userSocketId: ride.user?.socketId
          });
        });

        // Emit location update to all tourists with active rides
        let forwardedCount = 0;
        activeRides.forEach((ride: { user: { socketId: string | string[]; _id: any; }; _id: any; }) => {
            if (ride.user && ride.user.socketId) {
                const locationData = {
                    rideId: ride._id,
                    lat: location.ltd,
                    lng: location.lng,
                    eta: '5 min', // You can calculate actual ETA based on distance
                    timestamp: new Date().toISOString()
                };
                
                io!.to(ride.user.socketId).emit('driver-location-update', locationData);
                logger.info(`[SOCKET] Sent location update to tourist ${ride.user._id} for ride ${ride._id}`);
                logger.info(`[SOCKET] Location data:`, locationData);
                forwardedCount++;
            } else {
                logger.warn(`[SOCKET] No socket ID for user in ride ${ride._id}`);
            }
        });
        
        logger.info(`[SOCKET] Forwarded location to ${forwardedCount} tourists`);
        
      } catch (error) {
        logger.error(`[SOCKET] Error forwarding location update: ${error}`);
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
