import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema, refreshTokenSchema } from "../schemas/authSchema";
import { registerUser, loginUser, updateUserProfile, changeUserPassword, refreshUserTokens, revokeRefreshToken } from "../services/authService";
import logger from "../config/logger";
import { ValidationError } from "../errors/AppError";

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return next(new ValidationError(JSON.stringify(parsed.error.flatten().fieldErrors)));

  try {
    const user = await registerUser(parsed.data);
    res.status(201).json({ success: true, message: "Registration successful", user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return next(new ValidationError(JSON.stringify(parsed.error.flatten().fieldErrors)));

  try {
    const { user, accessToken, refreshToken } = await loginUser(parsed.data);
    req.session.user = { id: user.id, email: user.email, role: user.role };
    res.status(200).json({ success: true, message: "Login successful", accessToken, refreshToken, user });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.id) await revokeRefreshToken(req.user.id);
    req.session.destroy((err) => {
      if (err) {
        logger.error(`Logout failed: ${err.message}`);
        return next(err);
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ success: true, message: "Logged out successfully" });
    });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parsed = refreshTokenSchema.safeParse(req.body);
  if (!parsed.success) return next(new ValidationError(JSON.stringify(parsed.error.flatten().fieldErrors)));

  try {
    const tokens = await refreshUserTokens(parsed.data.refreshToken);
    res.status(200).json({ success: true, ...tokens });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) return next(new ValidationError(JSON.stringify(parsed.error.flatten().fieldErrors)));

  try {
    const user = await updateUserProfile(req.user!.id, parsed.data);
    res.status(200).json({ success: true, message: "Profile updated successfully", user });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) return next(new ValidationError(JSON.stringify(parsed.error.flatten().fieldErrors)));

  try {
    await changeUserPassword(req.user!.id, parsed.data);
    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};

export const getProfile = (req: Request, res: Response): void => {
  res.status(200).json({ success: true, user: req.user });
};
