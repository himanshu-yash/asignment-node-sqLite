import { AppDataSource } from "../config/database";
import { Cart } from "../models/Cart";
import { CartItem } from "../models/CartItem";
import { Product } from "../models/Product";
import { AddItemInput, UpdateQuantityInput } from "../schemas/cartSchema";
import { NotFoundError, ValidationError } from "../errors/AppError";
import logger from "../config/logger";

const cartRepo = () => AppDataSource.getRepository(Cart);
const cartItemRepo = () => AppDataSource.getRepository(CartItem);
const productRepo = () => AppDataSource.getRepository(Product);

const getOrCreateCart = async (userId: number): Promise<Cart> => {
  let cart = await cartRepo().findOne({ where: { userId } });
  if (!cart) {
    cart = cartRepo().create({ userId });
    await cartRepo().save(cart);
  }
  return cart;
};

const formatCart = (cart: Cart) => ({
  id: cart.id,
  userId: cart.userId,
  items: cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    product: item.product,
    quantity: item.quantity,
    subtotal: Number(item.product.price) * item.quantity,
  })),
  total: cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0),
  updatedAt: cart.updatedAt,
});

export const getCart = async (userId: number) => {
  const cart = await getOrCreateCart(userId);
  return formatCart(cart);
};

export const addItem = async (userId: number, data: AddItemInput) => {
  const product = await productRepo().findOneBy({ id: data.productId });
  if (!product) throw new NotFoundError("Product not found");
  if (product.stock < data.quantity) throw new ValidationError("Insufficient stock");

  const cart = await getOrCreateCart(userId);

  let item = cart.items?.find((i) => i.productId === data.productId);
  if (item) {
    if (product.stock < item.quantity + data.quantity) throw new ValidationError("Insufficient stock");
    item.quantity += data.quantity;
    await cartItemRepo().save(item);
  } else {
    item = cartItemRepo().create({ cart, productId: data.productId, quantity: data.quantity });
    await cartItemRepo().save(item);
  }

  logger.info(`Cart item added: userId=${userId}, productId=${data.productId}`);
  const updatedCart = await cartRepo().findOne({ where: { userId } });
  return formatCart(updatedCart!);
};

export const updateItemQuantity = async (userId: number, itemId: number, data: UpdateQuantityInput) => {
  const cart = await getOrCreateCart(userId);
  const item = cart.items?.find((i) => i.id === itemId);
  if (!item) throw new NotFoundError("Cart item not found");

  const product = await productRepo().findOneBy({ id: item.productId });
  if (product!.stock < data.quantity) throw new ValidationError("Insufficient stock");

  item.quantity = data.quantity;
  await cartItemRepo().save(item);

  logger.info(`Cart item updated: userId=${userId}, itemId=${itemId}`);
  const updatedCart = await cartRepo().findOne({ where: { userId } });
  return formatCart(updatedCart!);
};

export const removeItem = async (userId: number, itemId: number) => {
  const cart = await getOrCreateCart(userId);
  const item = cart.items?.find((i) => i.id === itemId);
  if (!item) throw new NotFoundError("Cart item not found");

  await cartItemRepo().remove(item);
  logger.info(`Cart item removed: userId=${userId}, itemId=${itemId}`);

  const updatedCart = await cartRepo().findOne({ where: { userId } });
  return formatCart(updatedCart!);
};

export const clearCart = async (userId: number) => {
  const cart = await getOrCreateCart(userId);
  await cartItemRepo().remove(cart.items);
  logger.info(`Cart cleared: userId=${userId}`);
};
