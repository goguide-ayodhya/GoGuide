import React, { createContext, useEffect } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

const getSocketUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
  return baseUrl.replace(/\/api\/?$/, "");
};

const socket =
  typeof window !== "undefined"
    ? io(getSocketUrl() || undefined, {
        path: "/socket.io",
        transports: ["websocket", "polling"],
      })
    : null;

const SocketProvider = ({ children }) => {
  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
