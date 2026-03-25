import { io } from "socket.io-client";

// Connect to the backend API origin
const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

export const socket = io(API_URL, {
  path: "/socket.io",
  autoConnect: true,
  reconnection: true,
});

socket.on("connect", () => {
  console.log("[Socket] Connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("[Socket] Disconnected");
});
