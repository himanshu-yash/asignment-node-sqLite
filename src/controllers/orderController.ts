import { Request, Response, NextFunction } from "express";
import { createOrderSchema, updateOrderStatusSchema } from "../schemas/orderSchema";
import { createOrder, getUserOrders, getAllOrders, getOrderById, updateOrderStatus, cancelOrder } from "../services/orderService";
import { ValidationError } from "../errors/AppError";

export const placeOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) return next(new ValidationError(JSON.stringify(parsed.error.flatten().fieldErrors)));

  try {
    const order = await createOrder(req.user!.id, parsed.data);
    res.status(201).json({ success: true, message: "Order placed successfully", order });
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders = req.user!.role === "admin" ? await getAllOrders() : await getUserOrders(req.user!.id);
    res.status(200).json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await getOrderById(Number(req.params.id), req.user!.id, req.user!.role);
    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parsed = updateOrderStatusSchema.safeParse(req.body);
  if (!parsed.success) return next(new ValidationError(JSON.stringify(parsed.error.flatten().fieldErrors)));

  try {
    const order = await updateOrderStatus(Number(req.params.id), parsed.data);
    res.status(200).json({ success: true, message: "Order status updated", order });
  } catch (err) {
    next(err);
  }
};

export const cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await cancelOrder(Number(req.params.id), req.user!.id, req.user!.role);
    res.status(200).json({ success: true, message: "Order cancelled successfully", order });
  } catch (err) {
    next(err);
  }
};
