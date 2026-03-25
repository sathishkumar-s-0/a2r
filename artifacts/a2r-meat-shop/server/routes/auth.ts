import { Router } from "express";
import { db, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signToken } from "../lib/auth.js";

const router = Router();

router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email and password required" });
    return;
  }
  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.email, email));
  if (!admin) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }
  const token = signToken({ id: admin.id, email: admin.email });
  res.json({ token, admin: { id: admin.id, email: admin.email } });
});

export default router;
