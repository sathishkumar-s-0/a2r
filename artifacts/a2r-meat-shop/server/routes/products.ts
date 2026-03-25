import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, gt, and } from "drizzle-orm";
import { requireAdmin } from "../lib/auth.js";
import { emitProductUpdated, emitStockUpdated } from "../lib/socket.js";

const router = Router();

router.get("/products", async (req, res) => {
  const { category } = req.query;
  const conditions = [eq(productsTable.isActive, true), gt(productsTable.stock, "0")];
  if (category && typeof category === "string") {
    conditions.push(eq(productsTable.category, category));
  }
  const products = await db.select().from(productsTable).where(and(...conditions));
  res.json(products.map(serializeProduct));
});

router.get("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ message: "Invalid id" }); return; }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) { res.status(404).json({ message: "Not found" }); return; }
  res.json(serializeProduct(product));
});

router.get("/admin/products", requireAdmin, async (_req, res) => {
  const products = await db.select().from(productsTable);
  res.json(products.map(serializeProduct));
});

router.post("/admin/products", requireAdmin, async (req, res) => {
  const { name, category, price, stock, imageUrl, isActive } = req.body;
  if (!name || !category || price === undefined || stock === undefined) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }
  const [product] = await db.insert(productsTable).values({
    name,
    category,
    price: String(price),
    stock: String(stock),
    imageUrl: imageUrl || null,
    isActive: isActive !== undefined ? isActive : true,
  }).returning();
  emitProductUpdated(serializeProduct(product));
  res.status(201).json(serializeProduct(product));
});

router.put("/admin/products/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ message: "Invalid id" }); return; }
  const { name, category, price, stock, imageUrl, isActive } = req.body;
  const updates: Partial<typeof productsTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (category !== undefined) updates.category = category;
  if (price !== undefined) updates.price = String(price);
  if (stock !== undefined) updates.stock = String(stock);
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (isActive !== undefined) updates.isActive = isActive;

  const [product] = await db.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning();
  if (!product) { res.status(404).json({ message: "Not found" }); return; }
  emitProductUpdated(serializeProduct(product));
  if (stock !== undefined) emitStockUpdated(id, Number(stock));
  res.json(serializeProduct(product));
});

router.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ message: "Invalid id" }); return; }
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ message: "Deleted" });
});

function serializeProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    stock: Number(p.stock),
    imageUrl: p.imageUrl ?? null,
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
  };
}

export default router;
