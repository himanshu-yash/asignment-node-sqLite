import { Request, Response, NextFunction } from "express";
import { createProductSchema, updateProductSchema, productQuerySchema } from "../schemas/productSchema";
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from "../services/productService";
import { ValidationError } from "../errors/AppError";

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) return next(new ValidationError(JSON.stringify(parsed.error.flatten().fieldErrors)));

  try {
    const product = await createProduct(parsed.data);
    res.status(201).json({ success: true, message: "Product created successfully", product });
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parsed = productQuerySchema.safeParse(req.query);
  if (!parsed.success) return next(new ValidationError(JSON.stringify(parsed.error.flatten().fieldErrors)));

  try {
    const result = await getAllProducts(parsed.data);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await getProductById(Number(req.params.id));
    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) return next(new ValidationError(JSON.stringify(parsed.error.flatten().fieldErrors)));

  try {
    const product = await updateProduct(Number(req.params.id), parsed.data);
    res.status(200).json({ success: true, message: "Product updated successfully", product });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await deleteProduct(Number(req.params.id));
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
};
