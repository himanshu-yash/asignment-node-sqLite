import { Request, Response } from "express";
import { registerSchema, loginSchema } from "../schemas/authSchema";
import { registerUser, loginUser } from "../services/authService";

export const register = async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const user = await registerUser(parsed.data);
    res.status(201).json({ success: true, message: "Registration successful", user });
  } catch (error: any) {
    res.status(409).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const { user, token } = await loginUser(parsed.data);

    // Store user in session
    req.session.user = { id: user.id, email: user.email, role: user.role };

    res.status(200).json({ success: true, message: "Login successful", token, user });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export const logout = (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ success: false, message: "Logout failed" });
      return;
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  });
};

export const getProfile = (req: Request, res: Response): void => {
  res.status(200).json({ success: true, user: req.user });
};
