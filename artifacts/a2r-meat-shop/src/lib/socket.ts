import { io } from "socket.io-client";

// Connect to the same origin where the app is hosted
export const socket = io(window.location.origin, {
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
