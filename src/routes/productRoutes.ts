import { Router } from "express";
import { create, getAll, getById, update, remove } from "../controllers/productController";
import { authGuard, roleGuard } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", authGuard, roleGuard("admin"), create);
router.put("/:id", authGuard, roleGuard("admin"), update);
router.delete("/:id", authGuard, roleGuard("admin"), remove);

export default router;
