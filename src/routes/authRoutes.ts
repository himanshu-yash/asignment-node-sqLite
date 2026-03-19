import { Router } from "express";
import { register, login, logout, getProfile, updateProfile, changePassword } from "../controllers/authController";
import { authGuard } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authGuard, logout);
router.get("/profile", authGuard, getProfile);
router.put("/profile", authGuard, updateProfile);
router.put("/change-password", authGuard, changePassword);

export default router;
