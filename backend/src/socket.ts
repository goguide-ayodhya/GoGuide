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
      if (!userId || !location || !location.ltd || !location.lng) {
          return;
      }
      const { Driver } = require('./models/Driver');
      await Driver.findOneAndUpdate({ userId }, {
          currentLocation: {
              lat: location.ltd,
              lng: location.lng
          }
      });
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
