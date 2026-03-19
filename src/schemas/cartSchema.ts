import { z } from "zod";

export const addItemSchema = z.object({
  productId: z.number().int().positive("Product ID must be a positive integer"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
});

export const updateQuantitySchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export type AddItemInput = z.infer<typeof addItemSchema>;
export type UpdateQuantityInput = z.infer<typeof updateQuantitySchema>;
