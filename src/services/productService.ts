import { ILike, Between, FindManyOptions } from "typeorm";
import { AppDataSource } from "../config/database";
import { Product } from "../models/Product";
import { CreateProductInput, UpdateProductInput, ProductQueryInput } from "../schemas/productSchema";
import logger from "../config/logger";
import { NotFoundError } from "../errors/AppError";

const productRepo = () => AppDataSource.getRepository(Product);

export const createProduct = async (data: CreateProductInput) => {
  const product = productRepo().create(data);
  await productRepo().save(product);
  logger.info(`Product created: ${product.name}`);
  return product;
};

export const getAllProducts = async (query: ProductQueryInput) => {
  const { search, category, minPrice, maxPrice, page, limit } = query;

  const where: FindManyOptions<Product>["where"] = {};

  if (search) where.name = ILike(`%${search}%`);
  if (category) where.category = ILike(`%${category}%`);
  if (minPrice !== undefined && maxPrice !== undefined) {
    where.price = Between(minPrice, maxPrice);
  }

  const [products, total] = await productRepo().findAndCount({
    where,
    skip: (page - 1) * limit,
    take: limit,
    order: { createdAt: "DESC" },
  });

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getProductById = async (id: number) => {
  const product = await productRepo().findOneBy({ id });
  if (!product) throw new NotFoundError("Product not found");
  return product;
};

export const updateProduct = async (id: number, data: UpdateProductInput) => {
  const product = await getProductById(id);
  Object.assign(product, data);
  await productRepo().save(product);
  logger.info(`Product updated: ${product.name}`);
  return product;
};

export const deleteProduct = async (id: number) => {
  const product = await getProductById(id);
  await productRepo().remove(product);
  logger.info(`Product deleted: id=${id}`);
};
