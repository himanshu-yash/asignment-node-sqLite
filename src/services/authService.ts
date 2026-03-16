import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User } from "../models/User";
import { RegisterInput, LoginInput } from "../schemas/authSchema";

const userRepo = () => AppDataSource.getRepository(User);

const SALT_ROUNDS = 12;

export const registerUser = async (data: RegisterInput) => {
  const existing = await userRepo().findOneBy({ email: data.email });
  if (existing) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = userRepo().create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });

  await userRepo().save(user);

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const loginUser = async (data: LoginInput) => {
  const user = await userRepo().findOneBy({ email: data.email });
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  const { password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};
