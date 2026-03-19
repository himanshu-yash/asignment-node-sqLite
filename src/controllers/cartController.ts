import { Request, Response, NextFunction } from "express";
import { addItemSchema, updateQuantitySchema } from "../schemas/cartSchema";
import { getCart, addItem, updateItemQuantity, removeItem, clearCart } from "../services/cartService";
import { ValidationError } from "../errors/AppError";

export const getCartHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await getCart(req.user!.id);
    res.status(200).json({ success: true, cart });
  } catch (err) {
    next(err);
  }
};

export const addItemHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parsed = addItemSchema.safeParse(req.body);
  if (!parsed.success) return next(new ValidationError(JSON.stringify(parsed.error.flatten().fieldErrors)));

  try {
    const cart = await addItem(req.user!.id, parsed.data);
    res.status(200).json({ success: true, message: "Item added to cart", cart });
  } catch (err) {
    next(err);
  }
};

export const updateItemHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parsed = updateQuantitySchema.safeParse(req.body);
  if (!parsed.success) return next(new ValidationError(JSON.stringify(parsed.error.flatten().fieldErrors)));

  try {
    const cart = await updateItemQuantity(req.user!.id, Number(req.params.itemId), parsed.data);
    res.status(200).json({ success: true, message: "Cart item updated", cart });
  } catch (err) {
    next(err);
  }
};

export const removeItemHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await removeItem(req.user!.id, Number(req.params.itemId));
    res.status(200).json({ success: true, message: "Item removed from cart", cart });
  } catch (err) {
    next(err);
  }
};

export const clearCartHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await clearCart(req.user!.id);
    res.status(200).json({ success: true, message: "Cart cleared successfully" });
  } catch (err) {
    next(err);
  }
};
