import { z } from "zod";
import { OrderStatus } from "../models/Order";

export const createOrderSchema = z.object({
  shippingAddress: z.string().min(10, "Shipping address must be at least 10 characters"),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, { errorMap: () => ({ message: "Invalid order status" }) }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
