import { Router } from "express";
import { placeOrder, getOrders, getOrder, updateStatus, cancel } from "../controllers/orderController";
import { authGuard, roleGuard } from "../middleware/authMiddleware";

const router = Router();

router.use(authGuard);

router.post("/", placeOrder);
router.get("/", getOrders);
router.get("/:id", getOrder);
router.put("/:id/status", roleGuard("admin"), updateStatus);
router.put("/:id/cancel", cancel);

export default router;
