import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "http";

let io: SocketIOServer | null = null;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    socket.on("disconnect", () => {});
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}

export function emitProductUpdated(product: unknown) {
  if (io) io.emit("product_updated", { product });
}

export function emitStockUpdated(productId: number, stock: number) {
  if (io) io.emit("stock_updated", { productId, stock });
}

export function emitNewOrder(order: unknown) {
  if (io) io.emit("new_order", { order });
}

export function emitOrderStatusChanged(orderId: number, status: string) {
  if (io) io.emit("order_status_changed", { orderId, status });
}
