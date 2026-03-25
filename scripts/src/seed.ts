import { db, adminsTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const existingAdmin = await db.select().from(adminsTable).where(eq(adminsTable.email, "admin"));
  if (existingAdmin.length === 0) {
    const passwordHash = await bcrypt.hash("admin@123", 10);
    await db.insert(adminsTable).values({
      email: "admin",
      passwordHash,
    });
    console.log("Admin created: admin / admin@123");
  } else {
    console.log("Admin already exists");
  }

  const existingProducts = await db.select().from(productsTable);
  if (existingProducts.length === 0) {
    await db.insert(productsTable).values([
      { name: "Fresh Chicken (Full)", category: "Chicken", price: "220", stock: "50", imageUrl: "/images/cat-chicken.png", isActive: true },
      { name: "Chicken Breast", category: "Chicken", price: "280", stock: "30", imageUrl: "/images/cat-chicken.png", isActive: true },
      { name: "Chicken Wings", category: "Chicken", price: "180", stock: "40", imageUrl: "/images/cat-chicken.png", isActive: true },
      { name: "Goat Mutton", category: "Mutton", price: "750", stock: "20", imageUrl: "/images/cat-mutton.png", isActive: true },
      { name: "Lamb Chops", category: "Mutton", price: "900", stock: "15", imageUrl: "/images/cat-mutton.png", isActive: true },
      { name: "Mutton Keema", category: "Mutton", price: "680", stock: "25", imageUrl: "/images/cat-mutton.png", isActive: true },
      { name: "Rohu Fish", category: "Fish", price: "200", stock: "35", imageUrl: "/images/cat-fish.png", isActive: true },
      { name: "Hilsa Fish", category: "Fish", price: "800", stock: "10", imageUrl: "/images/cat-fish.png", isActive: true },
      { name: "Prawns (Medium)", category: "Fish", price: "600", stock: "20", imageUrl: "/images/cat-fish.png", isActive: true },
      { name: "Desi Eggs (12 pcs)", category: "Eggs", price: "120", stock: "100", imageUrl: "/images/cat-eggs.png", isActive: true },
      { name: "Farm Eggs (30 pcs)", category: "Eggs", price: "180", stock: "80", imageUrl: "/images/cat-eggs.png", isActive: true },
    ]);
    console.log("Sample products created");
  } else {
    console.log("Products already exist");
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
