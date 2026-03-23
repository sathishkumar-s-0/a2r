import { Router } from "express";
import { db, ordersTable, orderItemsTable, productsTable } from "@workspace/db";
import { eq, sql, gte } from "drizzle-orm";
import { requireAdmin } from "../lib/auth.js";
import { emitNewOrder, emitOrderStatusChanged } from "../lib/socket.js";

const router = Router();

router.post("/orders", async (req, res) => {
  const { customerName, customerPhone, customerAddress, items } = req.body;
  if (!customerName || !customerPhone || !customerAddress || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  let totalPrice = 0;
  const enrichedItems: Array<{ productId: number; productName: string; quantity: number; price: number }> = [];

  for (const item of items) {
    if (!item.productId || !item.quantity) {
      res.status(400).json({ message: "Invalid order item" });
      return;
    }
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    if (!product || !product.isActive) {
      res.status(400).json({ message: `Product ${item.productId} not found or inactive` });
      return;
    }
    const pricePerKg = Number(product.price);
    const qty = Number(item.quantity);
    const lineTotal = pricePerKg * qty;
    totalPrice += lineTotal;
    enrichedItems.push({ productId: product.id, productName: product.name, quantity: qty, price: lineTotal });
  }

  const [order] = await db.insert(ordersTable).values({
    customerName,
    customerPhone,
    customerAddress,
    totalPrice: String(totalPrice.toFixed(2)),
    status: "Placed",
  }).returning();

  const insertedItems = await db.insert(orderItemsTable).values(
    enrichedItems.map((i) => ({
      orderId: order.id,
      productId: i.productId,
      productName: i.productName,
      quantity: String(i.quantity),
      price: String(i.price.toFixed(2)),
    }))
  ).returning();

  for (const item of enrichedItems) {
    await db.execute(
      sql`UPDATE products SET stock = GREATEST(0, stock - ${item.quantity}) WHERE id = ${item.productId}`
    );
  }

  const orderWithItems = {
    ...serializeOrder(order),
    items: insertedItems.map(serializeItem),
  };

  emitNewOrder(orderWithItems);
  res.status(201).json(serializeOrder(order));
});

router.get("/orders/:id/status", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ message: "Invalid id" }); return; }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) { res.status(404).json({ message: "Not found" }); return; }
  res.json(serializeOrder(order));
});

router.get("/admin/orders", requireAdmin, async (_req, res) => {
  const orders = await db.select().from(ordersTable).orderBy(sql`${ordersTable.createdAt} DESC`);
  const items = await db.select().from(orderItemsTable);

  const result = orders.map((order) => ({
    ...serializeOrder(order),
    items: items.filter((i) => i.orderId === order.id).map(serializeItem),
  }));

  res.json(result);
});

router.put("/admin/orders/:id/status", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ message: "Invalid id" }); return; }
  const { status } = req.body;
  const validStatuses = ["Placed", "Accepted", "Preparing", "Delivered"];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ message: "Invalid status" });
    return;
  }
  const [order] = await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
  if (!order) { res.status(404).json({ message: "Not found" }); return; }
  emitOrderStatusChanged(id, status);
  res.json(serializeOrder(order));
});

router.get("/admin/dashboard", requireAdmin, async (_req, res) => {
  const allOrders = await db.select().from(ordersTable);
  const totalOrders = allOrders.length;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayOrders = allOrders.filter((o) => o.createdAt >= todayStart);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0);

  const allProducts = await db.select().from(productsTable);
  const lowStockProducts = allProducts
    .filter((p) => Number(p.stock) < 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: Number(p.price),
      stock: Number(p.stock),
      imageUrl: p.imageUrl ?? null,
      isActive: p.isActive,
      createdAt: p.createdAt.toISOString(),
    }));

  const recentOrderRows = allOrders
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  const allItems = await db.select().from(orderItemsTable);
  const recentOrders = recentOrderRows.map((order) => ({
    ...serializeOrder(order),
    items: allItems.filter((i) => i.orderId === order.id).map(serializeItem),
  }));

  res.json({ totalOrders, todayRevenue, lowStockProducts, recentOrders });
});

function serializeOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerAddress: o.customerAddress,
    totalPrice: Number(o.totalPrice),
    status: o.status,
    createdAt: o.createdAt.toISOString(),
  };
}

function serializeItem(i: typeof orderItemsTable.$inferSelect) {
  return {
    id: i.id,
    orderId: i.orderId,
    productId: i.productId,
    productName: i.productName,
    quantity: Number(i.quantity),
    price: Number(i.price),
  };
}

export default router;
