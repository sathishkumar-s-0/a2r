import { Router } from "express";
import healthRouter from "./health.js";
import productsRouter from "./products.js";
import ordersRouter from "./orders.js";
import authRouter from "./auth.js";

const router = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(authRouter);

export default router;
