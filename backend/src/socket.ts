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

  io.on("connection", (socket: { id: any; on: (arg0: string, arg1: () => void) => void; }) => {
    logger.info(`Socket connected: ${socket.id}`);

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
