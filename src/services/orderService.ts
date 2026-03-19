import { AppDataSource } from "../config/database";
import { Order, OrderStatus } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { Cart } from "../models/Cart";
import { CartItem } from "../models/CartItem";
import { Product } from "../models/Product";
import { CreateOrderInput, UpdateOrderStatusInput } from "../schemas/orderSchema";
import { NotFoundError, ValidationError, ForbiddenError } from "../errors/AppError";
import logger from "../config/logger";

const orderRepo = () => AppDataSource.getRepository(Order);
const cartRepo = () => AppDataSource.getRepository(Cart);
const productRepo = () => AppDataSource.getRepository(Product);

export const createOrder = async (userId: number, data: CreateOrderInput) => {
  const cart = await cartRepo().findOne({ where: { userId } });
  if (!cart || !cart.items?.length) throw new ValidationError("Cart is empty");

  // Validate stock for all items before proceeding
  for (const item of cart.items) {
    const product = await productRepo().findOneBy({ id: item.productId });
    if (!product) throw new NotFoundError(`Product ${item.productId} not found`);
    if (product.stock < item.quantity) throw new ValidationError(`Insufficient stock for "${product.name}"`);
  }

  // Build order items and deduct stock
  const orderItems: OrderItem[] = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = await productRepo().findOneBy({ id: item.productId });
    const unitPrice = Number(product!.price);
    const subtotal = unitPrice * item.quantity;

    product!.stock -= item.quantity;
    await productRepo().save(product!);

    const orderItem = orderRepo().manager.create(OrderItem, {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      subtotal,
    });

    orderItems.push(orderItem);
    totalAmount += subtotal;
  }

  const order = orderRepo().create({
    userId,
    shippingAddress: data.shippingAddress,
    totalAmount,
    items: orderItems,
  });

  await orderRepo().save(order);

  // Clear cart after order placed
  await AppDataSource.getRepository(CartItem).remove(cart.items);

  logger.info(`Order created: id=${order.id}, userId=${userId}`);
  return order;
};

export const getUserOrders = async (userId: number) => {
  return orderRepo().find({
    where: { userId },
    order: { createdAt: "DESC" },
  });
};

export const getAllOrders = async () => {
  return orderRepo().find({ order: { createdAt: "DESC" } });
};

export const getOrderById = async (orderId: number, userId: number, role: string) => {
  const order = await orderRepo().findOneBy({ id: orderId });
  if (!order) throw new NotFoundError("Order not found");
  if (role !== "admin" && order.userId !== userId) throw new ForbiddenError("Access denied");
  return order;
};

export const updateOrderStatus = async (orderId: number, data: UpdateOrderStatusInput) => {
  const order = await orderRepo().findOneBy({ id: orderId });
  if (!order) throw new NotFoundError("Order not found");

  if (order.status === OrderStatus.CANCELLED) throw new ValidationError("Cannot update a cancelled order");
  if (order.status === OrderStatus.DELIVERED) throw new ValidationError("Cannot update a delivered order");

  order.status = data.status;
  await orderRepo().save(order);
  logger.info(`Order status updated: id=${orderId}, status=${data.status}`);
  return order;
};

export const cancelOrder = async (orderId: number, userId: number, role: string) => {
  const order = await orderRepo().findOneBy({ id: orderId });
  if (!order) throw new NotFoundError("Order not found");
  if (role !== "admin" && order.userId !== userId) throw new ForbiddenError("Access denied");

  if (order.status === OrderStatus.CANCELLED) throw new ValidationError("Order is already cancelled");
  if (order.status === OrderStatus.DELIVERED) throw new ValidationError("Cannot cancel a delivered order");
  if (order.status === OrderStatus.SHIPPED) throw new ValidationError("Cannot cancel a shipped order");

  // Restore stock
  for (const item of order.items) {
    const product = await productRepo().findOneBy({ id: item.productId });
    if (product) {
      product.stock += item.quantity;
      await productRepo().save(product);
    }
  }

  order.status = OrderStatus.CANCELLED;
  await orderRepo().save(order);
  logger.info(`Order cancelled: id=${orderId}, userId=${userId}`);
  return order;
};
