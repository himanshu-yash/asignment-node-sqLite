import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AppDataSource } from "../config/database";
import { User } from "../models/User";
import { RegisterInput, LoginInput, UpdateProfileInput, ChangePasswordInput } from "../schemas/authSchema";
import logger from "../config/logger";
import { ConflictError, NotFoundError, UnauthorizedError } from "../errors/AppError";

const userRepo = () => AppDataSource.getRepository(User);

const SALT_ROUNDS = 12;

const generateTokens = (payload: { id: number; email: string; role: string }) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN as string) || "15m",
  });
  const refreshToken = crypto.randomBytes(64).toString("hex");
  return { accessToken, refreshToken };
};

export const registerUser = async (data: RegisterInput) => {
  const existing = await userRepo().findOneBy({ email: data.email });
  if (existing) throw new ConflictError("Email already registered");

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = userRepo().create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });

  await userRepo().save(user);
  logger.info(`User registered: ${user.email}`);

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateUserProfile = async (userId: number, data: UpdateProfileInput) => {
  const repo = userRepo();
  const user = await repo.findOneBy({ id: userId });
  if (!user) throw new NotFoundError("User not found");

  if (data.email && data.email !== user.email) {
    const existing = await repo.findOneBy({ email: data.email });
    if (existing) throw new ConflictError("Email already in use");
  }

  Object.assign(user, data);
  await repo.save(user);
  logger.info(`Profile updated: ${user.email}`);

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const changeUserPassword = async (userId: number, data: ChangePasswordInput) => {
  const repo = userRepo();
  const user = await repo.findOneBy({ id: userId });
  if (!user) throw new NotFoundError("User not found");

  const isMatch = await bcrypt.compare(data.currentPassword, user.password);
  if (!isMatch) throw new UnauthorizedError("Current password is incorrect");

  user.password = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
  await repo.save(user);
  logger.info(`Password changed: ${user.email}`);
};

export const loginUser = async (data: LoginInput) => {
  const repo = userRepo();
  const user = await repo.findOneBy({ email: data.email });
  if (!user) throw new UnauthorizedError("Invalid email or password");

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) throw new UnauthorizedError("Invalid email or password");

  const { accessToken, refreshToken } = generateTokens({ id: user.id, email: user.email, role: user.role });

  user.refreshToken = await bcrypt.hash(refreshToken, SALT_ROUNDS);
  await repo.save(user);

  const { password, refreshToken: _, ...userWithoutSensitive } = user;
  logger.info(`User logged in: ${user.email}`);
  return { user: userWithoutSensitive, accessToken, refreshToken };
};

export const refreshUserTokens = async (token: string) => {
  const repo = userRepo();
  // We need to find the user — we decode without verify since it's opaque token stored hashed
  // Instead, we search all users and compare (small dataset); for scale use a token→userId index
  const users = await repo.find({ select: ["id", "email", "role", "refreshToken"] });
  const user = await (async () => {
    for (const u of users) {
      if (u.refreshToken && (await bcrypt.compare(token, u.refreshToken))) return u;
    }
    return null;
  })();

  if (!user) throw new UnauthorizedError("Invalid or expired refresh token.");

  const fullUser = await repo.findOneBy({ id: user.id });
  if (!fullUser) throw new UnauthorizedError("User not found.");

  const { accessToken, refreshToken: newRefreshToken } = generateTokens({
    id: fullUser.id,
    email: fullUser.email,
    role: fullUser.role,
  });

  fullUser.refreshToken = await bcrypt.hash(newRefreshToken, SALT_ROUNDS);
  await repo.save(fullUser);

  logger.info(`Tokens refreshed: ${fullUser.email}`);
  return { accessToken, refreshToken: newRefreshToken };
};

export const revokeRefreshToken = async (userId: number) => {
  const repo = userRepo();
  await repo.update(userId, { refreshToken: null });
};
