import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { Cart } from "../models/Cart";
import { CartItem } from "../models/CartItem";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "ecommerce.sqlite",
  synchronize: true,
  logging: false,
  entities: [User, Product, Cart, CartItem, Order, OrderItem],
});
