import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User } from "../models/User";
import { RegisterInput, LoginInput, UpdateProfileInput, ChangePasswordInput } from "../schemas/authSchema";
import logger from "../config/logger";
import { ConflictError, NotFoundError, UnauthorizedError } from "../errors/AppError";

const userRepo = () => AppDataSource.getRepository(User);

const SALT_ROUNDS = 12;

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
  const user = await userRepo().findOneBy({ email: data.email });
  if (!user) throw new UnauthorizedError("Invalid email or password");

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) throw new UnauthorizedError("Invalid email or password");

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  const { password, ...userWithoutPassword } = user;
  logger.info(`User logged in: ${user.email}`);
  return { user: userWithoutPassword, token };
};
