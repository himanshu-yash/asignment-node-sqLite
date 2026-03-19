import { Router } from "express";
import { getCartHandler, addItemHandler, updateItemHandler, removeItemHandler, clearCartHandler } from "../controllers/cartController";
import { authGuard } from "../middleware/authMiddleware";

const router = Router();

router.use(authGuard);

router.get("/", getCartHandler);
router.post("/items", addItemHandler);
router.put("/items/:itemId", updateItemHandler);
router.delete("/items/:itemId", removeItemHandler);
router.delete("/", clearCartHandler);

export default router;
